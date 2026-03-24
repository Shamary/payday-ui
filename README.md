# Payday UI

Modern, user-friendly payment application UI built with Next.js and React.

## Features

- User authentication with Keycloak
- Dashboard with wallet management
- Send money to other users
- Receive money payments
- Wallet topup from card/bank
- Transaction history
- User settings management
- Responsive design with TailwindCSS
- Built with Next.js 14 App Router

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

```bash
npm install
```

## Environment Setup

Create a `.env.local` file:

```bash
cp .env.local.example .env.local
```

### Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3000)
- `NEXT_PUBLIC_KEYCLOAK_URL` - Keycloak server URL (default: http://localhost:14042)
- `NEXT_PUBLIC_KEYCLOAK_REALM` - Keycloak realm name (default: payday)
- `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` - Keycloak client ID (default: payday-ui)

## Running Locally

Development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:4001`

Build and start for production:

```bash
npm run build
npm start
```

## Project Structure

```
app/
├── layout.tsx         # Root layout
├── page.tsx           # Home page
├── auth/              # Authentication pages
├── dashboard/         # Dashboard page
├── send/              # Send money page
├── receive/           # Receive money page
├── settings/          # Settings page
└── wallet/            # Wallet pages

src/
├── components/        # React components
├── hooks/             # Custom hooks
├── lib/               # Utilities and libraries
└── store/             # Zustand stores
```

## Key Technologies

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **react-hot-toast** - Notifications

## Deployment

### Vercel

Deploy directly to Vercel:

```bash
npm run build
vercel deploy
```

Or connect your Git repository to Vercel for automatic deployments.

## API Integration

The frontend communicates with the Payday API. Make sure the backend is running and the `NEXT_PUBLIC_API_URL` is correctly configured.

## Available Routes

- `/` - Home page
- `/auth/login` - Login
- `/auth/register` - Register
- `/dashboard` - Dashboard
- `/send` - Send money
- `/receive` - Receive money
- `/settings` - User settings
- `/wallet/topup` - Add funds

## Development

Lint:

```bash
npm run lint
```

Format:

```bash
npm run format
```

## License

MIT
