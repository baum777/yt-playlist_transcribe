const steps = [
  {
    number: "01",
    title: "Paste URL",
    description:
      "Drop a single YouTube video URL into the input. The app accepts standard watch links and short youtu.be formats.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 7h8M8 12h5M8 17h8" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Ingest metadata",
    description:
      "Title, channel, publish date, thumbnail, and available description are extracted and structured for the reasoning layer.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="6" width="14" height="12" rx="2" />
        <path d="M9 10h6M9 14h4" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Read context",
    description:
      "Qwen 3.6 compresses available metadata into a concise German context summary. Honest about what it knows - no invented claims.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 8h10M7 12h7M7 16h5" />
        <path d="M17 16l2 2 3-4" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="section-block">
      <div className="section-heading">
        <p className="eyebrow">Process</p>
        <h2>Three steps. Instant output.</h2>
      </div>

      <div className="step-grid">
        {steps.map((step) => (
          <article key={step.number} className="step-card">
            <div className="step-card__top">
              <span className="step-card__number">{step.number}</span>
              <span className="step-card__icon">{step.icon}</span>
            </div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
