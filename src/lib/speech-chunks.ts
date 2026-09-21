const SENTENCE_END = /[.!?…।]/;
const CLOSERS = /[.!?…।"'”’)\]]/;

/**
 * Splits streamed text into finished sentences. A "." is only trusted once whitespace
 * follows it (so "3.5" or a half-arrived "e.g" isn't cut), unless `flush` says the
 * stream is over.
 */
function splitSentences(buffer: string, flush: boolean): { sentences: string[]; rest: string } {
  const sentences: string[] = [];
  let start = 0;
  for (let i = 0; i < buffer.length; i++) {
    const char = buffer[i];
    let end = -1;
    if (char === "\n") {
      end = i + 1;
    } else if (SENTENCE_END.test(char)) {
      let j = i + 1;
      while (j < buffer.length && CLOSERS.test(buffer[j])) j++;
      if (j === buffer.length && !flush) break;
      if (j < buffer.length && !/\s/.test(buffer[j])) {
        i = j - 1;
        continue;
      }
      end = j;
    }
    if (end === -1) continue;
    const sentence = buffer.slice(start, end).trim();
    if (sentence) sentences.push(sentence);
    start = end;
    i = end - 1;
  }
  let rest = buffer.slice(start);
  if (flush && rest.trim()) {
    sentences.push(rest.trim());
    rest = "";
  }
  return { sentences, rest };
}

/**
 * Turns a growing reply into speakable chunks: the first sentence goes out as soon as it
 * exists (lowest time-to-first-audio), later short sentences are merged so the voice
 * keeps natural phrasing instead of speaking in fragments.
 */
export function createSpeechChunker(emit: (chunk: string) => void) {
  let consumed = 0;
  let carry = "";
  let emitted = 0;

  const release = () => {
    const chunk = carry.trim();
    carry = "";
    if (!chunk) return;
    emitted += 1;
    emit(chunk);
  };

  return {
    /** Call with the full reply so far; pass `done` once the stream has ended. */
    update(fullText: string, done = false) {
      const { sentences, rest } = splitSentences(fullText.slice(consumed), done);
      consumed = fullText.length - rest.length;
      for (const sentence of sentences) {
        carry = carry ? `${carry} ${sentence}` : sentence;
        if (carry.length >= (emitted === 0 ? 12 : 70)) release();
      }
      // Latency: a long opening sentence takes seconds to synthesise, so send the first clip at
      // its first comma (once ~25 characters exist) instead of waiting for the sentence to end.
      if (emitted === 0 && !carry && !done) {
        const early = rest.match(/^(.{25,}?[,;:—–])\s/)?.[1];
        if (early) {
          consumed += early.length;
          carry = early;
          release();
        }
      }
      if (done) release();
    },
  };
}
