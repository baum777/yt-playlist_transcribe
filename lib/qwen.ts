import "server-only";

import OpenAI from "openai";

import { getSummaryLengthLabel, getSummaryLengthPromptRules, getSummaryLengthTokenBudget } from "@/lib/summary-length";
import type { SummaryLength } from "@/types/video-context";

const QWEN_BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
const DEFAULT_QWEN_MODEL = "qwen3.6-plus";

export interface ShortGermanContextInput {
  title: string;
  channelTitle: string;
  publishedAt: string | null;
  description: string;
  videoUrl: string;
  summaryLength: SummaryLength;
}

let cachedClient: OpenAI | null = null;

function getQwenModel(): string {
  return process.env.QWEN_MODEL?.trim() || DEFAULT_QWEN_MODEL;
}

function getQwenClient(): OpenAI {
  const apiKey = process.env.DASHSCOPE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("DASHSCOPE_API_KEY ist nicht gesetzt.");
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey,
      baseURL: QWEN_BASE_URL,
    });
  }

  return cachedClient;
}

function sanitizeContextText(text: string, summaryLength: SummaryLength): string {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return "";
  }

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (summaryLength === "long") {
    return paragraphs.slice(0, 4).join("\n\n");
  }

  return paragraphs.join(" ");
}

export async function generateGermanContext(metadata: {
  title: string;
  channelTitle: string;
  description: string;
  publishedAt: string | null;
  summaryLength: SummaryLength;
  videoUrl: string;
}): Promise<string | null> {
  try {
    return await generateShortGermanVideoContext({
      title: metadata.title,
      channelTitle: metadata.channelTitle,
      publishedAt: metadata.publishedAt,
      description: metadata.description,
      videoUrl: metadata.videoUrl,
      summaryLength: metadata.summaryLength,
    });
  } catch {
    return null;
  }
}

export async function generateShortGermanVideoContext(
  input: ShortGermanContextInput,
): Promise<string> {
  const client = getQwenClient();
  const model = getQwenModel();
  const publishedDate = input.publishedAt
    ? new Date(input.publishedAt).toLocaleDateString("de-DE", {
        dateStyle: "medium",
      })
    : "nicht verfügbar";

  const response = await client.chat.completions.create({
    model,
    temperature: 0.2,
    max_tokens: getSummaryLengthTokenBudget(input.summaryLength),
    messages: [
      {
        role: "system",
        content:
          "Du schreibst deutsche Kontextabschnitte für eine Landingpage. Antworte nur mit Fließtext. Keine Überschrift, keine Aufzählungen, keine Metakommentare. Bleibe strikt metadata-basiert und behaupte nicht, das Video gesehen zu haben.",
      },
      {
        role: "user",
        content: [
          "Aufgabe: Formuliere einen deutschen Kontexttext ausschließlich aus den verfügbaren Metadaten.",
          `Ausgabeformat: ${getSummaryLengthLabel(input.summaryLength)}.`,
          getSummaryLengthPromptRules(input.summaryLength),
          "Regeln:",
          "- Keine Halluzinationen.",
          "- Leite nur aus Titel, Kanalname, Beschreibung, Veröffentlichungsdatum und Video-URL ab.",
          "- Wenn die Beschreibung dünn ist, formuliere offen und zurückhaltend.",
          "",
          `Titel: ${input.title}`,
          `Kanal: ${input.channelTitle}`,
          `Veröffentlicht: ${publishedDate}`,
          `Video-URL: ${input.videoUrl}`,
          `Beschreibung: ${input.description || "nicht verfügbar"}`,
        ].join("\n"),
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  const text = Array.isArray(content)
    ? content.map((part) => ("text" in part ? part.text : "")).join("")
    : content ?? "";
  const sanitized = sanitizeContextText(text, input.summaryLength);
  if (!sanitized) {
    throw new Error("Qwen hat keinen verwertbaren Kontext geliefert.");
  }

  return sanitized;
}
