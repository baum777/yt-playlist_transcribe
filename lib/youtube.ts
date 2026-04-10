import type { YoutubeMetadata } from "@/types/video-context";
import { getIngestTimeoutMs, getMaxDescriptionChars } from "@/lib/runtime-config";
import {
  getYoutubeUrlValidationMessage,
  validateYoutubeVideoUrl,
} from "@/lib/youtube-url";

export function extractYoutubeVideoId(input: string): string | null {
  const validation = validateYoutubeVideoUrl(input);
  return validation.ok ? validation.videoId : null;
}

interface YoutubeApiThumbnailSet {
  default: { url: string };
  medium?: { url: string };
  high?: { url: string };
  standard?: { url: string };
  maxres?: { url: string };
}

interface YoutubeApiSnippet {
  title: string;
  description?: string;
  channelTitle: string;
  publishedAt?: string;
  thumbnails: YoutubeApiThumbnailSet;
}

interface YoutubeApiContentDetails {
  duration?: string;
}

interface YoutubeApiStatistics {
  viewCount?: string;
}

function buildThumbnailUrl(snippet: YoutubeApiSnippet): string {
  const thumbnails = snippet.thumbnails;
  return (
    thumbnails.maxres?.url ??
    thumbnails.standard?.url ??
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.default.url
  );
}

export function normalizeDescription(description: string | null | undefined): string {
  if (!description) {
    return "";
  }

  const normalized = description
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  const maxChars = getMaxDescriptionChars();
  if (normalized.length <= maxChars) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxChars - 3)).trimEnd()}…`;
}

export async function fetchYouTubeMetadata(
  videoId: string,
  apiKey: string,
  timeoutMs: number = getIngestTimeoutMs(),
): Promise<YoutubeMetadata> {
  const endpoint = new URL("https://www.googleapis.com/youtube/v3/videos");
  endpoint.searchParams.set("part", "snippet,contentDetails,statistics");
  endpoint.searchParams.set("id", videoId);
  endpoint.searchParams.set("key", apiKey);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(endpoint.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`Die YouTube Data API hat das Zeitlimit von ${timeoutMs} ms überschritten.`);
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new Error(`Die YouTube Data API hat mit Status ${response.status} geantwortet.`);
  }

  const payload = (await response.json()) as {
    items?: Array<{
      id?: string;
      snippet?: YoutubeApiSnippet;
      contentDetails?: YoutubeApiContentDetails;
      statistics?: YoutubeApiStatistics;
    }>;
  };

  const item = payload.items?.[0];
  if (!item?.snippet || !item.id) {
    throw new Error("Für diese URL wurden keine öffentlichen Videometadaten gefunden.");
  }

  return {
    videoId: item.id,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt ?? null,
    thumbnailUrl: buildThumbnailUrl(item.snippet),
    duration: item.contentDetails?.duration ?? "PT0S",
    viewCount: Number(item.statistics?.viewCount ?? 0),
    description: item.snippet.description ?? "",
  };
}

export async function fetchYouTubeVideoMetadata(
  videoUrl: string,
  apiKey: string,
  timeoutMs: number = getIngestTimeoutMs(),
): Promise<YoutubeMetadata> {
  const validation = validateYoutubeVideoUrl(videoUrl);
  if (!validation.ok) {
    throw new Error(
      getYoutubeUrlValidationMessage(validation.error, "en"),
    );
  }

  const videoId = validation.videoId;
  return fetchYouTubeMetadata(videoId, apiKey, timeoutMs);
}
