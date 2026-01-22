# Flow MVP - Setup Instructions

## 1. Get Correct Supabase Keys

Your current anon key looks incomplete. Get the correct keys:

1. Go to https://supabase.com/dashboard
2. Select your project (`qbvjzqdcyqzugtqreqau`)
3. Click **Settings** (gear icon) → **API**
4. Copy these values:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY` (should be a long JWT token starting with `eyJ...`)

Update your `.env` file with the correct anon key.

## 2. Create Database Tables

1. Go to https://supabase.com/dashboard/project/qbvjzqdcyqzugtqreqau/sql
2. Click **+ New Query**
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click **Run** to create tables and policies

## 3. Enable Email Auth (if disabled)

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Disable email confirmation for testing:
   - Go to **Authentication** → **URL Configuration**
   - Turn off "Enable email confirmations" (for development only)

## 4. Restart Expo

After updating the `.env` file with the correct anon key:

```bash
npm start -- --clear
```

## 5. Test Signup

Try signing up again. The 500 error should be resolved if:
- ✅ Correct anon key in `.env`
- ✅ Database tables created
- ✅ RLS policies enabled
- ✅ Email auth enabled
