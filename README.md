# Card Nimbus

Pokemon card marketplace platform. Buy packs, booster boxes, slabs, and singles. Sell your cards. Community P2P marketplace with escrow. Raffles, mystery collections, live support chat.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL 17 + Prisma 7
- **Cache:** Redis
- **Search:** Meilisearch
- **Payments:** Stripe Connect + PayPal
- **Email:** Resend
- **Jobs:** BullMQ
- **Bot:** Discord.js
- **UI:** Tailwind CSS v4, Framer Motion, Zustand

## Prerequisites

- Node.js 20+
- PostgreSQL 17
- Redis
- Meilisearch

### Install via Homebrew (macOS)

```bash
brew install postgresql@17 redis meilisearch
brew services start postgresql@17
brew services start redis
brew services start meilisearch
```

### Or via Docker

```bash
docker run -d --name cn-postgres -e POSTGRES_DB=card_nimbus -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:17
docker run -d --name cn-redis -p 6379:6379 redis:7
docker run -d --name cn-meili -e MEILI_ENV=development -p 7700:7700 getmeili/meilisearch:latest
```

## Setup

### 1. Clone and install

```bash
git clone https://github.com/jeligambles-dev/cardnimbus.git
cd cardnimbus
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/card_nimbus"
AUTH_SECRET="generate-with: openssl rand -base64 32"
REDIS_URL="redis://localhost:6379"
MEILISEARCH_HOST="http://localhost:7700"

# Payments (get from Stripe/PayPal dashboards)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."

# Email (get from resend.com)
RESEND_API_KEY="re_..."

# Optional - Discord bot
DISCORD_BOT_TOKEN=""
DISCORD_GUILD_ID=""
DISCORD_SUBMISSIONS_CHANNEL_ID=""
DISCORD_APPROVALS_CHANNEL_ID=""
DISCORD_ALERTS_CHANNEL_ID=""
DISCORD_MODERATOR_ROLE_ID=""
DISCORD_TRUSTED_OPS_ROLE_ID=""
```

### 3. Set up database

```bash
# Create database (Homebrew PostgreSQL)
createdb card_nimbus

# Or with Docker
# docker exec cn-postgres psql -U postgres -c "CREATE DATABASE card_nimbus;"

# Run migrations
npx prisma migrate deploy

# Seed sample data
ADMIN_SEED_PASSWORD="YourSecurePassword" npx prisma db seed
```

### 4. Start the app

```bash
npm run dev
```

Open http://localhost:3000

### 5. Start background workers (optional)

```bash
# In a separate terminal
npm run worker
```

### 6. Start Discord bot (optional)

```bash
# In a separate terminal - requires Discord env vars
npm run bot
```

## Admin Access

After seeding, login at `/login` with:

- **Email:** admin@cardnimbus.com
- **Password:** whatever you set in `ADMIN_SEED_PASSWORD`

Admin panel: `/admin`

## Project Structure

```
src/
  app/           # Next.js pages and API routes
  components/    # React components
  services/      # Business logic
  lib/           # Shared utilities (db, auth, stripe, email, etc.)
  stores/        # Zustand client stores
  hooks/         # React hooks
  types/         # TypeScript types
bot/             # Discord bot (separate process)
jobs/            # BullMQ workers and cron jobs
prisma/          # Database schema and migrations
```

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/shop` | Store catalog |
| `/marketplace` | Community P2P listings |
| `/raffles` | Active raffles |
| `/mystery` | Mystery collections |
| `/deals` | Best deal scores |
| `/sell-your-cards` | Sell cards to us |
| `/sell/dashboard` | Seller dashboard |
| `/community` | Leaderboards |
| `/admin` | Admin panel |

## Deployment (Railway)

```bash
railway login
railway init
railway add --plugin postgresql
railway add --plugin redis
# Add Meilisearch as Docker image service from dashboard
railway variables set AUTH_SECRET="..." STRIPE_SECRET_KEY="..." ...
railway up
railway run npx prisma db seed
```

## Services

| Service | Default Port | Purpose |
|---------|-------------|---------|
| Next.js | 3000 | Web app + API |
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Cache, rate limiting, job queues |
| Meilisearch | 7700 | Full-text search |
| BullMQ Worker | - | Background jobs (email, search sync, badges) |
| Discord Bot | - | Admin notifications |
