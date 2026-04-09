# YouTube Kontextkarte

YTContext ist eine Next.js + TypeScript Web App für Vercel. Sie nimmt eine einzelne YouTube-Video-URL entgegen, lädt Metadaten serverseitig, erzeugt daraus einen kurzen deutschen Kontext und bleibt dabei strikt metadata-basiert.

## Was die App tut

- Nimmt eine einzelne YouTube-Video-URL entgegen.
- Holt Metadaten serverseitig über die YouTube Data API.
- Nutzt Qwen 3.6 serverseitig über OpenRouter für einen deutschen Kontexttext.
- Zeigt Thumbnail, Titel, Kanalname und optional das Veröffentlichungsdatum.
- Bleibt ehrlich metadata-basiert und behauptet keine Transcript- oder Audioanalyse.
- Verwendet serverseitige Runtime-Konfiguration für Timeout, Beschreibungslänge und Standard-Summary-Level.

## Was die App bewusst nicht tut

- Keine Playlist-Verarbeitung.
- Keine Transcript-Pipeline.
- Keine Persistenz.
- Keine Static-Site-Only-Bereitstellung.
- Keine künstliche Summary-Behauptung.

## Lokale Einrichtung

```bash
npm install
copy .env.example .env.local
```

Setze in `.env.local` mindestens:

```bash
YOUTUBE_API_KEY=dein_youtube_data_api_key
OPENROUTER_API_KEY=dein_openrouter_api_key
```

Optional:

```bash
APP_URL=http://localhost:3000
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
QWEN_MODEL_ID=qwen/qwen3.6-plus
QWEN_TIMEOUT_MS=15000
INGEST_TIMEOUT_MS=20000
MAX_DESCRIPTION_CHARS=800
DEFAULT_SUMMARY_LENGTH=short
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=false
```

## Lokaler Start

Build:

```bash
npm install && npm run build
```

Start:

```bash
npm run start
```

Dev:

```bash
npm run dev
```

Dann im Browser öffnen:

```text
http://localhost:3000
```

## Vercel Deployment

Die Zielplattform ist Vercel. Die App bleibt serverfähig und darf nicht als statische Site bereitgestellt werden.

1. Repository mit Vercel verbinden.
2. Das Projekt in Vercel importieren.
3. Den Branch auswählen, der deployed werden soll.
4. Root Directory auf das Repository-Root setzen (`.`), falls Vercel es nicht automatisch übernimmt.
5. Build Command bei Bedarf auf `npm install && npm run build` setzen.
6. Deploy auslösen.
7. Smoke Test gegen die Vercel-URL durchführen.

Hinweise:

- Vercel benötigt für diese App kein separates `start` Command in der Projektkonfiguration.
- Secrets werden in den Vercel Project Settings gespeichert und nicht im Repo.
- `APP_URL` sollte auf die öffentliche Produktions-URL gesetzt werden, damit absolute Metadaten und Canonical-URLs korrekt sind.
- Vercel injiziert Runtime-Metadaten wie `VERCEL_URL` automatisch; ein manueller Eintrag ist nicht erforderlich.

## Smoke Test

- Die Vercel-URL lädt ohne Fehler.
- Die Startseite rendert die bestehende Landingpage.
- Eine bekannte öffentliche YouTube-URL wird angenommen.
- `/api/ingest` liefert ein Ergebnisobjekt mit `summaryDe`, `summaryLength`, `summaryLengthLabel`, `summarySource` und den YouTube-Metadaten.
- Die Summary bleibt metadata-basiert und behauptet keine Transcript-Analyse.
- Das Deployment bleibt server-capable wegen der API-Routen und ist nicht static-only.

## API-Verhalten

`POST /api/ingest` erwartet:

```json
{ "url": "https://www.youtube.com/watch?v=..." }
```

`summaryLength` ist optional; wenn der Client es nicht sendet, verwendet der Server `DEFAULT_SUMMARY_LENGTH` mit dem Fallback `short`.

Canonical response fields:

- `schemaVersion`
- `videoId`
- `url`
- `title`
- `channelTitle`
- `publishedAt`
- `thumbnailUrl`
- `duration`
- `viewCount`
- `description`
- `summaryLength`
- `summaryLengthLabel`
- `summaryDe`
- `summarySource`
- `generatedAt`

Compatibility aliases currently returned for transition only:

- `shortContextDe`
- `contextSource`

## Addendum: Environment Variable Inventory

### Public / non-secret env keys

| Variable | Required | Secret | Purpose | Example |
|---|---|---|---|---|
| `NODE_ENV` | no | no | Standard Node runtime mode for local development and production builds. | `development` |
| `PORT` | no | no | HTTP port binding for local runs. Vercel sets runtime bindings automatically in production. | `3000` |
| `APP_URL` | no | no | Absolute base URL used for metadata and local defaulting. | `http://localhost:3000` |
| `VERCEL_URL` | no | no | Vercel deployment hostname injected at runtime and used as a fallback when `APP_URL` is absent. | `ytcontext.vercel.app` |
| `INGEST_TIMEOUT_MS` | no | no | Timeout for the YouTube metadata fetch during ingest. | `20000` |
| `MAX_DESCRIPTION_CHARS` | no | no | Maximum description length kept before summarization. | `800` |
| `DEFAULT_SUMMARY_LENGTH` | no | no | Fallback summary length when the client omits `summaryLength`. | `short` |
| `LOG_LEVEL` | no | no | Runtime log level label for server-side request logging. | `info` |
| `ENABLE_REQUEST_LOGGING` | no | no | Enables lightweight ingest request logging on the server. | `false` |
| `OPENROUTER_BASE_URL` | no | no | OpenRouter API base URL for the OpenAI-compatible Qwen client. | `https://openrouter.ai/api/v1` |
| `QWEN_MODEL_ID` | no | no | OpenRouter model identifier used for Qwen requests. | `qwen/qwen3.6-plus` |
| `QWEN_TIMEOUT_MS` | no | no | Timeout applied to the Qwen client requests in milliseconds. | `15000` |

### Non-public / secret env keys

| Variable | Required | Secret | Purpose | Where to get it | Official source/provider |
|---|---|---|---|---|---|
| `YOUTUBE_API_KEY` | yes | yes | Server-side YouTube Data API access for metadata fetches. | Google Cloud Console API credentials | Google / YouTube Data API |
| `OPENROUTER_API_KEY` | yes | yes | Server-side OpenRouter authentication for Qwen requests. | OpenRouter account dashboard | OpenRouter |

Legacy DashScope / Alibaba Model Studio variables are intentionally omitted from the primary path. The current repo does not use them.
The repository snapshot does not currently expose export routes, so `EXPORT_*` variables are intentionally not part of the active contract yet.

## Notes

- The app does not store results in a database.
- Playlists are intentionally out of scope.
- When OpenRouter or Qwen is unavailable, the route falls back to a conservative metadata-based summary.
