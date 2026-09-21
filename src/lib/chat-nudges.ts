import type { ChatSection } from "./chat-context";

export type Nudge = { text: string; chips: string[] };

/**
 * The line Gogle "says" beside the launcher for the section a visitor is reading.
 * Copy sticks to what the site actually shows (no invented stats or clients).
 */
export function nudgeFor(section: ChatSection, viewed: ChatSection[]): Nudge {
  switch (section) {
    case "work":
      return {
        text: "Like what you see? Tell me what you're building and I'll point you to the project closest to yours. Real estate, e-commerce, education and security are all in here.",
        chips: ["Which project is closest to mine?", "I need an e-commerce site", "Show me your real estate work"],
      };
    case "services":
      return {
        text: "Seven services, but most people only need one or two. Tell me your goal and I'll tell you which fits.",
        chips: ["I want more customers online", "I want to automate something", "I need an app"],
      };
    case "process":
      return {
        text: "We work in five steps: Discover, Design, Develop, Distribute, Deliver. Want to know what each means for your project?",
        chips: ["What do you need from me first?", "How does delivery work?"],
      };
    case "testimonials":
      return {
        text: "Founders from PrimeOra, Fhoneify and UrlScan shared their experience here. Have a project like theirs in mind?",
        chips: ["I have a similar project", "What can you build for me?"],
      };
    case "contact":
      return {
        text: viewed.includes("services")
          ? "You've seen what we do. Skip the form if you like: tell me about your project here and I'll help shape the brief."
          : "Skip the form if you like. Tell me about your project here and I'll help shape the brief, or reach us on WhatsApp.",
        chips: ["Help me write my brief", "Can I get a rough estimate?", "I'd rather use WhatsApp"],
      };
    default:
      return {
        text: "Hey, I'm Gogle 👋 Got a website, app or AI idea in mind? Tell me the goal and I'll point you to the right service.",
        chips: ["I need a website", "I want an AI agent", "Show me your work"],
      };
  }
}
