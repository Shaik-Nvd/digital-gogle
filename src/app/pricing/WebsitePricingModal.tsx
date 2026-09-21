"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const websitePricingCategories = [
  {
    title: "Simple / Brochure Websites",
    priceRange: "₹30,000 – ₹80,000",
    desc: "Best for businesses that mainly need to show information, build trust and generate enquiries.",
    types: ["Business website", "Company website", "Corporate profile website", "Personal website", "Portfolio website", "Freelancer website", "Consultant website", "Professional profile website", "Startup website", "Agency website", "Service-based website", "Restaurant / café website", "Salon / spa website", "Gym / fitness website", "Clinic / doctor website", "Lawyer / legal website", "Real-estate agent website", "Construction company website", "Interior designer website", "Architect website", "School / small institute website", "NGO website", "Event website", "Basic blog website", "Basic informational website"],
    features: "Typical: 5–10 pages, responsive design, contact form, WhatsApp, basic SEO, Google Maps, social links."
  },
  {
    title: "Basic to Advanced Marketing Websites",
    priceRange: "₹50,000 – ₹1,50,000",
    desc: "These are more customized and focused on leads, branding and conversion.",
    types: ["Premium business website", "Corporate website", "Brand website", "Startup landing website", "Lead-generation website", "Multi-page marketing website", "Real-estate project website", "Hotel / resort website", "Travel agency website", "Education institute website", "Coaching institute website", "Digital marketing agency website", "SaaS marketing website", "Product showcase website", "Manufacturer website", "Industrial website", "Export/import company website", "Multi-location business website", "Recruitment company website", "Job consultancy website", "Medical centre website", "Hospital website", "News/content website", "Magazine website", "Blog + CMS website", "Directory-style informational website"]
  },
  {
    title: "Mid-Range Websites",
    priceRange: "₹80,000 – ₹2,00,000+",
    desc: "These introduce dynamic functionality, CMS, databases, integrations or more advanced UX.",
    types: ["Advanced corporate website", "Advanced e-commerce website", "Product catalogue website", "Digital catalogue website", "Booking website", "Appointment website", "Restaurant ordering website", "Hotel booking website", "Property listing website", "Real-estate website", "Job listing website", "Course website", "Learning website", "Membership website", "Community website", "Directory website", "Event management website", "Subscription website", "Customer portal", "Vendor portal", "Basic client portal", "CRM-connected website", "API-integrated website", "Payment gateway website", "WhatsApp/API automation website", "Advanced blog/news platform", "Multi-author content website", "Custom admin dashboard"],
    features: "A catalogue, booking system or e-commerce site becomes considerably more complex once it involves accounts, payments, inventory, order management or other integrations."
  },
  {
    title: "Complex Web Platforms",
    priceRange: "₹2,00,000 – ₹5,00,000+",
    desc: "Now you're moving from a \"website\" toward a web application/platform.",
    types: ["E-commerce platform", "Multi-vendor marketplace", "B2B marketplace", "B2C marketplace", "Real-estate marketplace", "Job marketplace", "Service marketplace", "Rental marketplace", "Vendor management platform", "Booking platform", "Travel booking platform", "Education platform", "Learning Management System (LMS)", "Student management portal", "Employee portal", "Customer portal", "Vendor portal", "Dealer portal", "Membership platform", "Community platform", "Subscription platform", "Custom CRM", "Sales management system", "Inventory management system", "Order management system", "Project management system", "Appointment management system", "Custom dashboard", "Reporting/analytics platform", "Data management platform", "Document management system", "Workflow automation platform"],
    features: "Portals typically introduce authentication, user roles and personalized dashboards, while web applications add business logic and workflows."
  },
  {
    title: "Highly Tailored / Custom Platforms",
    priceRange: "₹3,00,000 – ₹10,00,000+",
    desc: "These are software products delivered through the browser, rather than conventional websites.",
    types: ["SaaS", "SaaS platform", "AI SaaS", "CRM SaaS", "HR SaaS", "Marketing SaaS", "Analytics SaaS", "Project management SaaS", "Automation SaaS", "Communication SaaS", "Document SaaS", "AI Platforms", "AI chatbot platform", "Custom AI assistant", "AI agent platform", "AI automation platform", "RAG platform", "AI content generation platform", "AI document analysis platform", "AI lead-generation platform", "AI customer-support platform", "AI workflow platform", "Enterprise Systems", "ERP", "CRM", "HRMS", "TMS", "LMS", "Inventory system", "Procurement system", "Finance management system", "Employee management system", "Enterprise portal", "Business intelligence dashboard", "Custom Platforms", "Marketplace platform", "FinTech platform", "Healthcare platform", "Logistics platform", "Real-estate platform", "Recruitment platform", "EdTech platform", "PropTech platform", "HealthTech platform", "TravelTech platform", "LegalTech platform", "Customer-service platform", "Internal enterprise application"],
    features: "Enterprise web applications generally require stronger security, scalability, role-based access, auditability and integrations."
  }
];

