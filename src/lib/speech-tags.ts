/**
 * Expression cues the voice model (Fish S2.1) reads as natural-language bracket
 * tags, e.g. "[warm] Happy to help." They change delivery and are never spoken.
 * Anything outside this list is stripped before synthesis so it can't be read aloud.
 */
export const SPEECH_TAGS = [
  "warm", "friendly", "happy", "excited", "enthusiastic", "calm",
  "confident", "curious", "thoughtful", "compassionate", "reassuring", "professional",
] as const;

const allowed = new Set<string>(SPEECH_TAGS);

// A bracketed word that is NOT a markdown link (no "(" straight after the "]").
const TAG = /\[([A-Za-z][A-Za-z ,'-]{0,40})\](?!\()/g;
const PARTIAL_TAG = /\[[A-Za-z ,'-]{0,40}$/;

/** Hides cues from on-screen text, including a half-streamed "[war" at the tail. */
export function stripSpeechTags(text: string): string {
  return text
    .replace(TAG, "")
    .replace(PARTIAL_TAG, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/^[ \t]+/gm, "");
}

/** Keeps at most `max` known cues (lower-cased) and drops everything else in brackets. */
export function sanitiseSpeechTags(text: string, max = 3): string {
  let kept = 0;
  return text
    .replace(TAG, (_match, name: string) => {
      const key = name.trim().toLowerCase();
      if (!allowed.has(key) || kept >= max) return "";
      kept += 1;
      return `[${key}]`;
    })
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Indian-language scripts (Devanagari through Malayalam) plus Arabic/Urdu. The English voice
 * turns these into gibberish, so text containing them is spoken by the Indian-language voice.
 */
const INDIC_LETTERS = /[؀-ۿऀ-෿]/g;
export function usesIndicScript(text: string): boolean {
  return (text.match(INDIC_LETTERS)?.length ?? 0) >= 2;
}
