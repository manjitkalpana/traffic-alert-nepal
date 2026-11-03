# Traffic Alert Nepal

Community-powered road-safety updates for Nepal, starting with **Kanchanpur and Kailali**.

The app focuses on congestion, crashes, road closures, diversions, flooding and other road hazards. It intentionally does **not** publish live locations of individual police officers, checkpoints or enforcement activity.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4
- Supabase (Postgres + Row Level Security)
- OpenStreetMap + Leaflet / React Leaflet
- Vercel

## Run locally

1. Install Node.js 20.9+.
2. Clone this repository and run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. For a live database, create a Supabase project and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. In Supabase SQL Editor, run `supabase/schema.sql`.
6. Run `npm run dev` and open `http://localhost:3000`.

Without Supabase environment variables, the homepage runs in **demo mode**. Demo map markers are examples, not live reports; the report form explains that it cannot submit until Supabase is configured.

## Reports and moderation

- New submissions are inserted with `pending` status.
- Public reads are restricted by Row Level Security to approved, unexpired reports.
- There are intentionally no public update/delete policies.
- For this initial MVP, review pending submissions in the Supabase dashboard and change their status to `approved` or `rejected` using an authorized project administrator account.
- Reports expire after 12 hours by default.

Before a public launch, add CAPTCHA / abuse throttling, moderator authentication and a dedicated server-side moderation workflow. Never expose the Supabase service-role key in browser code.

## Safety

Do not submit personal data, live police-officer locations, checkpoint locations or information intended to help drivers evade enforcement. For emergencies, contact the relevant local emergency services or authorities. This community feed is not an emergency service and should not replace official advisories.

## Current MVP

- Responsive bilingual-ready interface (English / Nepali toggle)
- OpenStreetMap map centred on the initial service area
- Road report categories and district filtering
- Pending submission flow and Supabase RLS schema
- Demo data visibly identified in the interface
