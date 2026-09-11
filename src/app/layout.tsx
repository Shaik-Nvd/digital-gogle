import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FixedFooter from "@/components/layout/FixedFooter";
import CustomCursor from "@/components/ui/CustomCursor";
import Preloader from "@/components/ui/Preloader";
import ChatWidget from "@/components/chat/ChatWidget";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Digital Gogle Studio | Premium Web & AI Agency",
    template: "%s | Digital Gogle Studio",
  },
  description: "Digital Gogle Studio engineers premium digital systems. We specialize in high-performance web development, AI integrations, mobile apps, and elite digital marketing strategies in Bangalore and globally.",
  keywords: ["Cybersecurity Testing", "Penetration Testing", "Custom AI Agents", "RAG AI Solutions", "Business Automation", "Web Development Bangalore", "E-Commerce Websites", "Mobile App Development", "Web Scraping", "API Integration", "Lead Generation", "SEO", "Digital Marketing", "Video Editing", "Premium Digital Agency"],
  openGraph: {
    title: "Digital Gogle Studio | Elite Digital Engineering",
    description: "Building scalable digital experiences, immersive 3D interfaces, and AI-driven growth systems.",
    url: "https://digitalgogle.com",
    siteName: "Digital Gogle Studio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Gogle Studio | Premium Web & AI Agency",
    description: "Building scalable digital experiences, immersive 3D interfaces, and AI-driven growth systems.",
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`} suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen flex flex-col selection:bg-accent selection:text-black">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SmoothScroll>
            <Preloader />
            <CustomCursor />
            <Navbar />
            <main className="flex-1 flex flex-col pb-14 md:pb-16">{children}</main>
            <Footer />
            <FixedFooter />
            <ChatWidget />
          </SmoothScroll>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
