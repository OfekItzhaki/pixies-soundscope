# PiXies - SoundScope Architecture

## Overview

This document describes the architecture and implementation plan for a React + TypeScript PiXies front-end application that uses the Mixcloud sound API to search tracks, display paginated results, maintain recent searches, and play embedded tracks. The design emphasizes a clear separation between data access, state/business logic, and UI components, with typed core logic and unit tests.

The application targets the latest Chrome release.

## Goals

- Allow users to search a sound API (Mixcloud) for tracks by entering text in a search box.
- Display search results 6 at a time with Next/Previous pagination using the API's paging cursor.
- Maintain a history of the last 5 searches across visits, de-duplicated and ordered by recency.
- Provide a central image container that animates when a result is selected and shows the track's image.
- Embed and play the selected track when the central image is clicked.
- Handle async behavior correctly (debounce, cancellation, no stale races) and show loading/empty/error states.
- Use TypeScript with properly typed data and unit tests on core logic.
- Structure the app into decoupled data, state/business logic, and UI layers so that the sound provider can be swapped by changing only the data layer.

## Stack

- Build: Vite + React + TypeScript
- UI: React functional components with hooks
- State: React context + custom hooks for search/state management
- Styling: CSS modules or plain CSS
- Testing: Vitest (or Jest) + React Testing Library
- Sound API: Mixcloud search and embed endpoints

## Directory Structure

- `src/`
  - `api/`
    - `soundApiClient.ts` - wraps Mixcloud API calls and exposes typed functions.
  - `state/`
    - `SearchStateContext.tsx` - React context and provider for search state.
    - `useSearchState.ts` - hook for consuming search state.
    - `searchHistoryManager.ts` - pure TypeScript module for recent searches logic.
    - `paginationManager.ts` - pure TypeScript module for cursor-based pagination logic.
  - `components/`
    - `App.tsx` - root component wiring containers together.
    - `SearchContainer.tsx` - search box, Go button, and results container.
    - `ResultsList.tsx` - list view for search results.
    - `ResultsGrid.tsx` - tile view for search results.
    - `PaginationControls.tsx` - Next/Previous and view mode buttons.
    - `ImageContainer.tsx` - central image and track embed behavior.
    - `RecentSearchesContainer.tsx` - recent search terms list.
  - `utils/`
    - `debounce.ts` - debouncing helper.
    - `storage.ts` - thin wrapper around `localStorage`.
  - `tests/`
    - `searchHistoryManager.test.ts` - unit tests for history logic.
    - `paginationManager.test.ts` - unit tests for pagination logic.
  - `main.tsx` - React entry point.
  - `index.css` - base styling.

## Data and Types

### Domain Types

- `Track` - internal representation of a sound track.
  - `id: string`
  - `title: string`
  - `imageUrl: string`
  - `embedUrl: string`

- `SearchResponse` - normalized search response from the data layer.
  - `tracks: Track[]`
  - `nextCursor?: string`
  - `prevCursor?: string`

- `SearchState` - overall state used by the UI.
  - `query: string`
  - `results: Track[]`
  - `selectedTrack?: Track`
  - `viewMode: 'list' | 'tile'`
  - `loading: boolean`
  - `error?: string`
  - `nextCursor?: string`
  - `prevCursor?: string`
  - `recentSearches: string[]`

## Data/API Layer

`SoundApiClient` is responsible for interacting with Mixcloud and is the only place that knows about its URLs and response shape.

Responsibilities:

- Implement `searchTracks(query: string, cursor?: string, signal?: AbortSignal): Promise<SearchResponse>`.
- Use `fetch` to call Mixcloud's search endpoint and map the JSON response to `SearchResponse`.
- Manage paging cursors based on Mixcloud's API (e.g., next/previous URLs or cursor tokens).
- Accept an `AbortSignal` to support cancellation from higher layers.

The rest of the application depends only on the abstract `SearchResponse` and `Track` types, so swapping Mixcloud for another provider would only require changes in this file.

## State and Business Logic Layer

### SearchHistoryManager

A pure TypeScript module that manages the recent searches list.

Responsibilities:

