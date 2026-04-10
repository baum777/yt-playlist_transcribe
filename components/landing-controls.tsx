"use client";

import { useState } from "react";

import { ResultCard } from "@/components/result-card";
import { UrlInput } from "@/components/url-input";
import {
  getYoutubeUrlValidationMessage,
  validateYoutubeVideoUrl,
} from "@/lib/youtube-url";
import type { YoutubeIngestResponse, YoutubeIngestResponsePayload } from "@/types/video-context";

type LoadState = "idle" | "loading" | "success" | "error";

export function LandingControls() {
  const [state, setState] = useState<LoadState>("idle");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<YoutubeIngestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ingestMs, setIngestMs] = useState<number | null>(null);

  function showValidationError(
    errorCode: Parameters<typeof getYoutubeUrlValidationMessage>[0],
  ) {
    setError(getYoutubeUrlValidationMessage(errorCode, "de"));
    setResult(null);
    setIngestMs(null);
    setState("idle");
  }

  function readResponseErrorMessage(payload: YoutubeIngestResponsePayload) {
    if (
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string" &&
      payload.message.trim()
    ) {
      return payload.message;
    }

    if (
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
    ) {
      return payload.error;
    }

    return "Die YouTube-URL konnte nicht verarbeitet werden.";
  }

  function handleChange(nextValue: string) {
    setUrl(nextValue);
    setError(null);
    setResult(null);
    setIngestMs(null);

    if (state !== "loading") {
      setState("idle");
    }
  }

  async function handleSubmit(nextUrl: string) {
    if (state === "loading") {
      return;
    }

    const validation = validateYoutubeVideoUrl(nextUrl);
    if (!validation.ok) {
      showValidationError(validation.error);
      return;
    }

    setState("loading");
    setError(null);
    setResult(null);
    setIngestMs(null);

    const startedAt = performance.now();

    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: nextUrl }),
      });

      const payload = (await response.json()) as YoutubeIngestResponsePayload;

      if (!response.ok) {
        if (
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          payload.error === "INVALID_URL"
        ) {
          showValidationError("INVALID_URL");
          return;
        }

        throw new Error(readResponseErrorMessage(payload));
      }

      setResult(payload as YoutubeIngestResponse);
      setIngestMs(performance.now() - startedAt);
      setState("success");
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Es ist ein unerwarteter Fehler aufgetreten.";
      setError(message);
      setState("error");
    }
  }

  return (
    <>
      <div className="hero-form">
        <UrlInput
          onSubmit={handleSubmit}
          isLoading={state === "loading"}
          value={url}
          onChange={handleChange}
          error={error}
          id="hero-youtube-url"
        />
        <p className="microcopy">No account needed · Results in seconds · Metadata-grounded context</p>
      </div>

      <section className="demo-stack" aria-label="Live result">
        {state === "success" && result ? (
          <ResultCard data={result} ingestMs={ingestMs ?? undefined} />
        ) : null}
        {state === "error" && error ? <ResultCard data={null} errorMessage={error} /> : null}
      </section>

      <section className="cta-panel" aria-label="Bottom call to action">
        <p className="eyebrow">Try it now</p>
        <h2>Try a YouTube link.</h2>
        <p>See the context in seconds. No account, no setup.</p>

        <UrlInput
          onSubmit={handleSubmit}
          isLoading={state === "loading"}
          value={url}
          onChange={handleChange}
          error={error}
          className="url-input--compact"
          id="cta-youtube-url"
        />
      </section>
    </>
  );
}
