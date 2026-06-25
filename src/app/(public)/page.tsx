import { LandingHero } from "@/components/landing/landing-hero";
import { LandingTrust } from "@/components/landing/landing-trust";
import { LandingProblemSolution } from "@/components/landing/landing-problem-solution";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingWorkflow } from "@/components/landing/landing-workflow";
import { LandingRoles } from "@/components/landing/landing-roles";
import { LandingAI } from "@/components/landing/landing-ai";
import { LandingSecurity } from "@/components/landing/landing-security";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingFAQ } from "@/components/landing/landing-faq";
import { LandingFinalCta } from "@/components/landing/landing-final-cta";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: `${siteConfig.productLabel} | I2PA`,
  description:
    "Transformez vos idées en projets PI structurés et validés. Plateforme IA pour porteurs, startups et équipes R&D — cabinet I2PA, Mohammedia.",
};

export default function LandingPage() {
  return (
    <div className="landing-page bg-background">
      <LandingHero />
      <LandingTrust />
      <LandingProblemSolution />
      <LandingFeatures />
      <LandingWorkflow />
      <LandingRoles />
      <LandingAI />
      <LandingSecurity />
      <LandingPricing />
      <LandingFAQ />
      <LandingFinalCta />
    </div>
  );
}
