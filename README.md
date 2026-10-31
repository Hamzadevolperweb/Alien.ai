# Alien.ai Backend

A TypeScript/Express REST backend for Alien.ai using Supabase Auth, PostgreSQL, Storage, OpenAI Images, and Runway video tasks.

## Requirements

- Node.js 20 or later
- Supabase project
- OpenAI API key for image generation
- Runway API key for video generation

## Setup

```sh
npm install
cp .env.example .env
# Configure Supabase and provider credentials in .env
npx supabase db push
npm run dev
```

Apply [the initial migration](supabase/migrations/202610300001_initial.sql) in the Supabase SQL editor if the Supabase CLI is unavailable. This migration enables private media storage and creates the database schema and row-level security policies.

The default API port is `4000`. Frontend developers should set:

```text
VITE_API_URL=http://localhost:4000
# or NEXT_PUBLIC_API_URL=http://localhost:4000
```

Send Supabase access tokens as `Authorization: Bearer <access_token>`.

## Commands

```sh
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm start
```
