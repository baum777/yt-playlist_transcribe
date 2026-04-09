export interface YoutubeIngestRequestBody {
  url: string;
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
