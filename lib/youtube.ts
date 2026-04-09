import type { YoutubeMetadata } from "@/types/video-context";

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

function isYoutubeHost(hostname: string) {
  return YOUTUBE_HOSTS.has(hostname.toLowerCase());
}

function trimOptionalTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function extractYoutubeVideoId(input: string): string | null {
  let parsed: URL;

  try {
    parsed = new URL(input);
  } catch {
    return null;
  }

  if (!isYoutubeHost(parsed.hostname)) {
    return null;
  }

  const pathname = trimOptionalTrailingSlash(parsed.pathname);

  if (parsed.hostname.includes("youtu.be")) {
    const id = pathname.split("/").filter(Boolean)[0] ?? "";
    return YOUTUBE_VIDEO_ID_PATTERN.test(id) ? id : null;
  }

  if (pathname === "/watch") {
    const id = parsed.searchParams.get("v") ?? "";
    return YOUTUBE_VIDEO_ID_PATTERN.test(id) ? id : null;
  }

  const segments = pathname.split("/").filter(Boolean);
  const videoId = segments[1] ?? segments[0] ?? "";

  if (segments[0] === "shorts" || segments[0] === "embed" || segments[0] === "live") {
    return YOUTUBE_VIDEO_ID_PATTERN.test(videoId) ? videoId : null;
  }

  return null;
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

  if (normalized.length <= 800) {
    return normalized;
  }

  return `${normalized.slice(0, 797).trimEnd()}…`;
}

export async function fetchYouTubeMetadata(
  videoId: string,
  apiKey: string,
): Promise<YoutubeMetadata> {
  const endpoint = new URL("https://www.googleapis.com/youtube/v3/videos");
  endpoint.searchParams.set("part", "snippet,contentDetails,statistics");
  endpoint.searchParams.set("id", videoId);
  endpoint.searchParams.set("key", apiKey);

  const response = await fetch(endpoint.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

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
): Promise<YoutubeMetadata> {
  const videoId = extractYoutubeVideoId(videoUrl);
  if (!videoId) {
    throw new Error(
      "Bitte eine einzelne YouTube-Video-URL senden. Playlist-Links und fremde Domains sind in V1 nicht unterstützt.",
    );
  }

  return fetchYouTubeMetadata(videoId, apiKey);
}
