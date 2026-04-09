"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="faq-accordion">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const triggerId = `faq-trigger-${index}`;

        return (
          <article className={["faq-item", isOpen ? "faq-item--open" : ""].join(" ")} key={item.question}>
            <button
              id={triggerId}
              type="button"
              className="faq-trigger"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span>{item.question}</span>
              <span className={["faq-chevron", isOpen ? "faq-chevron--open" : ""].join(" ")} aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>

            <div id={panelId} role="region" aria-labelledby={triggerId} hidden={!isOpen}>
              <p>{item.answer}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
