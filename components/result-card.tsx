import Image from "next/image";

import type { VideoContext } from "@/types/video-context";

interface ResultCardProps {
  data: VideoContext | null;
  isDemo?: boolean;
  ingestMs?: number;
  errorMessage?: string | null;
}

const demoData: VideoContext = {
  videoId: "dQw4w9WgXcQ",
  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  schemaVersion: "1.1",
  title: "Rick Astley - Never Gonna Give You Up (Official Video)",
  channelTitle: "Rick Astley",
  publishedAt: "2009-10-24T07:57:33Z",
  thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  duration: "PT3M33S",
  viewCount: 1600000000,
  description: "Official music video for Rick Astley - Never Gonna Give You Up.",
  summaryLength: "short",
  summaryLengthLabel: "Kurz",
  summaryDe:
    "„Never Gonna Give You Up“ ist ein Popsong aus dem Jahr 1987. Das Video wird auf der Landingpage als metadatenbasierte Kontextkarte dargestellt.",
  summarySource: "qwen",
  generatedAt: "2009-10-24T07:57:33Z",
  shortContextDe:
    "„Never Gonna Give You Up“ ist ein Popsong aus dem Jahr 1987. Das Lied verbindet tanzbare Synthpop-Elemente mit einem eingängigen Refrain über bedingungslose Treue. Im Internet wurde der Track durch das sogenannte Rickrolling neu bekannt.",
  contextSource: "qwen",
};

function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(
    /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/,
  );

  if (!match) {
    return "0:00";
  }

  const hours = Number(match[5] ?? 0);
  const minutes = Number(match[6] ?? 0);
  const seconds = Number(match[7] ?? 0);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatViews(viewCount: number): string {
  return `${new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(viewCount)} views`;
}

function formatPublishedDate(publishedAt: string | null): string {
  if (!publishedAt) {
    return "Unavailable";
  }

  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return date.toLocaleDateString("en-US", { dateStyle: "medium" });
}

function formatIngestTime(ingestMs?: number): string {
  if (typeof ingestMs !== "number" || Number.isNaN(ingestMs)) {
    return "ingest: 0.8s";
  }

  return `ingest: ${(ingestMs / 1000).toFixed(1)}s`;
}

function CardHeader({
  eyebrow,
  analyzed,
}: {
  eyebrow: string;
  analyzed: boolean;
}) {
  return (
    <div className="result-card__header">
      <span className="eyebrow eyebrow--inline">{eyebrow}</span>
      {analyzed ? <span className="analyzed-badge">analyzed</span> : null}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <article className="result-card result-card--error" aria-live="polite">
      <span className="eyebrow eyebrow--inline">Metadata error</span>
      <h2>We could not complete the ingest.</h2>
      <p>{message}</p>
    </article>
  );
}

function ContentCard({
  data,
  isDemo,
  ingestMs,
}: {
  data: VideoContext;
  isDemo: boolean;
  ingestMs?: number;
}) {
  const contextCopy =
    data.contextSource === "fallback"
      ? "Qwen was unavailable, so this card shows metadata only."
      : data.shortContextDe;
  const eyebrow = isDemo ? "Live preview" : "Result";

  return (
    <article className={["result-card", isDemo ? "result-card--demo" : ""].join(" ")}>
      <CardHeader eyebrow={eyebrow} analyzed />

      <div className="result-card__layout">
        <div className="result-card__media">
          <Image
            src={data.thumbnailUrl}
            alt={data.title}
            fill
            sizes="(max-width: 720px) 100vw, 360px"
            className="result-card__image"
            unoptimized
            priority={isDemo}
          />
          <span className="duration-chip">{formatDuration(data.duration)}</span>
        </div>

        <div className="result-card__body">
          <h2>{data.title}</h2>

          <div className="meta-row" aria-label="Video metadata">
            <div>
              <span className="meta-label">Channel</span>
              <span className="meta-value">{data.channelTitle}</span>
            </div>
            <div>
              <span className="meta-label">Date</span>
              <span className="meta-value">{formatPublishedDate(data.publishedAt)}</span>
            </div>
            <div>
              <span className="meta-label">Views</span>
              <span className="meta-value">{formatViews(data.viewCount)}</span>
            </div>
          </div>

          <div className="context-panel">
            <span className="context-panel__label">Kontext · German</span>
            {data.contextSource === "fallback" ? (
              <p className="context-panel__fallback">{contextCopy}</p>
            ) : (
              <p>{contextCopy}</p>
            )}
          </div>

          <div className="result-card__footer">
            <span className="qwen-badge">powered by Qwen 3.6</span>
            <span className="ingest-label">{formatIngestTime(ingestMs)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ResultCard({ data, isDemo, ingestMs, errorMessage }: ResultCardProps) {
  if (errorMessage) {
    return <ErrorState message={errorMessage} />;
  }

  if (isDemo) {
    return <ContentCard data={demoData} isDemo ingestMs={0.8 * 1000} />;
  }

  if (data) {
    return <ContentCard data={data} isDemo={false} ingestMs={ingestMs} />;
  }

  return <ContentCard data={demoData} isDemo ingestMs={0.8 * 1000} />;
}
