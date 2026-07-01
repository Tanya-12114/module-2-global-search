# Module 2 — Global Search

Standalone build of the Global Search module (search bar, autocomplete,
recent/popular searches, search results page with entity-type tabs,
category filters, sorting, and pagination) for the AI discovery platform.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 — the homepage here is just a preview shell.
Module 1 owns the real homepage; the piece you'll actually hand off is
`src/components/search/SearchBar.tsx`.

## Structure

```
src/
  app/
    page.tsx                 preview landing page (not the real homepage)
    search/page.tsx           the results page route
    search/SearchPageContent.tsx
  components/
    search/                   all Module 2 UI (bar, dropdown, tabs, filters,
                               sort, pagination, result card/grid, states)
    ui/                       tiny shared primitives (Badge)
  hooks/
    useAutocomplete.ts
    useDebounce.ts
    useRecentSearches.ts      currently localStorage-backed
    useSearchResults.ts       reads/writes all state to the URL query string
  lib/
    api.ts                    <-- swap this for real fetch() calls later
    mockData.ts                deterministic fake dataset, mirrors API shape
    entityMeta.ts               icon/label config per entity type
  types/
    entities.ts                shared types — match these to the real API contract
```

## Wiring into the real backend

Everything the UI needs goes through three functions in `src/lib/api.ts`:

- `getAutocomplete(query)`      → `GET /api/search/autocomplete?q=`
- `getPopularSearches()`        → `GET /api/search/popular`
- `getSearchResults(params)`    → `GET /api/search?q=&types=&categories=&sort=&page=`

Once the real endpoints exist, replace the bodies of those three functions
with `fetch()` calls and delete `mockData.ts`. No component or hook needs to
change, since they only depend on the function signatures and the types in
`types/entities.ts`.

## States covered

- Loading — skeleton grid (`components/search/states/LoadingState.tsx`)
- Empty — no results (`EmptyState.tsx`)
- Error — failed request, with retry (`ErrorState.tsx`)
  - To test it manually: `localStorage.setItem('search:force-error', '1')` in
    the browser console, then search again. Remove the key to restore normal
    behavior.

## Design

Dark theme, inspired by Linear (structure, restraint, indigo accent) and
CRED (bold contrast, confident spacing). Tokens live in `src/app/globals.css`.
