# Traffic Alert Nepal

A bilingual public directory and map of publicly listed traffic police offices in **Kanchanpur and Kailali, Nepal**.

This project shows fixed public office locations and official office contact numbers only. It does not show temporary/live checkpoints, officer positions, patrol movements, enforcement deployments, accidents, diversions, flooding, congestion, or user-submitted road reports.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- OpenStreetMap + Leaflet / React Leaflet
- Vercel

## Run locally

1. Install Node.js 20.9+.
2. Clone this repository and run `npm install`.
3. Run `npm run dev` and open `http://localhost:3000`.

The public office directory is maintained in `app/page.tsx`. Map markers are in `components/traffic-map.tsx`.

## Data and verification

- Office names and contact numbers are based on the Nepal Police public contact directory: https://nepalpolice.gov.np/ne/stations/emergency-contacts/police-category/
- Public map positions are based on mapped office records. Confirm the marker on the ground before relying on it for navigation.
- Traffic police helpline: **103**.
- OpenStreetMap map tiles and data are subject to OpenStreetMap attribution and terms.

## Safety and privacy

This website is a public office directory, not a live police-tracking system. Never add live checkpoint locations, patrol movements, officer locations, or enforcement schedules. Do not add crowdsourced reports about where police are checking vehicles.
