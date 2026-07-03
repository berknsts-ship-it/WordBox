"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  label = "Сохранить",
  pendingLabel = "Сохраняем...",
  className,
  style,
}: {
  label?: string;
  pendingLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      style={{ ...style, opacity: pending ? 0.65 : 1, cursor: pending ? "default" : "pointer", transition: "opacity 0.15s" }}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
