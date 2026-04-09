const features = [
  {
    tag: "metadata",
    title: "Instant metadata ingest",
    description:
      "Title, channel, publish date, and thumbnail resolved directly from the YouTube URL without any manual input.",
  },
  {
    tag: "context · German",
    title: "Short German summary",
    description:
      "A compact, readable paragraph in German - derived from structured metadata, not invented content. Precise and deliberately brief.",
  },
  {
    tag: "preview",
    title: "Clean video preview card",
    description:
      "Thumbnail, duration overlay, and all key metadata in one glanceable card - before you decide whether to open the video.",
  },
  {
    tag: "model layer",
    title: "Qwen 3.6 reasoning layer",
    description:
      "The context generation runs through Qwen 3.6 - a long-context model with strong coding and agentic reasoning. It structures and compresses what is available, not what it assumes.",
    accent: true,
  },
];

export function FeaturesGrid() {
  return (
    <section className="section-block">
      <div className="section-heading">
        <p className="eyebrow">Capabilities</p>
        <h2>Simple tools, done precisely.</h2>
      </div>

      <div className="feature-grid">
        {features.map((feature) => (
          <article
            key={feature.title}
            className={["feature-card", feature.accent ? "feature-card--accent" : ""]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="feature-tag">{feature.tag}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
