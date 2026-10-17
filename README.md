# Skillz Directory

A React and TypeScript directory prototype for browsing local service providers
in Zomba, Malawi.

## Run locally

```sh
npm install
npm run dev
```

## Checks

```sh
npm run build
npm run lint
```

## Demo scope

- Listings, locations, ratings, and reviews are sample data in `src/data/provider.ts`.
- Provider profile edits and uploaded images are stored in this browser using
  IndexedDB. They are not shared with other devices or users.
- The provider workspace is a demo editor, not an authenticated provider account.
- The chat button opens a local preview; it does not send a message.
- Map tiles are provided by OpenStreetMap and require an internet connection.
