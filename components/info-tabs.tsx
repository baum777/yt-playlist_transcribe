"use client";

import { useState } from "react";

import { FaqAccordion } from "./faq-accordion";

type TabKey = "how" | "faq";

const howToUseSteps = [
  "Open the app and locate the URL input - The input is centered in the hero section. It accepts any valid YouTube URL in standard or short format.",
  "Paste your YouTube URL - Use Ctrl+V or right-click -> Paste. Accepts youtube.com/watch?v= and youtu.be/ links.",
  "Wait for the ingest - usually under a second - The app fetches metadata, loads the thumbnail, and sends the structured data to Qwen 3.6 for context generation.",
  "Review the result card - The card shows thumbnail, title, channel, publish date, and a short German context paragraph. The Qwen 3.6 label indicates the model layer used.",
];

const faqItems = [
  {
    question: "What kind of YouTube URLs work?",
    answer:
      "Standard watch links (youtube.com/watch?v=...) and short links (youtu.be/...) both work. Private, age-restricted, or region-blocked videos may not return full metadata.",
  },
  {
    question: "Does this summarize the full video?",
    answer:
      "No. The context is based on available metadata - title, channel, description, and publish date. The app does not access or process video transcripts or audio content.",
  },
  {
    question: "Is the result based on metadata or transcript?",
    answer:
      "Metadata only. Qwen 3.6 structures and compresses what is publicly available in the video's metadata fields. This is intentional - it keeps results fast, honest, and grounded.",
  },
  {
    question: "Is anything stored?",
    answer:
      "No user data or URLs are persisted beyond the active session. Each request is stateless and not logged.",
  },
  {
    question: "Why is the summary intentionally short?",
    answer:
      "A short, precise context paragraph is more immediately useful than a lengthy paraphrase. The goal is to help you decide whether to watch - not to replace watching. Brevity is a design decision, not a limitation.",
  },
  {
    question: "What does Qwen 3.6 do here?",
    answer:
      "Qwen 3.6 receives the structured metadata as input and generates a compact German context summary. It acts as a structured reasoning and compression layer - not a general knowledge retrieval system.",
  },
];

export function InfoTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>("how");

  return (
    <section className="info-tabs">
      <div className="tab-bar" role="tablist" aria-label="Help section tabs">
        <button
          type="button"
          role="tab"
          id="tab-how"
          aria-selected={activeTab === "how"}
          aria-controls="tabpanel-how"
          className={activeTab === "how" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("how")}
        >
          How to use
        </button>
        <button
          type="button"
          role="tab"
          id="tab-faq"
          aria-selected={activeTab === "faq"}
          aria-controls="tabpanel-faq"
          className={activeTab === "faq" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("faq")}
        >
          FAQ
        </button>
      </div>

      <div
        className="tab-panel"
        role="tabpanel"
        id="tabpanel-how"
        aria-labelledby="tab-how"
        hidden={activeTab !== "how"}
      >
        <h2>How to use</h2>
        <ol className="step-list">
          {howToUseSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>

      <div
        className="tab-panel"
        role="tabpanel"
        id="tabpanel-faq"
        aria-labelledby="tab-faq"
        hidden={activeTab !== "faq"}
      >
        <h2>FAQ</h2>
        <FaqAccordion items={faqItems} />
      </div>
    </section>
  );
}
