import { AgentGrid } from "./AgentGrid";
import { ClosingCta } from "./ClosingCta";
import { DayTimeline } from "./DayTimeline";
import { FaqAccordion } from "./FaqAccordion";
import { FaqJsonLd, OrganizationJsonLd } from "./FaqJsonLd";
import { FeatureDeepDives } from "./FeatureDeepDives";
import { MarketingFooter } from "./MarketingFooter";
import { MarketingHero } from "./MarketingHero";
import { MarketingNav } from "./MarketingNav";
import { PricingTable } from "./PricingTable";
import { PrivacyTrust } from "./PrivacyTrust";
import { ProductShowcase } from "./ProductShowcase";
import { StickyCta } from "./StickyCta";

export function LandingPageView() {
  return (
    <>
      <OrganizationJsonLd />
      <FaqJsonLd />
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <MarketingNav />
        <main id="main-content">
          <MarketingHero />
          <ProductShowcase />
          <AgentGrid />
          <DayTimeline />
          <FeatureDeepDives />
          <PrivacyTrust />
          <PricingTable />
          <FaqAccordion />
          <ClosingCta />
        </main>
        <MarketingFooter />
        <StickyCta />
      </div>
    </>
  );
}
