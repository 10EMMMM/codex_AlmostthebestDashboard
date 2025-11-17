# Firebase Studio

This is a Next.js project.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Bootstrap a Normal User

To quickly seed a non-super-admin user (for diagnostics or local testing), set these environment variables in `.env.local` and restart the dev server:

```
NORMAL_USER_EMAIL=account.manager@example.com
NORMAL_USER_PASSWORD=TempPassword123!
NORMAL_USER_DISPLAY_NAME=Account Manager Sample
NORMAL_USER_ROLES=ACCOUNT_MANAGER,BDR
NORMAL_USER_CITY_ID=22222222-2222-2222-2222-222222222222  # optional, defaults to first city
NORMAL_USER_TIMEZONE=America/New_York                      # optional
```

Then run a POST request against the bootstrap endpoint:

```bash
curl -X POST http://localhost:3010/api/admin/bootstrap-user
```

This creates (or updates) the auth user, upserts `public.profiles`, assigns the listed roles in `public.user_roles`, and, if `ACCOUNT_MANAGER` is present, ensures `public.account_manager_cities` has a row for the supplied city.
