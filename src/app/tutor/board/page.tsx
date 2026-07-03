import { createClient } from "@/lib/supabase/server";
import { getSnapshots } from "@/app/actions/board";
import TutorBoardHub from "@/components/tutor/TutorBoardHub";

export default async function TutorBoardPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const { student: studentParam } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: students } = await supabase
    .from("students")
    .select("id, name, canvas_url")
    .eq("tutor_id", user!.id)
    .order("name");

  const list = students ?? [];
  const initialId = studentParam && list.some(s => s.id === studentParam)
    ? studentParam
    : (list[0]?.id ?? null);

  const initialSnapshots = initialId ? await getSnapshots(initialId) : [];

  return (
    <div className="-mx-4 -mt-5 sm:-mt-8 -mb-5 sm:-mb-8 flex flex-col" style={{ height: "calc(100dvh - 56px)" }}>
      <TutorBoardHub
        students={list}
        initialId={initialId}
        initialSnapshots={initialSnapshots as unknown as Parameters<typeof TutorBoardHub>[0]["initialSnapshots"]}
      />
    </div>
  );
}
