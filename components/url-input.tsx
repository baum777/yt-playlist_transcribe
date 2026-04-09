"use client";

import type { FormEvent } from "react";

interface UrlInputProps {
  onSubmit: (url: string) => Promise<void> | void;
  isLoading: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  className?: string;
  id?: string;
}

export function UrlInput({
  onSubmit,
  isLoading,
  value,
  onChange,
  error,
  className,
  id = "youtube-url",
}: UrlInputProps) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(value.trim());
  }

  return (
    <form className={["url-input", className].filter(Boolean).join(" ")} onSubmit={handleSubmit}>
      <label className="field-label" htmlFor={id}>
        YouTube URL
      </label>

      <div className="url-input__row">
        <input
          id={id}
          name="youtube-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="https://youtube.com/watch?v=..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="url-input__field"
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : `${id}-help`}
        />
        <button
          className="cta-button"
          type="submit"
          disabled={isLoading}
          aria-label={isLoading ? "Analyzing, please wait" : "Analyze YouTube URL"}
        >
          {isLoading ? "Analyzing..." : "Analyze →"}
        </button>
      </div>

      <p className="form-hint" id={`${id}-help`}>
        Paste a standard watch link or a youtu.be short link.
      </p>

      <div className="form-status" aria-live="polite" id={`${id}-error`}>
        {error ? error : null}
      </div>
    </form>
  );
}
