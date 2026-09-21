import { projects } from "./projects";

/** Sections of the single-page site the assistant may send a visitor to. */
export const SECTION_LINKS = ["work", "services", "process", "testimonials", "contact"] as const;
export type SectionLink = (typeof SECTION_LINKS)[number];

export type ChatLink =
  | { kind: "section"; id: SectionLink }
  | { kind: "external"; href: string; newTab: boolean };

const trim = (url: string) => url.replace(/\/+$/, "");
const projectUrls = new Set(projects.map((project) => trim(project.url)));

/**
 * The only destinations a model-written link may point at. Anything else (a hallucinated
 * URL, a different domain) resolves to null and is rendered as plain text.
 */
export function resolveChatLink(href: string): ChatLink | null {
  const hash = href.startsWith("#") ? href.slice(1) : href.startsWith("/#") ? href.slice(2) : null;
  if (hash !== null) {
    return (SECTION_LINKS as readonly string[]).includes(hash) ? { kind: "section", id: hash as SectionLink } : null;
  }
  if (projectUrls.has(trim(href))) return { kind: "external", href, newTab: true };
  if (href.startsWith("https://wa.me/918553627474")) return { kind: "external", href, newTab: true };
  if (href === "mailto:mail2nvd@gmail.com") return { kind: "external", href, newTab: false };
  if (/^tel:\+?(91)?8553627474$/.test(href)) return { kind: "external", href, newTab: false };
  return null;
}
