# Trip Dashboard (Ho / Lai / Ooi)

Mobile-first temporary trip planner dashboard built with **Next.js App Router + Prisma + Postgres**.

## Features

- Shared passcode gate (`APP_PASSCODE`) with server validation
- Session stored in **httpOnly cookie** signed with `COOKIE_SECRET`
- Fixed families: **HO, LAI, OOI**
- Entry types + filters: **FLIGHT, HOTEL, ACTIVITY, OTHER**
- CRUD (implemented: list, add, delete)
- Entry fields: start/end date, location, notes, optional screenshot upload
- Entries grouped by start date
- Mobile UI with large filter tabs + floating **+** button
- Storage interface abstraction for uploads
  - Local dev stub (writes under `public/uploads`)
  - Optional Vercel Blob adapter for production
  - Optional Supabase Storage adapter for production
- Data layer abstraction via repository interface
  - Default adapter: Prisma/Postgres

---

## Quick Start (Local)

1. Install dependencies

```bash
npm install
```

2. Create env file

```bash
cp .env.example .env
```

3. Configure `.env`

```env
APP_PASSCODE=your-shared-passcode
COOKIE_SECRET=long-random-secret
DATABASE_URL=postgresql://user:pass@localhost:5432/trip_dashboard
DATA_ADAPTER=prisma
STORAGE_ADAPTER=local
```

4. Generate Prisma client + run migration

```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Start app

```bash
npm run dev
```

Open: `http://localhost:3000`

---

## Deploy on Vercel

1. Push this folder to a Git repo and import into Vercel.
2. Create a Postgres database (e.g. Vercel Postgres/Neon/Supabase) and set `DATABASE_URL`.
3. Set env vars in Vercel project:
   - `APP_PASSCODE`
   - `COOKIE_SECRET`
   - `DATABASE_URL`
   - `DATA_ADAPTER=prisma`
   - `STORAGE_ADAPTER=vercel-blob` or `STORAGE_ADAPTER=supabase` (optional)
   - `BLOB_READ_WRITE_TOKEN` (required only for Vercel Blob)
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` (required for Supabase Storage)
4. Run Prisma migration against production DB (CI step or one-time command).

---

## Upload Storage Adapters

### Local (default)
- `STORAGE_ADAPTER=local`
- Saves files to `public/uploads/*`
- Good for local development only

### Vercel Blob (production recommended)
- `STORAGE_ADAPTER=vercel-blob`
- Requires `BLOB_READ_WRITE_TOKEN`
- Returns public blob URL for screenshot field

### Supabase Storage
- `STORAGE_ADAPTER=supabase`
- Requires server-side `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- Optional `SUPABASE_STORAGE_BUCKET` (default: `trip-screenshots`)
- Bucket is auto-created if missing and uploads return public URL for `screenshot`

---

## Notes

- This app is intentionally scoped as an internal temporary dashboard.
- No Google Sheets/Drive integration is used.
- To swap storage or data backend later, implement new adapters in:
  - `lib/storage/*`
  - `lib/data/*`
