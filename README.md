# PiXies - SoundScope

PiXies - SoundScope is a React + TypeScript front-end exam project for searching and playing Mixcloud tracks. It uses a layered architecture so Mixcloud-specific data access stays isolated from state/business logic and UI components.

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

## Implemented Requirements

- Searches Mixcloud cloudcasts through the data layer.
- Displays results 6 at a time using Mixcloud cursor URLs for Next and Previous pagination.
- Stores the last 5 recent searches in `localStorage`, de-duplicated and ordered by recency.
- Supports list and tile result views, with the selected view persisted across visits.
- Shows a central selected-track image with a simple result-to-image animation.
- Embeds the selected track with the Mixcloud iframe widget after the user clicks the central image.
- Handles debounced search input, in-flight request cancellation, stale-response protection, loading, empty, and error states.
- Provides keyboard-friendly controls, semantic regions, ARIA labels, live status messages, and focus management after selection.
- Includes Vitest unit tests for core search history and pagination logic.

## Architecture

The implementation follows `instructions/architecture.md` and keeps layers separated:

- `src/api`: Mixcloud API contracts and `SoundApiClient`.
- `src/state`: React context orchestration plus pure business logic managers.
- `src/components`: UI components that consume state through `useSearchState`.
- `src/utils`: reusable browser-neutral utilities such as storage and debounce.
- `src/tests`: unit tests for core logic.

The UI never calls Mixcloud directly. Components dispatch actions through the search state hook, and the provider coordinates API calls, pagination decisions, history persistence, view-mode persistence, and request cancellation.

## Key Design Notes

`SoundApiClient` is the only module that knows Mixcloud URLs and response shapes. It maps Mixcloud cloudcasts into the internal `Track` type, so replacing the sound provider should be limited to the data layer.

Recent searches and pagination are pure TypeScript modules. They are easy to test without React, browser rendering, or network access.

Search requests use `AbortController` and a request id guard. This prevents stale responses from replacing newer results during rapid typing or pagination.

## Documentation

- Architecture: `instructions/architecture.md`
- Project standard: `instructions/The-Horizon-Standard.md`

## Git History

The project was implemented in small conventional commits, moving from scaffold to domain contracts, API client, core logic, state orchestration, UI, accessibility polish, tests, and final documentation.