const summaries = [
  { name: "Landing Pages", price: "₹15K" },
  { name: "Brochure Websites", price: "₹30K" },
  { name: "Professional Websites", price: "₹50K" },
  { name: "Advanced Business Websites", price: "₹80K" },
  { name: "Custom Web Platforms", price: "₹2L" },
  { name: "SaaS / AI / Enterprise", price: "₹3L–₹10L+" },
];

export default function WebsitePricingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Prevent scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto glass-panel rounded-3xl border border-glass-border shadow-2xl bg-background"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors z-10"
            >
              <X size={24} className="text-foreground" />
            </button>

            <div className="p-8 md:p-12 space-y-12">
              <div className="space-y-4 max-w-3xl pr-8">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Website Development Pricing</h2>
                <p className="text-muted text-lg">A detailed breakdown of our pricing tiers based on complexity and requirements.</p>
              </div>

              {/* Summary Tier Chart */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {summaries.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-foreground/5 border border-glass-border flex flex-col justify-center items-center text-center hover:border-accent/50 transition-colors">
                    <span className="text-2xl font-bold text-accent mb-2">{item.price}</span>
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                  </div>
                ))}
              </div>

              {/* Landing Page Special Section */}
              <div className="p-6 md:p-8 rounded-3xl bg-accent/5 border border-accent/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <div className="text-9xl font-black text-accent">₹15K</div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-3 flex items-center gap-3 flex-wrap">
                    Landing Pages <span className="text-accent">— ₹15,000</span>
                  </h3>
                  <p className="text-foreground/80 max-w-3xl text-lg leading-relaxed">
                    Because a landing page is fundamentally different from a full website: it is usually designed around one specific conversion goal such as lead generation, registration, product launch or an advertising campaign.
                  </p>
                </div>
              </div>

              {/* Detailed Categories */}
              <div className="space-y-8">
                <h3 className="text-2xl font-bold border-b border-glass-border pb-4">Detailed Breakdown</h3>
                {websitePricingCategories.map((category, idx) => (
                  <div key={idx} className="p-6 md:p-8 rounded-3xl glass-panel border border-glass-border hover:border-accent/30 transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-xl font-bold text-muted-foreground">{idx + 1}.</span>
                          <h4 className="text-2xl font-bold">{category.title}</h4>
                        </div>
                        <p className="text-foreground/70 text-lg">{category.desc}</p>
                      </div>
                      <div className="whitespace-nowrap bg-accent/10 px-6 py-3 rounded-full border border-accent/20 self-start">
                        <span className="text-xl font-bold text-accent">{category.priceRange}</span>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h5 className="text-sm font-mono text-muted mb-4 uppercase tracking-wider">Example Types</h5>
                      <div className="flex flex-wrap gap-2">
                        {category.types.map((type, tIdx) => (
                          <span key={tIdx} className="px-3 py-1.5 rounded-lg bg-foreground/5 text-sm text-foreground/80 border border-glass-border/50 hover:bg-foreground/10 transition-colors">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {category.features && (
                      <div className="mt-6 p-4 rounded-2xl bg-foreground/5 border border-glass-border/50 text-foreground/80 italic">
                        {category.features}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
