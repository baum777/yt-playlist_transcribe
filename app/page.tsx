import { FeaturesGrid } from "@/components/features-grid";
import { HowItWorks } from "@/components/how-it-works";
import { InfoTabs } from "@/components/info-tabs";
import { LandingControls } from "@/components/landing-controls";
import { Nav } from "@/components/nav";
import { QwenSection } from "@/components/qwen-section";
import { ResultCard } from "@/components/result-card";

export default function Page() {
  return (
    <main className="page-shell">
      <Nav />

      <section className="hero">
        <p className="eyebrow">Instant video context</p>
        <h1>
          Paste a YouTube link. <span>Get the context instantly.</span>
        </h1>
        <p className="hero-copy">
          Drop any YouTube URL and get back the thumbnail, metadata, and a short German
          contextual summary - powered by Qwen 3.6 reasoning.
        </p>

        <LandingControls />
      </section>

      <section className="demo-stack" aria-label="Result preview">
        <ResultCard data={null} isDemo />
      </section>

      <HowItWorks />
      <FeaturesGrid />
      <QwenSection />

      <section className="panel panel-tabs">
        <InfoTabs />
      </section>

      <footer className="site-footer">
        <span>Built for fast video context · Lightweight, honest, focused</span>
        <span className="site-footer__powered">● Powered by Qwen 3.6</span>
      </footer>
    </main>
  );
}
