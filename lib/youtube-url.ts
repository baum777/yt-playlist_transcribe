const SUPPORTED_YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export type YoutubeUrlValidationErrorCode =
  | "EMPTY"
  | "INVALID_URL"
  | "PLAYLIST_URL"
  | "UNSUPPORTED_YOUTUBE_SURFACE";

export interface YoutubeUrlValidationSuccess {
  ok: true;
  videoId: string;
}

export interface YoutubeUrlValidationFailure {
  ok: false;
  error: YoutubeUrlValidationErrorCode;
}

export type YoutubeUrlValidationResult =
  | YoutubeUrlValidationSuccess
  | YoutubeUrlValidationFailure;

const VALIDATION_MESSAGES = {
  de: {
    EMPTY: "Bitte füge eine einzelne YouTube-Video-URL ein.",
    INVALID_URL: "Bitte füge eine einzelne YouTube-Video-URL ein.",
    PLAYLIST_URL:
      "Playlists werden in V1 nicht unterstützt. Bitte füge eine einzelne YouTube-Video-URL ein.",
    UNSUPPORTED_YOUTUBE_SURFACE: "Bitte füge eine einzelne YouTube-Video-URL ein.",
  },
  en: {
    EMPTY: "Please paste a single YouTube video URL.",
    INVALID_URL: "Please paste a single YouTube video URL.",
    PLAYLIST_URL: "Playlist URLs are not supported in v1.",
    UNSUPPORTED_YOUTUBE_SURFACE: "Please paste a single YouTube video URL.",
  },
} satisfies Record<
  "de" | "en",
  Record<YoutubeUrlValidationErrorCode, string>
>;

function trimOptionalTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function isSupportedYoutubeHost(hostname: string) {
  return SUPPORTED_YOUTUBE_HOSTS.has(hostname.toLowerCase());
}

function buildFailure(error: YoutubeUrlValidationErrorCode): YoutubeUrlValidationFailure {
  return { ok: false, error };
}

export function getYoutubeUrlValidationMessage(
  error: YoutubeUrlValidationErrorCode,
  locale: "de" | "en" = "de",
) {
  return VALIDATION_MESSAGES[locale][error];
}

export function validateYoutubeVideoUrl(input: string): YoutubeUrlValidationResult {
  const value = input.trim();

  if (!value) {
    return buildFailure("EMPTY");
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return buildFailure("INVALID_URL");
  }

  if (!isSupportedYoutubeHost(parsed.hostname)) {
    return buildFailure("INVALID_URL");
  }

  const pathname = trimOptionalTrailingSlash(parsed.pathname);
  const host = parsed.hostname.toLowerCase();

  if (pathname === "/playlist") {
    return buildFailure("PLAYLIST_URL");
  }

  if (host.endsWith("youtu.be")) {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length !== 1) {
      return buildFailure("INVALID_URL");
    }

    const videoId = segments[0] ?? "";
    return YOUTUBE_VIDEO_ID_PATTERN.test(videoId)
      ? { ok: true, videoId }
      : buildFailure("INVALID_URL");
  }

  if (pathname === "/watch") {
    const videoId = parsed.searchParams.get("v") ?? "";
    return YOUTUBE_VIDEO_ID_PATTERN.test(videoId)
      ? { ok: true, videoId }
      : buildFailure("INVALID_URL");
  }

  return buildFailure("UNSUPPORTED_YOUTUBE_SURFACE");
}
