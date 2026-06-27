import dynamic from "next/dynamic";

const WhiteboardCanvas = dynamic(
  () => import("@/components/student/tabs/WhiteboardCanvas"),
  { ssr: false, loading: () => <div className="flex-1 rounded-3xl animate-pulse" style={{ background: "var(--brown-pale)", minHeight: 400 }} /> }
);

export default function BoardTab({ studentId, boardUrl }: { studentId: string; boardUrl: string | null }) {
  return (
    <div className="space-y-3">
      <WhiteboardCanvas studentId={studentId} />
      {boardUrl && (
        <a href={boardUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-sm font-semibold transition-all hover:opacity-80"
          style={{ background: "var(--brown-pale)", color: "var(--brown-mid)" }}>
          🔗 Открыть внешнюю доску
        </a>
      )}
    </div>
  );
}
