# Railway / Supabase production env checklist (do not commit secrets)

## Railway (tivonixpanel + api if split)
APP_URL=https://tivonixpanel-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://tivonixpanel-production.up.railway.app
NEXT_PUBLIC_DEMO_MODE=false

# Keep existing:
# SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL
# SUPABASE_PUBLISHABLE_KEY / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
# SUPABASE_SECRET_KEY (API / server only)
# DATABASE_URL (scripts only, not needed in frontend runtime)

## Supabase Auth → URL Configuration
Site URL:
https://tivonixpanel-production.up.railway.app

Redirect URLs (allow list):
https://tivonixpanel-production.up.railway.app/auth/callback
https://tivonixpanel-production.up.railway.app/auth/reset-password
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password

## Email
Confirm email: OFF until SMTP verified
