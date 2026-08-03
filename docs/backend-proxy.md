# Optional Future Backend Proxy

PiXies - SoundScope currently runs as a static React application. It calls Mixcloud directly from the browser and stores user preferences, recent searches, theme, and view mode in `localStorage`.

That is the correct architecture for the current home assignment because there are no secrets, user accounts, shared data, or server-owned state. A backend is not required to satisfy the assignment requirements.

## When To Add A Backend

Add a tiny backend/proxy only if future product requirements change, for example:

- Mixcloud changes CORS behavior.
- Search requests need rate limiting, caching, or observability.
- A private API key or signed request becomes required.
- Recent searches or preferences need to sync across devices.
- User accounts are introduced.

## Suggested Shape

If a backend is introduced later, keep the frontend architecture the same and replace only the data boundary:

```text
React UI
  -> SearchStateProvider
    -> SoundApiClient
      -> /api/search on a tiny backend
        -> Mixcloud API
```

The backend would expose a small endpoint such as:

```text
GET /api/search?q=jazz&cursor=...
```

It would validate input, call Mixcloud, normalize the response to the existing `SearchResponse` shape, and return it to the app. The UI and state layers should not need to know whether results came directly from Mixcloud or through the proxy.

## Storage

No database is needed for the current project. If cross-device persistence is later required, store authenticated user preferences and recent searches in a small relational database such as Postgres. Until then, browser `localStorage` is appropriate and keeps the assignment focused on front-end architecture.

## Autoplay Note

The app requests autoplay through the Mixcloud iframe URL. Browser autoplay policies and Mixcloud embed behavior can still block playback, so autoplay should be treated as best-effort rather than guaranteed.
