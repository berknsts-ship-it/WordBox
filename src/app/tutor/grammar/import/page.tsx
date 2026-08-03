import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ImportGrammarSet from "../ImportGrammarSet";

export default function ImportGrammarSetPage() {
  return (
    <div>
      <Link href="/tutor/grammar"
        className="flex items-center gap-1 text-sm mb-5 hover:opacity-70 transition-all"
        style={{ color: "var(--brown-mid)" }}>
        <ChevronLeft size={16} /> Библиотека грамматики
      </Link>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--brown-dark)" }}>
        Импорт набора из JSON
      </h1>
      <ImportGrammarSet />
    </div>
  );
}
