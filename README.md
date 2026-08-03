# PiXies – SoundScope

This project implements the PiXies front-end exam assignment using React and TypeScript. The application uses the Mixcloud sound API to search tracks, display paginated results, maintain recent searches, and play embedded tracks. The focus is on clean architecture, correct async handling, and a good user experience.

## Tech Stack

- Vite
- React
- TypeScript
- CSS (or CSS Modules)
- Vitest / Jest (for tests)

## Features

- Search for tracks using the Mixcloud sound API.
- Display results 6 at a time with Next/Previous pagination based on the API's paging cursor.
- Maintain a recent search history (last 5 terms), de-duplicated and persisted across visits.
- Clicking a history item triggers a new search.
- Clicking a search result animates it into a central image container and shows the track image.
- Clicking the central image embeds and plays the track.
- Debounced search input (~300ms) with in-flight request cancellation to avoid stale data races.
- Loading, empty, and error states with a retry option.
- List and tile views for results, with view preference remembered across visits.
- Basic accessibility: keyboard navigation, semantic HTML, and ARIA where appropriate.

## Project Structure

See `instructions/architecture.md` for a detailed description of the layers and modules:

- Data/API layer (Mixcloud client)
- State and business logic (search state, history manager, pagination manager)
- UI components (search, results, pagination, image container, recent searches)
- Utilities (debounce, storage)
- Tests (core logic)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Run tests:

```bash
npm test
```

## Requirements Mapping

This project is designed to meet the exam requirements:

- React with TypeScript and properly typed data.
- Smart, decoupled architecture with separate data, state/business logic, and UI layers.
- Logic separated from the view layer and reusable components.
- Correct async handling: debounce, cancellation, and protection against stale responses.
- Graceful loading, empty, and error states.
- Accessible UI with keyboard navigation and appropriate semantics.
- Unit tests for the core logic (search history and pagination).
- Clean, incremental git history that reflects the implementation steps.

## Notes

The sound provider (Mixcloud) is encapsulated in the data layer. Swapping to another sound API should require changes only in that layer, without impacting the UI or state logic.
