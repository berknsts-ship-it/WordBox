"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createSubscription(studentId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const name         = (formData.get("name") as string)?.trim() || "Абонемент";
  const totalAmount  = parseInt(formData.get("total_amount") as string);
  if (!totalAmount || totalAmount <= 0) return { error: "Введите сумму абонемента" };

  // Опционально: сразу расставить занятия по календарю. Дни недели задаёт
  // тьютор явно (не "раз в неделю от даты первого занятия") — у части
  // учеников занятия дважды в неделю, у части один раз. Цена одного
  // занятия — total_amount, делённая на их количество, а не какое-то
  // предположение о стоимости урока.
  const lessonCount = parseInt(formData.get("lesson_count") as string) || 0;
  const firstDate    = formData.get("first_date") as string | null;
  const time          = formData.get("time") as string | null;
  const durationMin  = parseInt(formData.get("duration_min") as string) || 60;
  const weekdays = ((formData.get("weekdays") as string) || "")
    .split(",").map(s => parseInt(s)).filter(n => !isNaN(n));
  const scheduleNow  = lessonCount > 0 && !!firstDate && !!time && weekdays.length > 0;

  const db = createAdminClient();
  const { data: sub, error } = await db.from("student_subscriptions").insert({
    tutor_id:     user.id,
    student_id:   studentId,
    name,
    total_amount: totalAmount,
    balance:      totalAmount,
    status:       "active",
    // Persisted so the summary can show "6 из 8 занятий", not just money —
    // previously this was only ever used transiently to auto-schedule the
    // first batch of lessons below, never saved on the subscription itself.
    lesson_count: lessonCount || null,
  }).select("id").single();

  if (error) return { error: error.message };

  if (scheduleNow) {
    const priceRub = Math.round(totalAmount / lessonCount);
    const p2 = (n: number) => String(n).padStart(2, "0");
    const rows: { tutor_id: string; student_id: string; date: string; duration_min: number; price_rub: number; subscription_id: string }[] = [];
    const d = new Date(`${firstDate}T00:00:00`);
    while (rows.length < lessonCount) {
      if (weekdays.includes(d.getDay())) {
        const naiveDate = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
        rows.push({
          tutor_id:        user.id,
          student_id:      studentId,
          date:            `${naiveDate}T${time}:00`,
          duration_min:    durationMin,
          price_rub:       priceRub,
          subscription_id: sub.id,
        });
      }
      d.setDate(d.getDate() + 1);
    }
    const { error: lessonsError } = await db.from("lessons").insert(rows);
    // Абонемент уже создан и это самое важное — если расстановка занятий не
    // удалась, не откатываем его, просто сообщаем и она добавит дни вручную
    // через «Расписание» (там уже подхватится этот же активный абонемент).
    if (lessonsError) {
      revalidatePath(`/tutor/students/${studentId}`);
      return { error: `Абонемент создан, но не удалось расставить занятия: ${lessonsError.message}` };
    }
    revalidatePath("/tutor/schedule");
  }

  revalidatePath(`/tutor/students/${studentId}`);
}

export async function renewSubscription(subscriptionId: string, studentId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const db = createAdminClient();
  const { data: sub } = await db.from("student_subscriptions").select("total_amount, balance, lesson_count").eq("id", subscriptionId).eq("tutor_id", user.id).single();
  if (!sub) return { error: "Абонемент не найден" };

  // Renewing by lesson count (the normal case once a subscription has a
  // known package size) derives the money from the existing package's
  // average price per lesson — same "оплатил 8 → ходит 8" mental model as
  // the summary itself, instead of asking for a ₽ figure every time.
  // Falls back to a raw amount for subscriptions with no lesson_count set.
  const addLessons = parseInt(formData.get("add_lessons") as string) || 0;
  let addAmount = parseInt(formData.get("add_amount") as string) || 0;
  let lessonCountDelta = 0;

  if (addLessons > 0 && sub.lesson_count) {
    const pricePerLesson = sub.total_amount / sub.lesson_count;
    addAmount = Math.round(pricePerLesson * addLessons);
    lessonCountDelta = addLessons;
  }
  if (!addAmount || addAmount <= 0) return { error: "Введите количество занятий или сумму пополнения" };

  const { error } = await db.from("student_subscriptions").update({
    total_amount: sub.total_amount + addAmount,
    balance:      sub.balance + addAmount,
    ...(lessonCountDelta ? { lesson_count: (sub.lesson_count ?? 0) + lessonCountDelta } : {}),
  }).eq("id", subscriptionId).eq("tutor_id", user.id);

  if (error) return { error: error.message };
  revalidatePath(`/tutor/students/${studentId}`);
}

