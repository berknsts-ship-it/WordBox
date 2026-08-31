"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSubscription } from "@/app/actions/subscriptions";
import { Trash2 } from "lucide-react";

export default function DeleteSubscriptionButton({ subscriptionId, studentId, subName }: { subscriptionId: string; studentId: string; subName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={async () => {
        if (!confirm(`Удалить абонемент «${subName}» насовсем? Это нельзя отменить.`)) return;
        setLoading(true);
        await deleteSubscription(subscriptionId, studentId);
        router.refresh();
      }}
      disabled={loading}
      title="Удалить насовсем"
      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 shrink-0"
      style={{ color: "#c0392b" }}>
      <Trash2 size={14} />
    </button>
  );
}
