# Payday UI

Next.js UI for Payday.

## Features

- Local username or email login
- Google sign-in button and callback handling
- Role-aware navigation with admin-only `/admin`
- Dashboard, send, receive, settings, and wallet topup pages

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:4001
```

## Local Run

```bash
npm install
npm run dev
```

## Routes

- `/auth/login`
- `/auth/register`
- `/auth/google/callback`
- `/dashboard`
- `/send`
- `/receive`
- `/settings`
- `/wallet/topup`
- `/admin`

## Build

```bash
npm run build
```
