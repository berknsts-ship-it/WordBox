import Link from "next/link";

export default function TrainerSubNav({
  code,
  active,
}: {
  code: string;
  active: "lexicon" | "exercises";
}) {
  const items: { id: "lexicon" | "exercises"; label: string }[] = [
    { id: "lexicon", label: "Лексика" },
    { id: "exercises", label: "Упражнения" },
  ];

  return (
    <div className="flex gap-2 mb-5">
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <Link
            key={item.id}
            href={item.id === "lexicon" ? `/student/${code}?tab=trainer` : `/student/${code}?tab=trainer&sub=exercises`}
            className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
            style={
              isActive
                ? { background: "var(--gradient-primary)", color: "white" }
                : { color: "var(--brown-mid)", border: "1px solid var(--brown-pale)", background: "transparent" }
            }
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
