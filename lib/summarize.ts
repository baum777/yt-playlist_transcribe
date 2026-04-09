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

export function buildShortContextDe(input: {
  title: string;
  channelTitle: string;
  description: string;
  publishedAt: string | null;
}): string {
  const publishedDate = formatPublishedDate(input.publishedAt);
  const description = input.description.trim();

  if (description) {
    const firstSentence = description.split(/[.!?](?:\s|$)/)[0]?.trim();
    const sentence = firstSentence ? `${firstSentence}.` : description;
    const publishedPart = publishedDate ? ` Veröffentlicht am ${publishedDate}.` : "";
    return `Dieses Video von ${input.channelTitle} trägt den Titel „${input.title}“. Die verfügbare Beschreibung nennt: ${sentence}${publishedPart} Die Einordnung bleibt bewusst knapp, weil nur sichtbare Metadaten ausgewertet werden.`;
  }

  const publishedPart = publishedDate ? ` Veröffentlicht am ${publishedDate}.` : "";
  return `Dieses Video von ${input.channelTitle} trägt den Titel „${input.title}“.${publishedPart} Es liegt keine belastbare Beschreibung vor, deshalb bleibt die Einordnung bewusst allgemein und metadatenbasiert.`;
}
