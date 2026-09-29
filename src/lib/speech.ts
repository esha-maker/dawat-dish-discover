// Browser speech synthesis helper for reading recipes aloud in Urdu.

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith("ur")) ??
    voices.find((v) => v.lang === "en-US") ??
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

/** Speak the Urdu recipe (name + steps). ur-PK voice when available, en-US fallback. */
export function speakRecipeUrdu(text: string, onEnd?: () => void): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang ?? "ur-PK";
  utterance.rate = 0.95;
  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }
  window.speechSynthesis.speak(utterance);
  return true;
}

/** Stop any speech currently playing. */
export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}
