"use client";

import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { resolveChatLink } from "@/lib/chat-links";

const TOKEN = /(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*)/g;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;
const BOLD = /^\*\*([^*]+)\*\*$/;

const linkClass =
  "inline-flex items-center gap-0.5 font-medium text-accent underline decoration-accent/40 underline-offset-2 transition-colors hover:decoration-accent";

function renderInline(line: string, onSection: (id: string) => void, keyPrefix: string): ReactNode[] {
  return line.split(TOKEN).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    const link = part.match(LINK);
    if (link) {
      const [, label, href] = link;
      const target = resolveChatLink(href);
      // Not on the whitelist (invented URL, other domain): show the words, drop the link.
      if (!target) return label;
      if (target.kind === "section") {
        return (
          <a
            key={key}
            href={`#${target.id}`}
            onClick={(event) => {
              event.preventDefault();
              onSection(target.id);
            }}
            className={linkClass}
          >
            {label}
            <ArrowUpRight size={12} aria-hidden className="rotate-90" />
          </a>
        );
      }
      return (
        <a key={key} href={target.href} target={target.newTab ? "_blank" : undefined} rel="noreferrer noopener" className={linkClass}>
          {label}
          {target.newTab && <ArrowUpRight size={12} aria-hidden />}
        </a>
      );
    }
    const bold = part.match(BOLD);
    // Models often wrap a link in bold; render the link inside instead of showing raw markdown.
    return bold ? <strong key={key} className="font-semibold">{renderInline(bold[1], onSection, `${key}-b`)}</strong> : part;
  });
}

/** Tiny, safe renderer for assistant replies: bold, whitelisted links and simple bullet lists. */
export default function MessageContent({ text, onSection }: { text: string; onSection: (id: string) => void }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = (key: string) => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={key} className="my-1 list-disc space-y-1 pl-5">
        {bullets.map((item, index) => <li key={index}>{renderInline(item, onSection, `${key}-${index}`)}</li>)}
      </ul>,
    );
    bullets = [];
  };

  lines.forEach((line, index) => {
    const bullet = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[1]);
      return;
    }
    flushBullets(`list-${index}`);
    if (line.trim()) blocks.push(<p key={`p-${index}`} className="[&:not(:first-child)]:mt-2">{renderInline(line, onSection, `p-${index}`)}</p>);
  });
  flushBullets("list-end");

  return <>{blocks}</>;
}
