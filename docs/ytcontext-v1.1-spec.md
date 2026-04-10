# 1. Executive Summary
YTContext v1.1 remains a single-page Next.js + TypeScript landing page that is metadata-only, single-action, honest, and non-persistent. This document is historical migration context from the prior deployment wave; the active deployment target in the repo is now Vercel.

Current repo truth to preserve:
- The page is already structured as `nav`, `hero`, `demo`, `how-it-works`, `features`, `qwen-section`, `info-tabs`, `bottom-cta`, and `footer`.
- The product already uses a single YouTube URL ingest flow and server-side metadata lookup in `app/api/ingest/route.ts`.
- The existing Qwen path is already a server-side metadata compression layer, not transcript understanding.
- Historical deployment references below are migration context only; Vercel is the active deployment target.

v1.1 changes the control surface without changing the product class:
- the user chooses summary depth before analysis
- exports are generated only after a successful result
- export files are runtime artifacts only
- deployment guidance now targets Vercel

# 2. Product Goal
Allow a user to paste one YouTube video URL, choose how deep the metadata-based German context should be, receive a polished result card, and export the generated result in common formats.

The product goal is not to:
- summarize transcripts
- manage playlists
- store history
- become a dashboard
- add multi-step workflows

The user journey stays intentionally short:
1. paste URL
2. choose summary depth
3. analyze
4. read result
5. export if needed

# 3. Scope
In scope for v1.1:
- hero input block summary depth control
- bottom CTA input block summary depth control
- ingest request contract update to include `summaryLength`
- summary generation length variants: `Kurz`, `Standard`, `Ausführlich`
- result-card export actions
- `app/api/export/route.ts`
- `lib/exporters.ts`
- Vercel deployment guidance
- content and FAQ updates to explain the new behavior honestly

Out of scope:
- playlist ingest
- transcript processing
- persistent storage
- background jobs
- auth
- multi-video collections
- user accounts

# 4. Non-Goals
YTContext v1.1 must not:
- imply transcript comprehension
- imply video watching
- imply semantic understanding beyond metadata
- persist generated exports or results
- introduce a second workflow path
- add a settings panel or dashboard chrome
- convert the app to static export if that breaks server routes

The export feature is a convenience layer, not a storage system. Generated files exist only at request time.

# 5. Information Architecture
Keep the existing page structure intact:
1. `nav`
2. `hero`
3. `demo`
4. `how-it-works`
5. `features`
6. `qwen-section`
7. `info-tabs`
8. `bottom-cta`
9. `footer`

Placement rules:
- summary depth control appears in the hero input block
- summary depth control also appears in the bottom CTA input block
- in both places it sits below the URL input and above the submit button
- export actions appear only inside the result card area
- export actions sit below the generated context and above the footer/meta row

The page must still feel like a compact landing page with one action, not a control surface.

# 6. Page Sections
`app/page.tsx` remains the top-level composition shell.

Section responsibilities:
- `nav`: brand lockup and model badge only
- `hero`: value proposition plus primary analysis controls
- `demo`: static/live preview result card area
- `how-it-works`: explains the three-step flow
- `features`: describes the core product capabilities
- `qwen-section`: explains Qwen 3.6 as the metadata compression layer
- `info-tabs`: usage and FAQ content
- `bottom-cta`: repeated analysis controls for conversion
- `footer`: minimal product and model attribution

The hero and bottom CTA should mirror one another structurally so the flow feels consistent, not duplicated.

# 7. Component Breakdown
`app/page.tsx`
- Responsibility: page composition only
- State ownership: none
- Placement: top-level route shell
- Behavior: renders the required sections in the fixed order above

`components/landing-controls.tsx`
- Responsibility: owns shared analysis state for the page
- State ownership: URL, `summaryLength`, loading/error state, result, ingest timing
- Placement: rendered in the hero and mirrored in the bottom CTA shell
- Behavior: resets the current result when the URL or summary length changes, submits one analysis request, and renders the success/error result area