- Maintain a list of up to 5 unique search terms.
- When a term is searched, move it to the top of the list.
- Prevent duplicate entries.
- Persist the list to storage via `storage.ts`.
- Provide functions like:
  - `loadHistory(): string[]`
  - `saveHistory(history: string[]): void`
  - `updateHistory(history: string[], newTerm: string): string[]`

### PaginationManager

A pure TypeScript module that helps manage cursor-based pagination.

Responsibilities:

- Interpret `nextCursor` and `prevCursor` values from `SearchResponse`.
- Provide helpers like:
  - `canGoNext(nextCursor?: string): boolean`
  - `canGoPrevious(prevCursor?: string): boolean`

This keeps pagination logic separate from the API and view components.

### SearchStateContext and Hook

This layer orchestrates data fetching and state updates.

Responsibilities:

- Hold `SearchState` in React context.
- Provide actions:
  - `setQuery(query: string)`
  - `performSearch(query: string)`
  - `goToNextPage()`
  - `goToPreviousPage()`
  - `selectTrack(track: Track)`
  - `setViewMode(mode: 'list' | 'tile')`

Implementation details:

- Use a reducer or `useState` to manage `SearchState`.
- Use `SoundApiClient.searchTracks` for data fetching.
- Use `SearchHistoryManager` for history updates.
- Use `PaginationManager` for pagination decisions.
- Manage an `AbortController` for in-flight requests, cancelling previous searches when a new one starts.

## UI Components Layer

### App

- Top-level component that renders the main layout.
- Wraps children with `SearchStateContext.Provider`.

### SearchContainer

- Contains the search text box and a Go button.
- Shows the search results container below the input.
- Debounces input changes (~300ms) and triggers searches via the state hook.

### ResultsList and ResultsGrid

- `ResultsList` displays results as a vertical list showing track names.
- `ResultsGrid` displays results in a tiled card layout using track images.
- Both receive `tracks` and an `onSelectTrack(track)` callback via props.

### PaginationControls

- Renders Next and Previous buttons.
- Renders List and Tile toggle buttons.
- Buttons use state hook actions to trigger pagination and view mode changes.
- Disables Next/Previous when there are no further results.

### ImageContainer

- Displays the currently selected track's image in the center.
- When a search result is clicked, triggers a simple animation where the result "flies" to the image container and fades out, then the central image fades in.
- When the central image is clicked, renders an embedded player below it and starts playback.

### RecentSearchesContainer

- Displays the last 5 search terms from history.
- Clicking a term triggers a new search for that term.

## Utilities and Storage

### debounce.ts

- Provides a generic debounce function for wrapping callbacks.
- Used by `SearchContainer` to debounce search input.

### storage.ts

- Thin wrapper around `localStorage` with typed helpers.
- Provides functions like `getItem`, `setItem`, `removeItem` for string arrays.

## Async Handling and UX States

- Debounce search input by ~300ms to avoid firing requests on every keystroke.
- Use `AbortController` to cancel in-flight requests:
  - If the user starts a new search before the previous one resolves, the stale response must not overwrite the current results.
  - Rapidly clicking Next/Previous while a request is pending must not corrupt the displayed page.
- Handle all states gracefully:
  - Show a loading indicator while fetching.
  - Show an empty state when there are no matches.
  - Show an error message with a retry option on network or API failure.

## Accessibility and View Mode Persistence

- Make the core flow keyboard-navigable:
  - Input, buttons, results, recent searches, and image container reachable via keyboard.
- Use semantic HTML elements and ARIA where needed (e.g., roles for results list and focus management when a result flies to the image container).
- Persist the selected view mode (list or tile) using `storage.ts` so it is restored on the user's next visit.

## Testing

- Add unit tests for:
  - `SearchHistoryManager`: deduplication, move-to-top, max 5 entries.
  - `PaginationManager`: `canGoNext` and `canGoPrevious` behavior.
- Optionally test `SoundApiClient` with mocked `fetch`.

## README Guidance

The README should:

- Explain how to install dependencies, run the development server, and execute tests.
- Summarize the architecture: data layer (SoundApiClient), state/business logic (context and managers), and UI components.
- Describe key trade-offs and decisions (stack choice, cursor-based pagination, separation of logic and view).
- Highlight how the requirements are met: React + TypeScript, smart architecture, correct async handling, accessible UI, unit tests, and incremental git history.
