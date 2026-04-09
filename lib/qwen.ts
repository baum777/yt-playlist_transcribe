import "server-only";

import OpenAI from "openai";

import { getSummaryLengthLabel, getSummaryLengthPromptRules, getSummaryLengthTokenBudget } from "@/lib/summary-length";
import type { SummaryLength } from "@/types/video-context";

const DEFAULT_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_QWEN_MODEL_ID = "qwen/qwen3.6-plus";
const DEFAULT_QWEN_TIMEOUT_MS = 15_000;

export interface ShortGermanContextInput {
  title: string;
  channelTitle: string;
  publishedAt: string | null;
  description: string;
  videoUrl: string;
  summaryLength: SummaryLength;
}

let cachedClient: OpenAI | null = null;

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getQwenModelId(): string {
  return process.env.QWEN_MODEL_ID?.trim() || DEFAULT_QWEN_MODEL_ID;
}

function getOpenRouterClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY ist nicht gesetzt.");
  }

  const baseURL = process.env.OPENROUTER_BASE_URL?.trim() || DEFAULT_OPENROUTER_BASE_URL;
  try {
    new URL(baseURL);
  } catch {
    throw new Error("OPENROUTER_BASE_URL ist keine gültige URL.");
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey,
      baseURL,
      timeout: parsePositiveInteger(process.env.QWEN_TIMEOUT_MS, DEFAULT_QWEN_TIMEOUT_MS),
      maxRetries: 0,
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
  const client = getOpenRouterClient();
  const model = getQwenModelId();
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
