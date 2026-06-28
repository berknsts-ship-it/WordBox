"use client";

import { useState } from "react";
import ThemeOnboarding from "./ThemeOnboarding";

export default function ThemeOnboardingGate({
  needsOnboarding,
  children,
}: {
  needsOnboarding: boolean;
  children: React.ReactNode;
}) {
  const [done, setDone] = useState(!needsOnboarding);

  return (
    <>
      {children}
      {!done && <ThemeOnboarding onDone={() => setDone(true)} />}
    </>
  );
}
