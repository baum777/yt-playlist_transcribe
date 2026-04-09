import { NextRequest, NextResponse } from "next/server";

import { buildShortContextDe } from "@/lib/summarize";
import { generateGermanContext } from "@/lib/qwen";
import { extractYoutubeVideoId, fetchYouTubeMetadata, normalizeDescription } from "@/lib/youtube";
import type { YoutubeIngestRequestBody, YoutubeIngestResponse } from "@/types/video-context";

function readRequestUrl(body: unknown): string {
  if (!body || typeof body !== "object") {
    return "";
  }

  const candidate = (body as YoutubeIngestRequestBody).url;
  return typeof candidate === "string" ? candidate.trim() : "";
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
    const video = await fetchYouTubeMetadata(videoId, apiKey);
    const description = normalizeDescription(video.description);
    const shortContextDe = await generateGermanContext({
      title: video.title,
      channelTitle: video.channelTitle,
      description,
    });
    const contextSource: YoutubeIngestResponse["contextSource"] = shortContextDe ? "qwen" : "fallback";

    const payload: YoutubeIngestResponse = {
      ...video,
      description,
      shortContextDe: shortContextDe ?? buildShortContextDe({
        title: video.title,
        channelTitle: video.channelTitle,
        description,
        publishedAt: video.publishedAt,
      }),
      contextSource,
    };

    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Die YouTube-URL konnte nicht verarbeitet werden.";
    const status = message.includes("nicht unterstützt") ? 400 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
