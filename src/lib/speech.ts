// Browser speech synthesis helper for reading recipes aloud in Urdu and English.

const FEMALE_HINTS = ["female", "zira", "samantha", "susan", "karen", "moira", "tessa", "google"];

function pickVoice(lang: "ur-PK" | "en-US"): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang.slice(0, 2);
  const matches = voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  const pool = matches.length > 0 ? matches : voices.filter((v) => v.lang === "en-US");
  // Prefer a female-sounding voice when the name hints at one.
  return (
    pool.find((v) => FEMALE_HINTS.some((h) => v.name.toLowerCase().includes(h))) ??
    pool[0] ??
    null
  );
}

/** Warm up the voice list early so getVoices() is populated by click time. */
export function warmUpVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.getVoices();
  // Chrome populates voices asynchronously.
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

/** Speak text in the given language. Best female voice auto-selected, slow clear rate. */
export function speakText(
  text: string,
  lang: "ur-PK" | "en-US",
  onEnd?: () => void,
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(lang);
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang ?? lang;
  utterance.rate = 0.9;
  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }
  window.speechSynthesis.speak(utterance);
  return true;
}

/** Speak the Urdu recipe (name + steps). ur-PK voice when available, en-US fallback. */
export function speakRecipeUrdu(text: string, onEnd?: () => void): boolean {
  return speakText(text, "ur-PK", onEnd);
}

/** Stop any speech currently playing. */
export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}
