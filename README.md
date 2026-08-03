# PiXies - SoundScope

PiXies – SoundScope is a React + TypeScript web app that lets users explore and play tracks from the Mixcloud sound API. It focuses on clean, testable architecture, robust async behavior (debounce and cancellation),
and a polished UX with recent searches, cursor-based pagination, and an animated central track view
## Tech Stack

- Vite
- React
- TypeScript
- Vitest
- React Testing Library
- Plain CSS

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Run the production build:

```bash
npm run build
```

Run tests:

```bash
npm test -- --run
```

Run linting:

```bash
npm run lint
```

## CI

GitHub Actions runs linting, production build, unit tests, and a high-severity dependency audit on pull requests and pushes to `main`. Enable branch protection on `main` and require the `Verify` workflow before merging to keep the deployed branch stable.

## Run with Docker

Build the production image:

```bash
docker build -t pixies-soundscope .
```

Run the container on port `4173`:

```bash
docker run -p 4173:4173 pixies-soundscope
```

Or run it with Docker Compose:

```bash
docker compose up --build
```

Then open `http://localhost:4173`.

## Implemented Requirements

- Searches Mixcloud cloudcasts through the data layer.
- Displays results 6 at a time using Mixcloud cursor URLs for Next and Previous pagination.
- Stores the last 5 recent searches in `localStorage`, de-duplicated and ordered by recency. Typed searches are recorded after the input stays unchanged for 5 seconds, while Go/Enter records immediately.
- Supports list and tile result views, with the selected view persisted across visits.
- Shows a central selected-track image with a simple result-to-image animation.
- Embeds the selected track with the Mixcloud iframe widget. Selected tracks request autoplay by default, and the autoplay preference is persisted across visits. Browser autoplay policy may still require a user click.
- Handles debounced search input, in-flight request cancellation, stale-response protection, loading, empty, and error states.
- Provides keyboard-friendly controls, semantic regions, ARIA labels, live status messages, and focus management after selection.
- Includes Vitest unit tests for core search history and pagination logic.

## Architecture

The implementation follows `instructions/architecture.md` and keeps layers separated:

- Data/API layer (`src/api`): Mixcloud API contracts and `SoundApiClient`.
- State/business logic layer (`src/state`, `src/utils`): React context orchestration, search history, pagination, storage, and debounce.
- UI layer (`src/components`): search, result views, pagination controls, recent searches, image selection, and Mixcloud playback.

Tests live in `src/tests` and focus on browser-neutral business logic.

```text
UI components
  -> useSearchState hook / SearchStateProvider
    -> SoundApiClient + history, pagination, storage, debounce utilities
      -> Mixcloud search and embed endpoints
```

The UI never calls Mixcloud directly. Components dispatch actions through the search state hook, and the provider coordinates API calls, pagination decisions, history persistence, view-mode persistence, and request cancellation.

## Key Design Notes

`SoundApiClient` is the only module that knows Mixcloud URLs and response shapes. It maps Mixcloud cloudcasts into the internal `Track` type, so replacing the sound provider should be limited to the data layer.

Recent searches and pagination are pure TypeScript modules. They are easy to test without React, browser rendering, or network access.

Search requests use `AbortController` and a request id guard. This prevents stale responses from replacing newer results during rapid typing or pagination.

## Documentation

- Architecture: `instructions/architecture.md`
- Project standard: `instructions/The-Horizon-Standard.md`
- Optional backend/proxy notes: `docs/backend-proxy.md`

## Git History

The project was implemented in small conventional commits, moving from scaffold to domain contracts, API client, core logic, state orchestration, UI, accessibility polish, tests, and final documentation.
