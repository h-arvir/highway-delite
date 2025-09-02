# Delite Notes App — User Setup Guide

This guide walks you through setting up Supabase (Email OTP + Google OAuth), creating the database, configuring environment variables, and running the app locally.

## Prerequisites
- Node.js 18+ and npm installed
- A Supabase account (https://supabase.com)
- A Google Cloud account (for Google OAuth)

---

## 1) Create a Supabase Project
1. Go to the Supabase Dashboard and create a new project.
2. Once created, open Project Settings → API. Copy the following values:
   - **VITE_SUPABASE_URL** (Project URL)
   - **VITE_SUPABASE_ANON_KEY** (anon public key)
3. Keep these handy—we’ll place them in the app’s `.env` file.

Tip: We’ve pre-filled `.env.example` with placeholders. You’ll copy them into `.env` in step 6.

---

## 2) Configure Auth URLs (Supabase)
1. Go to Authentication → URL Configuration.
2. Set **Site URL** to:
   - `http://localhost:5173`
3. Add **Additional Redirect URLs**:
   - `http://localhost:5173`
   - `http://localhost:5173/auth`
4. Save.

These ensure browser redirects work during local development.

---

## 3) Enable Email OTP (6-digit code)
We use numeric OTP (not magic links).

1. Go to Authentication → Templates → Email.
2. Edit the sign-in template (or OTP template) so the email includes the OTP token:
   - Ensure the body contains `{{ .Token }}` where you want the 6-digit code to appear.
   - Example snippet you can place in the email body:
     ```
     Your verification code is: {{ .Token }}
     This code will expire shortly. If you didn't request this, you can ignore this email.
     ```
3. Save the template.

Notes:
- The app calls `signInWithOtp({ email })` to send a code, and `verifyOtp({ email, token, type: 'email' })` to verify it.

---

## 4) Enable Google OAuth
1. In Supabase Dashboard, go to Authentication → Providers → Google.
2. Copy the **Redirect URL** shown by Supabase (it looks like `https://<your-project-ref>.supabase.co/auth/v1/callback`). You will need this in Google Cloud.
3. Open Google Cloud Console → APIs & Services:
   - Create/select a project.
   - OAuth consent screen: set it up (External is fine for testing), add email/profile scopes, and add your tester email if app is in testing mode.
   - Credentials → Create Credentials → OAuth client ID → Web application.
   - Add the **Authorized redirect URI**: the exact URL you copied from the Supabase Provider page.
4. After creating, copy the **Client ID** and **Client Secret**.
5. Back in Supabase, paste the Client ID and Secret into the Google provider form and **Enable** Google provider. Save.

---

## 5) Create Database Table + Policies (Notes)
Run the provided SQL to create the `notes` table and secure it with Row Level Security (RLS).

1. In Supabase Dashboard → SQL Editor, create a new query.
2. Paste the contents of `supabase.sql` from this repository and run it.
   - File path: `supabase.sql`
3. Verify table `public.notes` exists and that policies are enabled.

What it sets up:
- Table `notes`: `id`, `user_id`, `title`, `content`, `created_at`.
- RLS policies so only the note owner can read, insert, update, and delete their own notes.

---

## 6) Add Environment Variables
1. Copy `.env.example` to `.env`:
   - If you’ve already filled values in `.env.example`, copy them as-is.
2. Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Save the file.

Important: Restart the dev server after changing `.env`.

---

## 7) Install Dependencies and Run the App
1. Install dependencies:
   ```powershell
   npm install
   ```
2. Start the dev server:
   ```powershell
   npm run dev
   ```
3. Open the shown local URL (usually `http://localhost:5173`).

---

## 8) Use the App
- **Email OTP Login**
  1. Enter your email on the Auth page and click “Continue with Email”.
  2. Check your inbox for the 6-digit code.
  3. Enter the code and click “Verify & Sign in”.
- **Google Login**
  1. Click “Continue with Google”.
  2. Complete Google sign-in; you’ll be redirected back.
- **Notes**
  - After sign-in, you’ll see the Home page.
  - Create a note by adding a Title and Content, then click “Add note”.
  - Delete a note using the “Delete” button on each card.

Validation and errors:
- Inputs are validated (email format, OTP format, required fields, content limits).
- API and RLS errors show as inline messages.

---

## 9) How Authorization Works (JWT + RLS)
- Supabase issues a JWT after successful login (email OTP or Google).
- Every request to `public.notes` automatically includes this JWT.
- RLS policies ensure users can only access their own notes.

---

## 10) Troubleshooting
- **OTP email not received**:
  - Check spam folder.
  - Verify the email template includes `{{ .Token }}`.
  - Try using a different email provider.
- **OTP verification fails**:
  - Ensure you entered the same email address you used to request the code.
  - Codes expire quickly—request a new one.
- **403/401 when fetching or writing notes**:
  - Confirm you’re signed in.
  - Ensure RLS policies were created and are enabled (see `supabase.sql`).
  - Make sure `Site URL` and `Additional Redirect URLs` are correct (step 2).
- **Google login fails**:
  - Confirm the Google OAuth **Authorized redirect URI** exactly matches the one shown in Supabase provider settings.
  - Ensure Client ID/Secret are correctly entered in Supabase.
  - If in testing mode, add your account as a test user in Google.
- **Env not picked up**:
  - Confirm `.env` is in the project root.
  - Restart `npm run dev` after changes.

---

## 11) What’s Already Implemented in Code
- Supabase client at `src/lib/supabaseClient.ts` (reads env vars).
- Auth state via `src/contexts/AuthContext.tsx`.
- Email OTP + Google login page at `src/pages/Auth.tsx`.
- Notes CRUD page at `src/pages/Home.tsx` (create/delete, list by latest).
- Routing + guards in `src/App.tsx`; provider wiring in `src/main.tsx`.
- SQL schema & RLS in `supabase.sql`.

---

## 12) Optional Improvements
- Edit note functionality and optimistic UI updates.
- Align UI with your Figma design (spacing, colors, typography).
- Add resend OTP timer and rate limiting on the client.

---

## 13) Next Steps for You
1. Complete Supabase setup (steps 1–5).
2. Create `.env` with your Supabase URL and anon key (step 6).
3. Run the app (step 7) and test both login methods.
4. Use the notes page to create and delete notes.

If you want, I can also generate a `.zencoder/rules/repo.md` to improve future assistance quality. Let me know and I’ll add it automatically.