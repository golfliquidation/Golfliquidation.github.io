# Golf Liquidation

Texas-owned golf equipment liquidation (est. 2020). Mobile-first storefront with a host admin panel, listings, photo uploads, and inventory CRM.

**Live site:** [https://golfliquidation.github.io/](https://golfliquidation.github.io/)

## Local development

```bash
npm install
cp .env.example .env.local   # add Supabase URL + anon key
npm run dev
```

- Public shop: `/`, `/shop`, `/about`, `/contact`
- Host panel: `/admin/login` → dashboard, listings, inventory CRM

## Supabase (required for live inventory & login)

1. Create a [Supabase](https://supabase.com) project.
2. **SQL Editor** → run `supabase/schema.sql`.
3. **Authentication → Providers** → enable Email (password or magic link).
4. Create your user in **Authentication → Users**, then promote to admin:

   ```sql
   update public.profiles set role = 'admin' where id = '<your-user-uuid>';
   ```

5. Optional seed data (shaft inventory): run `supabase/seeds/2026-09-30-shaft-inventory.sql`.

## Production deploy

Pushes to `main` run **Deploy GitHub Pages** (`.github/workflows/deploy.yml`).

In the repo **Settings → Secrets and variables → Actions**, add either:

**Option A — Supabase (cloud sync, recommended)**

| Secret | Value |
|--------|--------|
| `VITE_SUPABASE_URL` | Project URL (Settings → API) |
| `VITE_SUPABASE_ANON_KEY` | `anon` public key |

**Option B — Host login only (inventory stored in each browser)**

| Secret | Value |
|--------|--------|
| `VITE_HOST_EMAIL` | Host sign-in email (e.g. `golfliquidation@gmail.com`) |
| `VITE_HOST_PASSWORD` | Strong password (baked into the build; change via secrets + redeploy) |

**Settings → Pages → Build and deployment** should use **GitHub Actions** as the source.

## Inventory CRM

Track items from acquisition through sold: source (shop closeout, fitting studio, wholesaler, etc.), cost, list price, quantity, notes, and publish to the public shop when status is **Listed**.

Photos upload to the `listing-photos` storage bucket (created by the schema).