`components/url-input.tsx`
- Responsibility: pure URL input field block
- State ownership: none
- Props: value, onChange, error, disabled/loading, id, className
- Placement: first control in both input blocks
- Behavior: validates URL syntax visually, but does not own submit action
- Required change: remove the submit button from this component so the summary length control can sit between URL input and submit button

`components/summary-length-toggle.tsx`
- Responsibility: compact segmented control for summary depth selection
- State ownership: none
- Props: `value`, `onChange`, `disabled?`, `id`, `name?`
- Placement: directly below the URL input and above the submit button in both input blocks
- Behavior: exposes exactly three options: `Kurz`, `Standard`, `Ausführlich`

`components/result-card.tsx`
- Responsibility: renders the final canonical result
- State ownership: none, except optional local disclosure state if export actions need it
- Props: canonical result object, demo mode flag, ingest timing, error message
- Placement: inside the demo/result area and again for error states
- Behavior: shows metadata, generated German summary, selected summary depth, and export actions

`components/export-actions.tsx`
- Responsibility: visible download/export UI after success
- State ownership: optional local export-in-progress state
- Props: canonical result object, current export state, export callback
- Placement: below the generated context and above the footer/meta row in the result card
- Behavior: renders visible primary actions for Markdown, PDF, and JSON, plus a secondary `More formats` disclosure

`components/info-tabs.tsx`
- Responsibility: how-to and FAQ content
- State ownership: active tab only
- Placement: unchanged
- Behavior: update copy so it matches v1.1, especially summary depth selection and export behavior

`components/url-form.tsx`
- Status: legacy or duplicate concern
- Recommendation: do not keep a second independent submission surface
- If retained: it should be reduced to a wrapper around `url-input`, `summary-length-toggle`, and the submit button, not a parallel form implementation

# 8. Visual System
Preserve the current visual direction:
- warm editorial surfaces
- soft gradients and subtle borders
- one clear accent color
- compact readable typography
- no dashboard framing

The new summary depth control should look like a pill row, not a settings panel.

Visual rules for the new controls:
- compact segmented control
- default selection visually obvious but restrained
- three equal-width or near-equal-width pills on desktop
- wrap cleanly on mobile without looking like a control matrix

Visual rules for export actions:
- primary actions should read as downloads, not admin tools
- visible actions should feel lighter than the main submit button
- `More formats` should be secondary and collapsible

# 9. Responsive Behavior
Desktop:
- hero and bottom CTA show URL input, summary toggle, and submit button in a single vertical stack
- result card uses the existing media/body split
- export actions can sit in a horizontal button row with a secondary disclosure

Tablet and mobile:
- URL input becomes full width
- summary toggle wraps or stacks without losing clear selection state
- submit button spans full width if needed
- export actions stack vertically or in two compact rows
- result card body stacks beneath the thumbnail at narrower widths

The summary depth control must remain easy to tap on mobile and must not compress into unreadable chips.

# 10. Interaction Model
Primary flow:
1. user enters a YouTube URL
2. user selects `Kurz`, `Standard`, or `Ausführlich`
3. user clicks Analyze
4. the page fetches metadata and generates the metadata-based German context
5. the result card renders
6. export actions appear

Interaction rules:
- summary depth is chosen before submit, not after
- default summary depth is `Kurz`
- changing the URL or summary depth invalidates the previous successful result
- exports are on-demand and only available after a successful result exists
- export buttons generate runtime artifacts from the canonical result object at click time
- no export file is pre-generated or committed

The interaction must remain single-action. Exports are secondary actions tied to the already completed result.

# 11. Backend Integration Contract
`POST /api/ingest`
- Request body:
```json
{ "url": "https://www.youtube.com/watch?v=...", "summaryLength": "short" }
```
- `summaryLength` values:
  - `short` for `Kurz`
  - `standard` for `Standard`
  - `long` for `Ausführlich`
