export default function BoardTab({ boardUrl }: { boardUrl: string | null }) {
  if (!boardUrl) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-3">🖊️</p>
        <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>Доска ещё не прикреплена</p>
        <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>
          Репетитор добавит ссылку на доску
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden border" style={{ borderColor: "var(--brown-pale)" }}>
      <iframe
        src={boardUrl}
        className="w-full"
        style={{ height: "clamp(400px, 75vh, 900px)", border: "none", display: "block" }}
        allowFullScreen
      />
    </div>
  );
}
