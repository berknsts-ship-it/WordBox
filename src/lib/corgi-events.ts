// Lets any student-side component (test result, trainer completion, etc.)
// trigger a mascot phrase without prop-drilling through the layout tree.
export const CORGI_EVENT = "wordbox:corgi-say";

export function sayCorgi(text: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<{ text: string }>(CORGI_EVENT, { detail: { text } }));
}
