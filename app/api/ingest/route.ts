import { NextRequest, NextResponse } from "next/server";

import { buildMetadataContextDe } from "@/lib/summarize";
import { getSummaryLengthLabel, parseSummaryLength } from "@/lib/summary-length";
import { generateGermanContext } from "@/lib/qwen";
import { getDefaultSummaryLength, getIngestTimeoutMs, getLogLevel, isRequestLoggingEnabled } from "@/lib/runtime-config";
import { fetchYouTubeMetadata, normalizeDescription } from "@/lib/youtube";
import { getYoutubeUrlValidationMessage, validateYoutubeVideoUrl } from "@/lib/youtube-url";
import type {
  YoutubeIngestErrorResponse,
  YoutubeIngestRequestBody,
  YoutubeIngestResponse,
  YoutubeIngestValidationErrorResponse,
} from "@/types/video-context";

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
      {
        error: "INVALID_REQUEST",
        message: "The request body must contain JSON.",
      } satisfies YoutubeIngestErrorResponse,
      { status: 400 },
    );
  }

  const url = readRequestUrl(body);
  const urlValidation = validateYoutubeVideoUrl(url);
  if (!urlValidation.ok) {
    return NextResponse.json(
      {
        error: "INVALID_URL",
        message: getYoutubeUrlValidationMessage(urlValidation.error, "en"),
      } satisfies YoutubeIngestValidationErrorResponse,
      { status: 400 },
    );
  }

  const summaryLength = resolveSummaryLength(body);
  const videoId = urlValidation.videoId;

  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "MISSING_API_KEY",
        message: "YOUTUBE_API_KEY is not set. The ingest route cannot run.",
      } satisfies YoutubeIngestErrorResponse,
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
      error instanceof Error ? error.message : "The YouTube URL could not be processed.";
    const status = message.includes("Zeitlimit") ? 504 : 502;
    return NextResponse.json(
      {
        error: status === 504 ? "TIMEOUT" : "METADATA_ERROR",
        message,
      } satisfies YoutubeIngestErrorResponse,
      { status },
    );
  }
}
