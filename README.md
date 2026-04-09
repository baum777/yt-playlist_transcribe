# YouTube Kontextkarte

Eine einfache, deploybare Next.js-Landingpage für Vercel.

## Was sie tut

- Nimmt eine einzelne YouTube-Video-URL entgegen.
- Holt Metadaten serverseitig über die YouTube Data API.
- Nutzt Qwen 3.6 serverseitig für einen kurzen deutschen Kontextabschnitt.
- Zeigt Thumbnail, Titel, Kanalname und optional das Veröffentlichungsdatum.
- Zeigt einen kurzen deutschen Kontexttext, der ehrlich nur auf Metadaten basiert.
- Enthält zwei Tabs: `How to use` und `FAQ`.

## Was sie bewusst nicht tut

- Keine Playlist-Verarbeitung.
- Keine Transcript-Pipeline.
- Keine Lesson-Repo-Struktur.
- Keine künstliche Summary-Behauptung.

## Lokales Setup

```bash
npm install
copy .env.example .env.local
```

Setze anschließend in `.env.local`:

```bash
YOUTUBE_API_KEY=dein_youtube_data_api_key
DASHSCOPE_API_KEY=dein_dashscope_api_key
QWEN_MODEL=qwen3.6-plus
```

`YOUTUBE_API_KEY` wird für die Videometadaten verwendet. `DASHSCOPE_API_KEY` wird serverseitig genutzt, um den kurzen deutschen Kontext über die OpenAI-kompatible Qwen-API zu erzeugen. `QWEN_MODEL` bleibt konfigurierbar und defaultet auf `qwen3.6-plus`.

## Lokal starten

```bash
npm run dev
```

Dann im Browser öffnen:

```text
http://localhost:3000
```

## Vercel Deploy

Vercel erkennt das Projekt als Next.js-App automatisch.

1. Repository mit Vercel verbinden.
2. `YOUTUBE_API_KEY` als Environment Variable setzen.
3. `DASHSCOPE_API_KEY` als Environment Variable setzen.
4. Deploy starten.

## API-Verhalten

Der Endpunkt `POST /api/ingest` erwartet:

```json
{ "url": "https://www.youtube.com/watch?v=..." }
```

Antwortfelder:

- `videoId`
- `title`
- `channelTitle`
- `publishedAt`
- `thumbnailUrl`
- `description`
- `shortContextDe`
- `contextSource`

## Hinweise

- Die Seite speichert keine Inhalte in einer Datenbank.
- Playlists sind in V1 absichtlich nicht Teil des Flows.
- Wenn die Beschreibung knapp oder unbrauchbar ist, bleibt die Kontext-Einordnung bewusst zurückhaltend.
- Wenn Qwen nicht verfügbar ist, fällt die Kontextzeile auf eine konservative metadatenbasierte Formulierung zurück.
