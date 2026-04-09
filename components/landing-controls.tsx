"use client";

import { useState } from "react";

import { ResultCard } from "@/components/result-card";
import { UrlInput } from "@/components/url-input";
import type { YoutubeIngestResponse } from "@/types/video-context";

type LoadState = "idle" | "loading" | "success" | "error";

export function LandingControls() {
  const [state, setState] = useState<LoadState>("idle");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<YoutubeIngestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ingestMs, setIngestMs] = useState<number | null>(null);

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
    if (!nextUrl.trim()) {
      setError("Please paste a YouTube URL before analyzing.");
      setState("error");
      setResult(null);
      setIngestMs(null);
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

      const payload = (await response.json()) as
        | YoutubeIngestResponse
        | { error?: string; message?: string };

      if (!response.ok) {
        const message =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Die YouTube-URL konnte nicht verarbeitet werden.";
        throw new Error(message);
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
