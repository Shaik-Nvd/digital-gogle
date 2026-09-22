export type ServiceData = {
  id: string;
  title: string;
  description: string;
  expandedExtra?: string;
  cta: string;
  tags: string[];
  label: string;
};

/** Services offered, in the site's own words — shared by the Services section and the chat assistant. */
export const services: ServiceData[] = [
  {
    id: "01",
    title: "People visit your website, but nobody calls.",
    description: "Slow, confusing sites lose visitors in seconds. We build fast, clear websites that turn visits into enquiries, bookings, and orders.",
    expandedExtra: "Still running your business on WhatsApp, Excel, and memory? We build simple CRM and business software that keeps every lead, order, and customer in one place.",
    cta: "Get a free website review",
    tags: ["Website & Software Development", "Business Websites", "E-Commerce", "CRM Software", "Custom Web Apps"],
    label: "build.software()",
  },
  {
    id: "02",
    title: "Your customers live on their phones. Your business doesn't.",
    description: "Give customers a fast way to book, order, and come back, without depending on marketplaces that take a cut.",
    cta: "Tell us your app idea",
    tags: ["Mobile App Development", "Android Applications", "iOS Applications", "Custom Business Apps"],
    label: "app.build()",
  },
  {
    id: "03",
    title: "Answering the same customer questions 100 times a day?",
    description: "Your team is buried in repetitive replies, and leads go cold overnight. An AI agent trained on your business answers instantly, 24/7, and hands the serious leads to you.",
    cta: "Try a demo on your own FAQs",
    tags: ["AI Agents & Intelligent Automation", "Custom AI Chatbots", "RAG-Based AI Solutions", "Business Automation", "Custom LLMs"],
    label: "ai.deploy()",
  },
  {
    id: "04",
    title: "Hours lost to copy-paste, spreadsheets, and checking competitor prices?",
    description: "We automate the boring, repetitive work so your team spends time on decisions, not data entry.",
    cta: "Tell us your most annoying manual task",
    tags: ["Web Data & Automation", "Web Scraping", "Data Extraction", "API Integration", "Data Processing"],
    label: "data.automate()",
  },
  {
    id: "05",
    title: "Spending on ads, but the phone isn't ringing?",
    description: "Traffic isn't customers. We fix the path from click to enquiry with SEO, ads, and follow-up that reach people who are ready to buy.",
    cta: "Get a free lead-leak audit",
    tags: ["Lead Generation", "Digital Marketing", "SEO", "Social Media", "Email Outreach", "Online Advertising"],
    label: "growth.scale()",
  },
  {
    id: "06",
    title: "One breach away from losing your customers' trust.",
    description: "We find the weak spots in your website, app, and APIs before attackers do, and tell you exactly how to fix them.",
    cta: "Book a security check",
    tags: ["Cybersecurity & Security Testing", "Website & Web Application Security", "Vulnerability Assessment", "Penetration Testing", "API Security"],
    label: "security.audit()",
  },
  {
    id: "07",
    title: "Posting regularly, but nobody's watching?",
    description: "Scroll-stopping reels and promo videos that make people stop, watch, and enquire.",
    cta: "Send us your raw footage",
    tags: ["Video Editing & Content Creation", "Promotional Videos", "Social Media Reels", "Brand Storytelling"],
    label: "content.produce()",
  },
];
