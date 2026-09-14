// Lets any student-side component (test result, trainer completion, etc.)
// trigger a mascot phrase without prop-drilling through the layout tree.
export const CORGI_EVENT = "wordbox:corgi-say";

export function sayCorgi(text: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<{ text: string }>(CORGI_EVENT, { detail: { text } }));
}

// The corgi's own default position (bottom-left) was picked to stay clear of
// the board's minimap (bottom-right) — but the board's mobile text editor is
// a full-width sheet that slides up from the bottom, and on a phone/tablet
// that put the corgi (z-index 999, above the sheet's 300) sitting right on
// top of the text being typed. Same event-without-prop-drilling pattern as
// sayCorgi above: the board just announces "something's being edited right
// where I usually sit," and the mascot hides itself (fully — not even the
// small paw icon) for as long as that's true.
export const CORGI_HIDE_EVENT = "wordbox:corgi-hide";

export function setCorgiHiddenForEditing(hidden: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<{ hidden: boolean }>(CORGI_HIDE_EVENT, { detail: { hidden } }));
}
