import type { SummaryLength } from "@/types/video-context";

function formatPublishedDate(publishedAt: string | null): string | null {
  if (!publishedAt) {
    return null;
  }

  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("de-DE", {
    dateStyle: "medium",
  });
}

function normalizeSentence(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function firstDescriptionSentence(description: string): string | null {
  const trimmed = normalizeSentence(description);
  if (!trimmed) {
    return null;
  }

  const sentence = trimmed.split(/[.!?](?:\s|$)/)[0]?.trim();
  if (!sentence) {
    return null;
  }

  return sentence.endsWith(".") ? sentence : `${sentence}.`;
}

function buildShortSentences(input: {
  title: string;
  channelTitle: string;
  description: string;
  publishedAt: string | null;
}): string[] {
  const sentences = [`Dieses Video von ${input.channelTitle} trägt den Titel „${input.title}“.`];
  const descriptionSentence = firstDescriptionSentence(input.description);
  if (descriptionSentence) {
    sentences.push(`Die Beschreibung nennt: ${descriptionSentence}`);
  } else {
    sentences.push("Es liegt keine belastbare Beschreibung vor.");
  }

  const publishedDate = formatPublishedDate(input.publishedAt);
  if (publishedDate) {
    sentences.push(`Veröffentlicht am ${publishedDate}.`);
  }

  sentences.push("Die Einordnung bleibt bewusst metadatenbasiert.");
  return sentences;
}

function buildStandardSentences(input: {
  title: string;
  channelTitle: string;
  description: string;
  publishedAt: string | null;
}): string[] {
  const description = normalizeSentence(input.description);
  const publishedDate = formatPublishedDate(input.publishedAt);
  const descriptionSentence = firstDescriptionSentence(description);

  return [
    `Dieses Video von ${input.channelTitle} trägt den Titel „${input.title}“.`,
    descriptionSentence
      ? `Die sichtbare Beschreibung legt nahe: ${descriptionSentence}`
      : "Die sichtbare Beschreibung liefert keine belastbare inhaltliche Einordnung.",
    publishedDate
      ? `Es wurde am ${publishedDate} veröffentlicht, was den zeitlichen Kontext setzt.`
      : "Ein Veröffentlichungsdatum liegt nicht verlässlich vor.",
    "Die Zusammenfassung bleibt strikt auf Titel, Kanalname, Beschreibung und Datum begrenzt.",
    "Sie beschreibt damit nur das, was aus Metadaten plausibel ableitbar ist.",
  ];
}

function buildLongParagraphs(input: {
  title: string;
  channelTitle: string;
  description: string;
  publishedAt: string | null;
}): string[] {
  const description = normalizeSentence(input.description);
  const publishedDate = formatPublishedDate(input.publishedAt);
  const descriptionSentence = firstDescriptionSentence(description);

  const firstParagraph = [
    `Dieses Video von ${input.channelTitle} trägt den Titel „${input.title}“.`,
    publishedDate ? `Veröffentlicht wurde es am ${publishedDate}.` : "Ein belastbares Veröffentlichungsdatum liegt nicht vor.",
  ].join(" ");

  const secondParagraph = descriptionSentence
    ? [
        `Die sichtbare Beschreibung deutet auf folgenden Kontext hin: ${descriptionSentence}`,
        "Diese Deutung bleibt vorsichtig und folgt nur dem, was öffentlich sichtbar ist.",
      ].join(" ")
    : [
        "Die sichtbare Beschreibung ist zu knapp für eine inhaltlich belastbare Einordnung.",
        "Deshalb bleibt die Interpretation bewusst allgemein und zurückhaltend.",
      ].join(" ");

  const thirdParagraph = [
    "YTContext ergänzt hier keine Transkript- oder Audioanalyse.",
    "Die Ausgabe bleibt eine metadata-basierte Orientierungshilfe und keine vollständige Videozusammenfassung.",
  ].join(" ");

  return [firstParagraph, secondParagraph, thirdParagraph];
}

export function buildMetadataContextDe(
  input: {
    title: string;
    channelTitle: string;
    description: string;
    publishedAt: string | null;
  },
  summaryLength: SummaryLength,
): string {
  switch (summaryLength) {
    case "short":
      return buildShortSentences(input).join(" ");
    case "standard":
      return buildStandardSentences(input).join(" ");
    case "long":
      return buildLongParagraphs(input).join("\n\n");
  }
}

export function buildShortContextDe(input: {
  title: string;
  channelTitle: string;
  description: string;
  publishedAt: string | null;
}): string {
  return buildMetadataContextDe(input, "short");
}
