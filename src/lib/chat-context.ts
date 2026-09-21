export type ChatSection = "hero" | "work" | "services" | "process" | "testimonials" | "contact";

export type ChatContext = {
  currentSection: ChatSection;
  viewedSections: ChatSection[];
  dwellSeconds: Partial<Record<ChatSection, number>>;
  pathname: string;
  referrer: string;
  isReturning: boolean;
  localTime: string;
};

export const CHAT_SECTIONS: ChatSection[] = ["hero", "work", "services", "process", "testimonials", "contact"];