// Прямая правка суммы уже существующего абонемента (не пополнение, а
// исправление изначально введённой цифры). Сдвигаем total_amount и balance
// на одну и ту же дельту — то, что уже списано за проведённые уроки
// (total_amount - balance = spent), остаётся как было: задним числом
// прошлые списания не пересчитываются, меняется только сумма контракта
// вперёд. Если новая сумма окажется меньше уже списанного — баланс уйдёт в
// минус, это ожидаемо и уже поддерживается в UI (красным).
export async function updateSubscriptionAmount(subscriptionId: string, studentId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const newTotal = parseInt(formData.get("total_amount") as string);
  if (!newTotal || newTotal <= 0) return { error: "Введите сумму абонемента" };
  // Optional — lets the tutor correct/set the package size directly (e.g.
  // for an older subscription that predates this field). Empty clears it
  // back to unknown rather than forcing a value.
  const lessonCountRaw = formData.get("lesson_count") as string | null;
  const lessonCount = lessonCountRaw?.trim() ? parseInt(lessonCountRaw) : null;

  const db = createAdminClient();
  const { data: sub } = await db.from("student_subscriptions").select("total_amount, balance").eq("id", subscriptionId).eq("tutor_id", user.id).single();
  if (!sub) return { error: "Абонемент не найден" };

  const delta = newTotal - sub.total_amount;
  const { error } = await db.from("student_subscriptions").update({
    total_amount: newTotal,
    balance:      sub.balance + delta,
    ...(lessonCountRaw !== null ? { lesson_count: lessonCount } : {}),
  }).eq("id", subscriptionId).eq("tutor_id", user.id);

  if (error) return { error: error.message };
  revalidatePath(`/tutor/students/${studentId}`);
}

// Абонемент оплачивается целиком одной суммой — если он оплачен, все уроки,
// которые с него списываются, тоже фактически оплачены (деньги уже получены
// вперёд). Синхронизируем payment_status у уже привязанных уроков в обе стороны,
// чтобы не было противоречия «абонемент оплачен, а урок — нет».
export async function toggleSubscriptionPaid(subscriptionId: string, studentId: string, current: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const db = createAdminClient();
  const nextPaid = !current;
  const { error } = await db.from("student_subscriptions")
    .update({ paid: nextPaid })
    .eq("id", subscriptionId)
    .eq("tutor_id", user.id);

  if (error) return { error: error.message };

  await db.from("lessons")
    .update({ payment_status: nextPaid ? "paid" : "unpaid" })
    .eq("subscription_id", subscriptionId);

  revalidatePath(`/tutor/students/${studentId}`);
  revalidatePath("/tutor/schedule");
}

export async function cancelSubscription(subscriptionId: string, studentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const db = createAdminClient();
  const { error } = await db.from("student_subscriptions")
    .update({ status: "cancelled" })
    .eq("id", subscriptionId)
    .eq("tutor_id", user.id);

  if (error) return { error: error.message };
  revalidatePath(`/tutor/students/${studentId}`);
}

// Actually removes the subscription row — for a subscription that was a
// mistake (wrong student/amount, created while testing), not a real one
// that ran its course. cancelSubscription (above) is for the latter: a
// real subscription that legitimately ended, kept around as a record.
// Lessons that were linked to it aren't deleted — subscription_id just
// goes back to null (ON DELETE SET NULL) — but any amount already
// deducted from this subscription's balance is gone with it, so this
// only makes sense for subscriptions with no real history yet.
export async function deleteSubscription(subscriptionId: string, studentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const db = createAdminClient();
  const { error } = await db.from("student_subscriptions")
    .delete()
    .eq("id", subscriptionId)
    .eq("tutor_id", user.id);

  if (error) return { error: error.message };
  revalidatePath(`/tutor/students/${studentId}`);
}