- Behavior:
  - validate that the URL resolves to one YouTube video only
  - validate that `summaryLength` is present and valid
  - fetch metadata server-side
  - generate a German summary that matches the selected depth
  - remain metadata-only

`app/api/ingest/route.ts`
- owns request validation and orchestration
- calls `lib/youtube.ts` for metadata
- calls `lib/qwen.ts` for the primary summary
- calls `lib/summarize.ts` for fallback text
- returns the canonical normalized result object

`POST /api/export`
- Request body:
```json
{ "format": "md", "result": { "...canonical normalized result object..." } }
```
- Behavior:
  - validate the canonical result object
  - validate the requested export format
  - generate the artifact on demand
  - return a downloadable file response

Vercel runtime assumptions:
- Next.js server runtime is available
- env vars are configured in the Vercel project settings
- the app does not require a database for v1

# 12. Data Model
Use a single canonical normalized result object for the UI, API, and exports.

Recommended canonical object shape:
- `schemaVersion`: `1.1`
- `videoId`: string
- `url`: string
- `title`: string
- `channelTitle`: string
- `publishedAt`: string | null
- `thumbnailUrl`: string
- `duration`: string
- `viewCount`: number
- `description`: string
- `summaryLength`: `short | standard | long`
- `summaryLengthLabel`: `Kurz | Standard | Ausführlich`
- `summaryDe`: string
- `summarySource`: `qwen | fallback`
- `generatedAt`: ISO timestamp string

Type responsibilities:
- `types/video-context.ts` should define the canonical result type and the summary length enum
- `types/youtube.ts` should remain limited to YouTube-specific metadata shapes if still needed

Derived export artifacts are not part of the canonical object. They are generated from it at request time.

# 13. API Contract
`POST /api/ingest`
- Accepts `url` and `summaryLength`
- Returns either a validation error or the canonical normalized result object
- Fails closed if URL or summary length is invalid
- Fails closed if YouTube metadata is unavailable

Recommended error shape:
```json
{ "error": "human-readable message" }
```

`POST /api/export`
- Accepts `format` and `result`
- Returns a file download
- Does not persist the file
- Does not create a repo artifact

Export format rules:
- visible primary formats: `md`, `pdf`, `json`
- secondary formats under `More formats`: `docx`, `txt`, `csv`, `jsonl`, `html`, `epub`, `vtt`

Format semantics:
- Markdown: human-readable result with metadata and summary
- PDF: printable rendering of the same content
- JSON: canonical normalized result object exactly or with only transport-safe wrappers
- DOCX: document version of the same content
- TXT: plain text version
- CSV: one-row record for metadata and summary fields
- JSONL: one-line record containing the canonical result object
- HTML: standalone result document
- EPUB: single-chapter ebook-style packaging of the result
- VTT: synthetic cue packaging of the generated summary text only, not transcript content

# 14. State Model
Page-level state in `components/landing-controls.tsx`:
- `url`
- `summaryLength`
- `state`: `idle | loading | success | error`
- `result`
- `error`
- `ingestMs`

Export UI state in `components/export-actions.tsx`:
- selected export format or active export-in-progress format
- optional disclosure state for `More formats`

State rules:
- default `summaryLength` is `short`
- typing a new URL clears the current result and error state
- changing summary length clears the current result and error state
- successful ingest populates the canonical result object
- export state is derived from the current result and does not replace it

There is no persisted state, no URL history state, and no cross-session state.

# 15. Content Specification
Hero copy:
- must explain that the app uses YouTube metadata and Qwen 3.6 to create a German context summary
- must state that summary depth is selectable before analysis
- must remain honest that the result is metadata-based, not transcript-based

Summary depth labels:
- `Kurz`
  - 2 to 3 sentences
  - concise metadata-based context
- `Standard`
  - 4 to 6 sentences
  - moderate detail, still compact
- `Ausführlich`
  - 2 to 4 short paragraphs
  - deeper metadata-based framing, not transcript analysis

