import { NextRequest, NextResponse } from "next/server";

import { buildMetadataContextDe } from "@/lib/summarize";
import { getSummaryLengthLabel, parseSummaryLength } from "@/lib/summary-length";
import { generateGermanContext } from "@/lib/qwen";
import { getDefaultSummaryLength, getIngestTimeoutMs, getLogLevel, isRequestLoggingEnabled } from "@/lib/runtime-config";
import { extractYoutubeVideoId, fetchYouTubeMetadata, normalizeDescription } from "@/lib/youtube";
import type { YoutubeIngestRequestBody, YoutubeIngestResponse } from "@/types/video-context";

function readRequestUrl(body: unknown): string {
  if (!body || typeof body !== "object") {
    return "";
  }

  const candidate = (body as YoutubeIngestRequestBody).url;
  return typeof candidate === "string" ? candidate.trim() : "";
}

function readRequestSummaryLength(body: unknown) {
  if (!body || typeof body !== "object") {
    return null;
  }

  return parseSummaryLength((body as Partial<YoutubeIngestRequestBody>).summaryLength);
}

function resolveSummaryLength(body: unknown) {
  return readRequestSummaryLength(body) ?? getDefaultSummaryLength();
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Der Request-Body muss JSON enthalten." },
      { status: 400 },
    );
  }

  const url = readRequestUrl(body);
  if (!url) {
    return NextResponse.json(
      { error: "Bitte eine YouTube-URL im Feld `url` senden." },
      { status: 400 },
    );
  }

  const summaryLength = resolveSummaryLength(body);

  const videoId = extractYoutubeVideoId(url);
  if (!videoId) {
    return NextResponse.json(
      {
        error:
          "Bitte eine einzelne YouTube-Video-URL senden. Playlist-Links und fremde Domains sind in V1 nicht unterstützt.",
      },
      { status: 400 },
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY ist nicht gesetzt. Die Ingest-Route kann so nicht arbeiten." },
      { status: 500 },
    );
  }

  try {
    if (isRequestLoggingEnabled()) {
      console.info(`[ingest:${getLogLevel()}] processing ${videoId} with summaryLength=${summaryLength}`);
    }

    const video = await fetchYouTubeMetadata(videoId, apiKey, getIngestTimeoutMs());
    const description = normalizeDescription(video.description);
    const shortContextDe = await generateGermanContext({
      title: video.title,
      channelTitle: video.channelTitle,
      publishedAt: video.publishedAt,
      description,
      summaryLength,
      videoUrl: url,
    });
    const summarySource: YoutubeIngestResponse["summarySource"] = shortContextDe ? "qwen" : "fallback";
    const normalizedSummary = shortContextDe ?? buildMetadataContextDe(
      {
        title: video.title,
        channelTitle: video.channelTitle,
        description,
        publishedAt: video.publishedAt,
      },
      summaryLength,
    );

    const payload: YoutubeIngestResponse = {
      ...video,
      url,
      schemaVersion: "1.1",
      summaryLength,
      summaryLengthLabel: getSummaryLengthLabel(summaryLength),
      summaryDe: normalizedSummary,
      summarySource,
      generatedAt: new Date().toISOString(),
      description,
      shortContextDe: normalizedSummary,
      contextSource: summarySource,
    };

    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Die YouTube-URL konnte nicht verarbeitet werden.";
    const status = message.includes("nicht unterstützt")
      ? 400
      : message.includes("Zeitlimit")
        ? 504
        : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
