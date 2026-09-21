import { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent pricing for our premium digital services including website development, AI agents, mobile apps, and more.",
};

export default function PricingPage() {
  return <PricingClient />;
}