Result-card copy:
- show the selected depth as a visible chip or meta label
- show the generated German summary in the main context block
- show export actions directly below the summary
- keep the footer/meta row small and secondary

FAQ updates:
- explain that summary depth changes only the amount of metadata-based text, not the source of understanding
- explain that no transcript or audio analysis is involved
- explain that exports are generated on demand

Deployment copy:
- align deployment guidance with Vercel-specific instructions
- do not mention static export as the primary path

# 16. Accessibility Requirements
Summary length control:
- must be keyboard operable
- should behave like a radio group or segmented control
- must announce the selected state clearly to assistive technology

Forms:
- URL input must have an explicit label
- helper text must describe accepted YouTube URL shapes
- error text must be tied to the field with `aria-describedby`

Result and export areas:
- success and error changes should be announced politely
- export buttons need clear accessible names, especially for file type and format
- `More formats` disclosure must expose expanded/collapsed state

General:
- preserve visible focus rings
- maintain contrast across button, pill, and card states
- keep tap targets usable on mobile

# 17. Performance and Deployment Requirements
Performance:
- keep the client surface small and focused
- do not move metadata fetches to the client
- do not precompute export files
- keep Qwen calls server-side

Deployment:
- target a Vercel deployment
- use the Node server runtime required by Next.js API routes
- configure env vars in the Vercel project settings
- do not depend on non-Vercel deployment assumptions
- do not convert to a static-only deployment if that breaks `/api/ingest` or `/api/export`

Recommended Vercel settings:
- build command: `npm run build`
- start command: managed by Vercel
- project type: Next.js app

Required env vars in Vercel:
- `YOUTUBE_API_KEY`
- `OPENROUTER_API_KEY`
- `OPENROUTER_BASE_URL`
- `QWEN_MODEL_ID`
- `QWEN_TIMEOUT_MS`

No database is needed for v1.

# 18. Export and Download Architecture
All exports must derive from one canonical normalized result object.

Recommended split:
- `components/result-card.tsx`: renders the result and export entry points
- `components/export-actions.tsx`: handles export UI and click interactions
- `app/api/export/route.ts`: validates and returns the downloaded artifact
- `lib/exporters.ts`: pure serialization helpers for each format

Architecture rules:
- exports are runtime artifacts only
- generated export files are never stored in the repo
- export generation must not mutate the canonical result object
- the same canonical object drives Markdown, PDF, JSON, DOCX, TXT, CSV, JSONL, HTML, EPUB, and VTT

File naming recommendation:
- `ytcontext-{videoId}-{summaryLength}.{ext}`

Format handling:
- primary visible formats should be one-click downloads
- secondary formats should be hidden behind a secondary disclosure so the page does not become tool-heavy
- if a format cannot be generated, the user should receive a clear failure message

# 19. Implementation Plan
Wave 1: data contract and server orchestration
- update `types/video-context.ts`
- update `app/api/ingest/route.ts`
- update `lib/qwen.ts`
- update `lib/summarize.ts`
- update `lib/youtube.ts` only if request validation or normalized shapes need to change

Wave 2: input controls and page state
- refactor `components/url-input.tsx` into a pure field component
- add `components/summary-length-toggle.tsx`
- update `components/landing-controls.tsx`
- keep hero and bottom CTA mirrored

Wave 3: result card and export surface
- update `components/result-card.tsx`
- add `components/export-actions.tsx`
- add `lib/exporters.ts`
- add `app/api/export/route.ts`

Wave 4: content and help updates
- update `components/info-tabs.tsx`
- update `components/features-grid.tsx`
- update `components/how-it-works.tsx`
- update `components/qwen-section.tsx`
- update `README.md` or dedicated deployment notes to reflect Vercel

Wave 5: verification and cleanup
- verify the UI flow from hero to result to export
- verify the API contracts
- verify Vercel deployment assumptions
- retire or repurpose `components/url-form.tsx` if it duplicates the new control flow

