const badges = ["qwen-3.6", "long context", "coding-strong", "agentic", "structured output"];

export function QwenSection() {
  return (
    <section className="section-block">
      <article className="qwen-panel">
        <div className="qwen-panel__copy">
          <p className="eyebrow">Intelligence layer</p>
          <h2>Built with Qwen 3.6</h2>
          <p>
            Qwen 3.6 is a long-context model optimized for structured reasoning, coding-grade
            analysis, and agent-style workflows. Here it is used as a practical compression and
            structuring layer: it reads structured metadata and produces a grounded, readable
            context paragraph. No transcript ingestion, no invented semantics - just reliable
            inference from what is actually available.
          </p>
        </div>

        <div className="qwen-panel__badges" aria-label="Qwen capabilities">
          {badges.map((badge) => (
            <span
              key={badge}
              className={badge === "qwen-3.6" ? "pill pill--accent" : "pill"}
            >
              {badge}
            </span>
          ))}
        </div>
      </article>
    </section>
  );
}
