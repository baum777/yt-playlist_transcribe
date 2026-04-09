"use client";

import type { FormEvent } from "react";
import { useState } from "react";

interface UrlFormProps {
  onSubmit: (url: string) => Promise<void> | void;
  pending: boolean;
}

export function UrlForm({ onSubmit, pending }: UrlFormProps) {
  const [value, setValue] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(value.trim());
  }

  return (
    <form className="url-form" onSubmit={handleSubmit}>
      <label className="field-label" htmlFor="youtube-url">
        YouTube-URL
      </label>
      <div className="form-row">
        <input
          id="youtube-url"
          name="youtube-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="https://www.youtube.com/watch?v=..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="url-input"
          required
        />
        <button className="submit-button" type="submit" disabled={pending}>
          {pending ? "Analysiere..." : "URL analysieren"}
        </button>
      </div>
      <p className="form-hint">
        Unterstützt werden einzelne Video-URLs. Playlist-URLs sind in V1 bewusst nicht Teil des Flows.
      </p>
    </form>
  );
}
