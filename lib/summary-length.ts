import type { SummaryLength, SummaryLengthLabel } from "@/types/video-context";

export const SUMMARY_LENGTH_VALUES = ["short", "standard", "long"] as const;

const SUMMARY_LENGTH_LABELS: Record<SummaryLength, SummaryLengthLabel> = {
  short: "Kurz",
  standard: "Standard",
  long: "Ausführlich",
};

const SUMMARY_LENGTH_TOKEN_BUDGET: Record<SummaryLength, number> = {
  short: 120,
  standard: 200,
  long: 320,
};

export function isSummaryLength(value: unknown): value is SummaryLength {
  return typeof value === "string" && SUMMARY_LENGTH_VALUES.includes(value as SummaryLength);
}

export function parseSummaryLength(value: unknown): SummaryLength | null {
  return isSummaryLength(value) ? value : null;
}

export function getSummaryLengthLabel(value: SummaryLength): SummaryLengthLabel {
  return SUMMARY_LENGTH_LABELS[value];
}

export function getSummaryLengthTokenBudget(value: SummaryLength): number {
  return SUMMARY_LENGTH_TOKEN_BUDGET[value];
}

export function getSummaryLengthPromptRules(value: SummaryLength): string {
  switch (value) {
    case "short":
      return [
        "Schreibe 2 bis 3 Sätze.",
        "Bleibe klar, knapp und metadata-basiert.",
        "Behaupte nicht, das Video gesehen oder verstanden zu haben.",
      ].join("\n");
    case "standard":
      return [
        "Schreibe 4 bis 6 Sätze.",
        "Halte den Ton knapp, aber mit etwas mehr Kontext als bei Kurz.",
        "Bleibe strikt bei den verfügbaren Metadaten.",
      ].join("\n");
    case "long":
      return [
        "Schreibe 2 bis 4 kurze Absätze.",
        "Jeder Absatz sollte 1 bis 2 Sätze haben.",
        "Die Einordnung darf ausführlicher sein, bleibt aber strikt metadata-basiert.",
      ].join("\n");
  }
}

