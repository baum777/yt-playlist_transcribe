import "server-only";

import OpenAI from "openai";

const QWEN_BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
const DEFAULT_QWEN_MODEL = "qwen3.6-plus";

export interface ShortGermanContextInput {
  title: string;
  channelTitle: string;
  publishedAt: string | null;
  description: string;
  videoUrl: string;
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

function sanitizeContextText(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  const words = normalized.split(" ");
  if (words.length <= 100) {
    return normalized;
  }

  return `${words.slice(0, 100).join(" ").trimEnd()}…`;
}

export async function generateGermanContext(metadata: {
  title: string;
  channelTitle: string;
  description: string;
}): Promise<string | null> {
  try {
    return await generateShortGermanVideoContext({
      title: metadata.title,
      channelTitle: metadata.channelTitle,
      publishedAt: null,
      description: metadata.description,
      videoUrl: "",
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
    max_tokens: 180,
    messages: [
      {
        role: "system",
        content:
          "Du schreibst kurze deutsche Kontextabschnitte für eine Landingpage. Antworte nur mit einem einzigen kurzen Absatz. Keine Aufzählungen, keine Überschrift, keine Metakommentare.",
      },
      {
        role: "user",
        content: [
          "Aufgabe: Formuliere einen kurzen deutschen Absatz ausschließlich aus den verfügbaren Metadaten.",
          "Regeln:",
          "- Keine Halluzinationen.",
          "- Behaupte nicht, das Video vollständig gesehen zu haben.",
          "- Leite nur aus Titel, Kanalname, Beschreibung, Veröffentlichungsdatum und Video-URL ab.",
          "- Kurz, klar, neutral und vorsichtig.",
          "- Maximal etwa 70 bis 100 Wörter.",
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
  const sanitized = sanitizeContextText(text);
  if (!sanitized) {
    throw new Error("Qwen hat keinen verwertbaren Kontext geliefert.");
  }

  return sanitized;
}
