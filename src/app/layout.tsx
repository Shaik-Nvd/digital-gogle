import type { Metadata, Viewport } from "next";
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
import { LoadingProvider } from "@/components/providers/LoadingProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://digitalgogle.com"),
  title: {
    default: "Digital Gogle Studio | Web Development & AI Agency in Bangalore",
    template: "%s | Digital Gogle Studio",
  },
  description: "Losing customers to a slow website, manual work or weak security? Digital Gogle Studio builds fast websites, AI agents, mobile apps and marketing systems that bring in and convert customers.",
  keywords: ["Fix slow website", "Get more leads online", "Automate business tasks", "Website redesign Bangalore", "Turn traffic into sales", "Business growth agency"],
  alternates: {
    canonical: "https://digitalgogle.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Digital Gogle Studio | Web Development & AI Agency in Bangalore",
    description: "Losing customers to a slow website, manual work or weak security? Digital Gogle Studio builds fast websites, AI agents, mobile apps and marketing systems that bring in and convert customers.",
    url: "https://digitalgogle.com",
    siteName: "Digital Gogle Studio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Gogle Studio | Web Development & AI Agency in Bangalore",
    description: "Losing customers to a slow website, manual work or weak security? Digital Gogle Studio builds fast websites, AI agents, mobile apps and marketing systems that bring in and convert customers.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080a0c" },
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
  ],
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
          <LoadingProvider>
            <Preloader />
            <SmoothScroll>
              <CustomCursor />
              <Navbar />
              <main className="flex-1 flex flex-col pb-14 md:pb-16">{children}</main>
              <Footer />
              <FixedFooter />
              <ChatWidget />
            </SmoothScroll>
          </LoadingProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
