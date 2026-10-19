// English text-to-speech shared by the board, trainer and vocabulary lists.
//
// Setting utterance.lang alone is not enough: Yandex Browser, many Android
// phones and some Windows setups ignore it and read the word with the
// system's default (Russian) voice — English words come out with a heavy
// Russian accent. So we pick an actual English voice explicitly.

let cachedVoice: SpeechSynthesisVoice | null = null;

// Better-sounding voices first; anything en-GB/en-US after that; any en-* last.
const PREFERRED = [
  /Google UK English/i, /Google US English/i,
  /Microsoft .*(Sonia|Libby|Ryan|Aria|Jenny|Guy).*Natural/i,
  /^(Daniel|Kate|Serena|Samantha|Karen|Moira|Tessa)\b/i,
  /Microsoft (Hazel|George|Susan|Zira|David|Mark)/i,
];

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const english = voices.filter(v => /^en([-_]|$)/i.test(v.lang));
  if (english.length === 0) return null;
  for (const re of PREFERRED) {
    const v = english.find(v => re.test(v.name));
    if (v) return v;
  }
  return english.find(v => /^en[-_]GB/i.test(v.lang))
    ?? english.find(v => /^en[-_]US/i.test(v.lang))
    ?? english[0];
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  // Voice lists load asynchronously in Chrome-based browsers.
  cachedVoice = pickVoice();
  window.speechSynthesis.addEventListener?.("voiceschanged", () => { cachedVoice = pickVoice(); });
}

export function speakEnglish(text: string, rate = 0.85) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  if (!cachedVoice) cachedVoice = pickVoice();
  const u = new SpeechSynthesisUtterance(text);
  if (cachedVoice) { u.voice = cachedVoice; u.lang = cachedVoice.lang; }
  else u.lang = "en-GB";
  u.rate = rate;
  synth.speak(u);
}

// For diagnostics: is there any English voice on this device at all?
export function hasEnglishVoice(): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  return pickVoice() !== null;
}
