"use client";

import LessonCard from "./LessonCard";
import { X } from "lucide-react";

interface Lesson {
  id: string;
  student_id: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled" | "missed";
  date: string;
  rescheduled_to?: string | null;
  duration_min?: number | null;
  notes?: string | null;
  students?: { name: string } | null;
  payment_status?: "paid" | "unpaid";
  price_rub?: number | null;
  subscription_id?: string | null;
  deducted_amount?: number | null;
}
interface Subscription { id: string; student_id: string; name: string }

// Reuses LessonCard as-is for the actual editing (status change, reschedule,
// full edit form, delete, payment) instead of building a second copy of that
// logic for a calendar-specific popup — it's a self-contained card, not
// tied to the list layout it's normally used in.
export default function LessonDetailModal({
  lesson, subscriptions, onClose,
}: {
  lesson: Lesson;
  subscriptions: Subscription[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(45,30,20,0.35)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg my-8 sm:my-0 relative">
        <button onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: "white", border: "1px solid var(--brown-pale)", color: "var(--brown-mid)" }}>
          <X size={16} />
        </button>
        <LessonCard lesson={lesson} subscriptions={subscriptions} />
      </div>
    </div>
  );
}
