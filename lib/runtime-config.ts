import "server-only";

import type { SummaryLength } from "@/types/video-context";

const DEFAULT_APP_URL = "http://localhost:3000";
const DEFAULT_INGEST_TIMEOUT_MS = 20_000;
const DEFAULT_MAX_DESCRIPTION_CHARS = 800;
const DEFAULT_SUMMARY_LENGTH: SummaryLength = "short";
const DEFAULT_LOG_LEVEL = "info";

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (!value) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function parseSummaryLength(value: string | undefined): SummaryLength {
  if (value === "standard" || value === "long") {
    return value;
  }

  return DEFAULT_SUMMARY_LENGTH;
}

function getRuntimeUrl(): string {
  const appUrl = process.env.APP_URL?.trim();
  if (appUrl) {
    try {
      return new URL(appUrl).toString();
    } catch {
      return DEFAULT_APP_URL;
    }
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    try {
      return new URL(`https://${vercelUrl}`).toString();
    } catch {
      return DEFAULT_APP_URL;
    }
  }

  return DEFAULT_APP_URL;
}

export function getAppUrl(): string {
  return getRuntimeUrl();
}

export function getDefaultSummaryLength(): SummaryLength {
  return parseSummaryLength(process.env.DEFAULT_SUMMARY_LENGTH?.trim());
}

export function getIngestTimeoutMs(): number {
  return parsePositiveInteger(process.env.INGEST_TIMEOUT_MS, DEFAULT_INGEST_TIMEOUT_MS);
}

export function getMaxDescriptionChars(): number {
  return parsePositiveInteger(process.env.MAX_DESCRIPTION_CHARS, DEFAULT_MAX_DESCRIPTION_CHARS);
}

export function getLogLevel(): string {
  return process.env.LOG_LEVEL?.trim() || DEFAULT_LOG_LEVEL;
}

export function isRequestLoggingEnabled(): boolean {
  return parseBoolean(process.env.ENABLE_REQUEST_LOGGING);
}
