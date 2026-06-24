"use client";

import { useState } from "react";

export default function CopyLinkButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/student/${code}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="mt-2 w-full rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
      style={
        copied
          ? { background: "var(--brown-mid)", color: "#fff" }
          : { background: "var(--brown-pale)", color: "var(--brown-mid)" }
      }
    >
      {copied ? "✓ Скопировано!" : "Скопировать ссылку"}
    </button>
  );
}