# 20. Acceptance Criteria
Functional:
- both hero and bottom CTA show the URL input
- both hero and bottom CTA show the summary depth control
- the summary depth default is `Kurz`
- the summary depth control is placed below the URL field and above the submit button
- `POST /api/ingest` accepts `url` and `summaryLength`
- the generated summary length matches the selected depth
- the result card shows export actions only after a successful result
- visible export actions are Markdown, PDF, and JSON
- secondary formats exist under `More formats`
- exports are generated on demand from one canonical normalized result object
- no export file is committed to the repo
- deployment guidance targets Vercel

Behavioral:
- the page remains metadata-only
- the page remains single-action
- the page remains non-persistent
- the page does not become a dashboard
- the page does not claim transcript understanding
- the page does not require a database

Verification:
- invalid URL input is rejected
- missing or invalid summary length is rejected by the API
- export actions are not shown before success
- changing URL or summary length clears stale success state
- the page still renders the existing section order

# 21. Open Questions / Assumptions
Assumptions:
- `summaryLength` should use normalized values `short`, `standard`, and `long`
- the visible labels should remain `Kurz`, `Standard`, and `Ausführlich`
- the canonical result object should replace the semantically narrow `shortContextDe` naming with a generalized summary field such as `summaryDe`
- exports should be generated server-side rather than in the browser
- hero and bottom CTA should share the same page state

Open questions:
- which PDF, DOCX, and EPUB libraries the implementation should use
- whether `components/url-form.tsx` should be deleted or kept as a compatibility wrapper
- whether `JSON` export should be the raw canonical object or a transport wrapper containing filename and schema metadata
- whether export downloads should stream directly or pass through a short-lived in-memory buffer

# 22. Recommended Build Order
1. Update the canonical types and request validation.
2. Make `app/api/ingest/route.ts` accept `summaryLength`.
3. Make `lib/qwen.ts` and `lib/summarize.ts` length-aware.
4. Refactor `components/url-input.tsx` so the submit button is no longer embedded in the input field block.
5. Add `components/summary-length-toggle.tsx`.
6. Update `components/landing-controls.tsx` to own the shared form state.
7. Update `components/result-card.tsx` to show the selected depth and export actions.
8. Add `components/export-actions.tsx`, `lib/exporters.ts`, and `app/api/export/route.ts`.
9. Update `components/info-tabs.tsx`, `components/features-grid.tsx`, `components/how-it-works.tsx`, and `components/qwen-section.tsx` for v1.1 copy.
10. Align deployment guidance with Vercel guidance.

# 23. Change Summary
v1.1 changes the product in three concrete ways:
- users choose summary depth before analysis
- successful results can be exported in multiple formats
- deployment guidance moves to Vercel

It does not change the product class:
- still one page
- still metadata-only
- still no transcript pipeline
- still no persistence
- still no dashboard behavior

# 24. Migration Impact
Breaking or semibreaking changes:
- `POST /api/ingest` now requires `summaryLength`
- the canonical result object should gain a generalized summary field
- `components/url-input.tsx` needs structural refactoring because the submit button can no longer live inside the same block as the URL input
- `components/result-card.tsx` must render export actions below the summary
- Vercel is the active deployment target in deployment instructions

Operational impact:
- new server route for exports
- more server-side serialization work
- no database migration
- no persistence migration

Compatibility note:
- if any consumer depends on `shortContextDe`, provide a deliberate migration path rather than silently reusing the old name for a longer summary model

# 25. Recommended Next Step
Implement the contract layer first:
- `types/video-context.ts`
- `app/api/ingest/route.ts`
- `lib/qwen.ts`
- `lib/summarize.ts`

Once the contract is stable, wire the UI:
- `components/url-input.tsx`
- `components/summary-length-toggle.tsx`
- `components/landing-controls.tsx`
- `components/result-card.tsx`

Then add exports:
- `components/export-actions.tsx`
- `lib/exporters.ts`
- `app/api/export/route.ts`

Finish by updating the content copy and aligning deployment notes with Vercel instructions.
