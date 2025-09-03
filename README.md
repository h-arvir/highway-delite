# Delite — Notes App (React + TypeScript + Vite)

A simple notes app with Supabase authentication (Email OTP). This README explains how to set up, run, and build the project.

## Prerequisites
- Node.js 18+ and npm
- A Supabase project (get URL and anon key from Dashboard)

## 1) Clone & install
```powershell
# From a terminal
npm install
```

## 2) Environment variables
Create a `.env` file at the project root with the following values from your Supabase project (Settings → API):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Restart the dev server after editing `.env`.

## 3) Supabase email OTP (no magic link)
- In Supabase Dashboard → Authentication → Templates → Email, include `{{ .Token }}` in the OTP email body so users receive a 6‑digit code.
- Remove/avoid `{{ .ConfirmationURL }}` if you don’t want magic links.

The app uses:
- `signInWithOtp({ email })` to send a code
- `verifyOtp({ email, token, type: 'email' })` to verify

## 4) Database (Notes)
Run the SQL in `supabase.sql` on your Supabase project (Dashboard → SQL Editor):
- Creates `public.notes` table
- Enables Row Level Security (RLS) so users only access their own notes

## 5) Run locally (development)
```powershell
npm run dev
```
Open the URL printed in the terminal (usually http://localhost:5173).

## 6) Build for production
```powershell
npm run build
```
Outputs static assets to `dist/`.

## 7) Preview production build
```powershell
npm run preview
```
Serves the built app locally for final checks.

## 8) Project structure (key files)
- `src/lib/supabaseClient.ts` — Supabase client, reads env vars
- `src/contexts/AuthContext.tsx` — Auth state provider
- `src/pages/Auth.tsx` — Sign Up with OTP flow
- `src/pages/SignIn.tsx` — Sign In with OTP flow
- `src/pages/Home.tsx` — Notes CRUD (create/delete, list by latest)
- `supabase.sql` — Database schema + RLS

## 9) Troubleshooting
- No OTP email:
  - Check spam, ensure `{{ .Token }}` is in the email template
  - Try another email provider
- OTP verification fails:
  - Use the same email used to request the OTP
  - Codes expire quickly; resend a code
- 401/403 on notes:
  - Confirm you are signed in and RLS policies are created and enabled

## 10) Scripts
- `npm run dev` — Start dev server
- `npm run build` — Type-check + build
- `npm run preview` — Preview built app
- `npm run lint` — Lint code

---
If you want, I can add a `.env.example` file and a GitHub Actions workflow for builds/deploy previews.