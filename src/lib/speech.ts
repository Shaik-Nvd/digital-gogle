const numberWords = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const tensWords = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function wordsForNumber(value: number): string {
  if (value < 20) return numberWords[value] ?? String(value);
  if (value < 100) return `${tensWords[Math.floor(value / 10)]}${value % 10 ? `-${numberWords[value % 10]}` : ""}`;
  if (value < 1000) return `${numberWords[Math.floor(value / 100)]} hundred${value % 100 ? ` ${wordsForNumber(value % 100)}` : ""}`;
  if (value < 100000) return `${wordsForNumber(Math.floor(value / 1000))} thousand${value % 1000 ? ` ${wordsForNumber(value % 1000)}` : ""}`;
  return String(value);
}

/** Removes visual markup while preserving punctuation and sentence rhythm. */
export function stripMarkdownForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^(#{1,6}|>|[-*+] |\d+\. )\s*/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normaliseSpeech(text: string, indic = false): string {
  return stripMarkdownForSpeech(text)
    .replace(/https?:\/\/\S+/gi, indic ? "हमारी वेबसाइट" : "our website")
    .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, indic ? "हमारा ईमेल" : "our email address")
    .replace(/₹\s?(\d+)(k)?\b/gi, (_, amount: string, k: string | undefined) => {
      const value = Number(amount) * (k ? 1000 : 1);
      return indic ? `${value} रुपये` : `${wordsForNumber(value)} rupees`;
    })
    .replace(/\b(\d{1,2})\s*\/\s*7\b/g, "$1 seven")
    .replace(/\bAI\s*\/\s*ML\b/gi, "A I and M L")
    .replace(/\b(\d{5})[\s-]?(\d{5})\b/g, "$1 $2")
    .replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "")
    .replace(/\b(API|SEO|CRM|RAG|LLM|IOS)\b/g, (match) => match.split("").join(" "))
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateSpeech(text: string, max = 1000): string {
  if (text.length <= max) return text;
  const excerpt = text.slice(0, max);
  const boundary = Math.max(excerpt.lastIndexOf(". "), excerpt.lastIndexOf("? "), excerpt.lastIndexOf("! "), excerpt.lastIndexOf("। "));
  return (boundary > 300 ? excerpt.slice(0, boundary + 1) : excerpt).trim();
}
