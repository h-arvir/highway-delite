# Deploying Delite (Vite + React + Supabase) to Vercel

## 1) Prerequisites
- **Vercel account**: https://vercel.com/
- **Git repository**: Code pushed to GitHub/GitLab/Bitbucket (recommended), or use Vercel CLI.
- **Environment variables** (from your local `.env`):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- **Do not commit secrets**: Ensure `.env` is ignored by Git.

Add to `.gitignore` if not present:

```gitignore
# Env files
.env
.env.local
```

## 2) Create SPA routing (required for React Router)
Create `vercel.json` at the project root to ensure all routes serve `index.html`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

Commit this file before deploying.

## 3) Deploy via Git (recommended)
1. Push the repo to GitHub/GitLab/Bitbucket.
2. Go to Vercel → New Project → Import your repo.
3. Settings during first import:
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables in Vercel (Project → Settings → Environment Variables):
   - `VITE_SUPABASE_URL = <your-supabase-url>`
   - `VITE_SUPABASE_ANON_KEY = <your-anon-key>`
   - Set for both **Production** and **Preview**.
5. Click **Deploy**. Vercel will build and host your site.

## 4) Deploy via Vercel CLI (alternative)
1. Install and login:
   ```bash
   npm i -g vercel
   vercel login
   ```
2. From the project root, link and configure:
   ```bash
   vercel
   ```
   - When prompted, select/create a project. Framework/Output will be detected.
3. Add env vars to Vercel:
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```
4. Deploy:
   ```bash
   vercel --prod
   ```

## 5) Test locally before deploying (optional but recommended)
1. Install deps: `npm install` (or `npm ci`)
2. Build: `npm run build`
3. Preview the production build: `npm run preview`
4. Open http://localhost:4173 and test client-side routes (refresh on nested routes).

## 6) Supabase configuration checks
- **Auth Redirect URLs**: In Supabase Dashboard → Authentication → URL Configuration, add:
  - `http://localhost:5173` (dev)
  - `http://localhost:4173` (preview build)
  - `https://your-vercel-domain.vercel.app` and any custom domains
- **CORS**: In Supabase Settings → Auth → URL Configuration (or Project Settings → API depending on UI), ensure allowed origins include your Vercel domains.

## 7) Common issues
- **404 on refresh or direct-linking to routes**: Ensure `vercel.json` (above) is committed so all routes rewrite to `/`.
- **Env vars not applied**: Set variables for the correct environment (Preview/Production) and redeploy. Remember only variables prefixed with `VITE_` are exposed to the client.
- **Leaking secrets**: Do not commit `.env`. Use Vercel Env Vars. Rotate keys in Supabase if leaked.

## 8) After setup
- Pushing to your repo triggers **Preview Deployments** for PRs and **Production** on main (depending on Vercel settings).
- View logs in Vercel (Deployments → Logs) if builds fail.

---

Quick reference
- Build: `npm run build`
- Preview: `npm run preview`
- Deploy (CLI): `vercel --prod`
- Output dir: `dist`
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`