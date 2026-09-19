import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent pricing for our premium digital services including website development, AI agents, mobile apps, and more.",
};

const pricingTiers = [
  {
    name: "Cybersecurity testing",
    price: "₹30,000 to ₹2,00,000",
    unit: "per service",
  },
  {
    name: "AI agents",
    price: "₹50,000 to ₹15,00,000",
    unit: "per solution",
  },
  {
    name: "Website development",
    price: "₹10,000 to ₹50,00,000",
    unit: "per project",
  },
  {
    name: "Mobile app development",
    price: "₹30,000 to ₹15,00,000",
    unit: "per app",
  },
  {
    name: "Lead generation",
    price: "₹5,000 to ₹1,00,000",
    unit: "per campaign",
  },
  {
    name: "Video editing",
    price: "₹5,000 to ₹2,00,000",
    unit: "per video",
  },
  {
    name: "SEO Services",
    price: "₹8,000 to ₹50,000",
    unit: "per month",
  },
  {
    name: "Social Media Marketing",
    price: "₹7,000 to ₹35,000",
    unit: "per month",
  },
  {
    name: "Content Marketing",
    price: "₹1,500 to ₹5,000",
    unit: "per post",
  },
  {
    name: "Email Marketing",
    price: "₹3,000 to ₹10,000",
    unit: "per month",
  },
  {
    name: "E-commerce Development",
    price: "₹30,000 to ₹1,50,000",
    unit: "per project",
  },
];

export default function PricingPage() {
  return (
    <div className="pt-32 pb-24 md:pb-32 container mx-auto px-6 max-w-7xl min-h-screen">
      <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-glass-border pb-12">
        <div>
          <p className="text-sm font-mono text-accent mb-4 tracking-widest uppercase">Pricing</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
            Transparent Pricing.
          </h1>
        </div>
        <div className="md:text-right text-muted font-mono text-sm uppercase tracking-wider max-w-xs">
          Built for scale and customized to your exact requirements.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pricingTiers.map((tier, idx) => (
          <div key={idx} className="glass-panel p-8 rounded-2xl border border-glass-border hover:border-accent/30 transition-all flex flex-col justify-between min-h-[220px] group">
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-6 group-hover:text-accent transition-colors">{tier.name}</h3>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-2">{tier.price}</div>
              <div className="text-xs md:text-sm text-muted font-mono uppercase tracking-wider">{tier.unit}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-20 text-center glass-panel p-12 rounded-3xl border border-glass-border">
        <h2 className="text-3xl font-bold mb-4">Ready to start your project?</h2>
        <p className="text-muted mb-8 max-w-xl mx-auto">Contact us for a detailed, customized quote based on your exact business requirements.</p>
        <a href="/#contact" className="inline-flex items-center px-8 py-4 bg-accent text-black font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(196,240,66,0.3)]">
          GET A QUOTE <span className="ml-2 text-xl">→</span>
        </a>
      </div>
    </div>
  );
}
