export type SummaryLength = "short" | "standard" | "long";

export type SummaryLengthLabel = "Kurz" | "Standard" | "Ausführlich";

export interface YoutubeIngestRequestBody {
  url: string;
  summaryLength: SummaryLength;
}

export interface YoutubeMetadata {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string | null;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  description: string;
}

export interface VideoContext extends YoutubeMetadata {
  url: string;
  schemaVersion: "1.1";
  summaryLength: SummaryLength;
  summaryLengthLabel: SummaryLengthLabel;
  summaryDe: string;
  summarySource: "qwen" | "fallback";
  generatedAt: string;
  shortContextDe: string;
  contextSource: "qwen" | "fallback";
}

export type ApiResponse =
  | {
      status: "success";
      data: VideoContext;
    }
  | {
      status: "validationError";
      message: string;
    }
  | {
      status: "metadataError";
      message: string;
    }
  | {
      status: "contextFallback";
      data: VideoContext;
    };

export type YoutubeIngestResponse = VideoContext;
