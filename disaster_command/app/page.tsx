"use client";

import LandingPageHeader from "@/components/landing/LandingPageHeader";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import DashboardPreviewSection from "@/components/landing/DashboardPreviewSection";
import StatsSection from "@/components/landing/StatsSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30">
      <LandingPageHeader/>
      <HeroSection/>
      <FeaturesSection/>
      <HowItWorksSection/>
      <DashboardPreviewSection/>
      <StatsSection/>
      <CTASection/>
      <LandingFooter/>
    </div>
  );
}
