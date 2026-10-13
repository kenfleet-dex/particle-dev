# Particle — AI-assisted interactive prototype

Particle is a browser-based prototype for finding and selecting shading replacement parts. It demonstrates quote-driven replacement workflows, parts discovery, mounting configuration, a grouped replacement list, and a testing feedback loop.

The application code and assets match deployed prototype version **42**, source commit `deebd61767e67cb9814a201aabd1dc7c85c87098`.

Live prototype: https://particle-interactive-prototype.ai-team-scrum.chatgpt.site/

The hosted prototype requires owner access. Anyone can run this source locally using the instructions below.

## Run locally

No package installation or build step is required. With Python 3 installed, open a terminal in this folder and run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:8000/ in a browser. Choose **Continue** on the demo login screen; an email is optional. Stop the server with Ctrl+C.

## What works

- A sample quote workflow with 16 selectable quote lines, component discovery, and bracket replacement methods.
- **As ordered** and **Change configuration** workflows using the shared **Complete Kit / Partial** choice. Complete Kit adds the matching parts; Partial opens bracket coverage selection.
- Parts directory searches, live suggestions, product and mounting filters, and product/detail dialogs.
- A replacement list that groups selections by source and mount, retains orderable part numbers and quantities, and supports detail inspection, changes, removal, undo, and review.
- **Download CSV** on review, downloading the supplied fixed sample CSV.
- Unique references for pages, dialogs, and expanded sections. Reference buttons copy a quick-change prompt and open a feedback dialog with bullet notes.
- **Save note** adds feedback to a single browser-tab session log and closes the dialog. **End Prototype Session** downloads a Markdown log grouped by section title and reference ID. Saved feedback survives same-tab refresh using session storage; the next saved note after export starts a fresh session.
- Introductory Part Pilot, Shade Builder, and CSR Automate flows, plus an optional read-only WebMCP inspection tool when supported by the browser.

## Prototype boundaries

The demo login is not real authentication. Quote upload is simulated: it does not parse a PDF. There is no production order submission, backend catalog integration, live engineering chat, or runtime AI model integration. The CSV download is the supplied sample file rather than an export generated from current selections. Part Pilot is a guided prototype, not live AI inference. Some secondary resource links use a pending-resource preview.

The project was built **with AI assistance** through iterative requirements, implementation, and review; it is not presented as an AI-powered production backend.

## Code map

| File | Purpose |
| --- | --- |
| `dist/index.html` | Application entry point and script/style loading. |
| `dist/app.js` | Screen rendering, sample quote/catalog data, navigation, shared dialogs, searches, filters, and workflow actions. |
| `dist/replacement-list.js` | Source-aware grouped selections, quantities, detail views, editing, and review/CSV behavior. |
| `dist/references.js` | Reference copy prompts, bullet note editor, session storage, and Markdown session export. |
| `dist/style.css` | Core application styles and responsive layout. |
| `dist/polish.css` | Visual refinements, shared reference/feedback styles, and session controls. |
| `dist/replacement-list.css` | Replacement list, detail sheet, pagination, and review styles. |
| `dist/icons.js` | Icon rendering helpers. |
| `dist/drawing.html` | Secondary resource/drawing preview. |
| `dist/part-replace-parts.csv` | Exact supplied sample CSV download. |
| `dist/fonts/`, `dist/*.png` | Self-hosted fonts and visual assets. |
| `dist/LUCIDE-LICENSE.txt` | Included icon license. |

## Validation

The deployed changes were verified with JavaScript syntax checks and browser interaction tests. The most recent tests covered saving feedback without a download, retaining notes across navigation and refresh, repeated-ID grouping, exporting six notes across three sections, including a final draft, exporting from different dialog types, and starting a clean subsequent session. This source export was checked against the deployed commit file by file and its ZIP was verified for completeness and integrity.
