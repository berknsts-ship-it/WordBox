"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteMaterial } from "@/app/actions/materials";
import { showToast } from "@/components/ui/toaster";

export function DeleteMaterialButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteMaterial(id);
      showToast("Материал удалён");
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="p-2 rounded-xl transition-colors hover:bg-red-50 shrink-0 disabled:opacity-40"
      style={{ color: "var(--brown-light)" }}
      title="Удалить"
    >
      {pending ? <span className="text-xs">...</span> : <Trash2 size={16} />}
    </button>
  );
}
