<div align="center">

# Vocal-Local Village OS

A smart Panchayat operating system for grievances, transparency, and rural administration.

</div>

## Features

- **Citizen Portal**: Submit and track grievances, apply for government schemes, and access village services.
- **Sarpanch Dashboard**: Manage grievances, monitor development projects, and view live village analytics.
- **Finance Ledger**: Transparent tracking of Gram Panchayat budget allocations and expenditures.
- **Smart Assistance**: Multilingual AI support for citizen queries and crop guidance.

## Run Locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables in `.env.local`:
   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   VITE_GOOGLE_MAPS_API_KEY="your_google_maps_api_key_here"
   ```

3. Run the application:
   ```bash
   npm run dev
   ```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Express, TypeScript, tsx
- **Database / Cloud Services**: Firebase Firestore
