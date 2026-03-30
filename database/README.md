# Database Setup Guide

## Quick Setup (5 minutes)

### 1. Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" → Sign up with GitHub
3. Create new project:
   - **Name**: `time-tracker-pwa`
   - **Database Password**: (generate strong password)
   - **Region**: Choose closest to your location
   - Wait ~2 minutes for setup

### 2. Get Connection Details
1. In Supabase dashboard → **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJ0eXAiOiJKV1Q...` (long string)

### 3. Setup Database Tables
1. In Supabase dashboard → **SQL Editor**
2. Copy-paste the entire content of `setup.sql`
3. Click **Run** → Should see "Success. No rows returned"

### 4. Configure App
1. Open `src/utils/database.js`
2. Replace these lines:
   ```javascript
   const SUPABASE_URL = 'https://your-project-ref.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```
   With your actual values:
   ```javascript
   const SUPABASE_URL = 'https://xxxxx.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJ0eXAiOiJKV1Q...';
   ```

### 5. Test & Deploy
1. Test locally: `npm run dev`
2. Deploy: `git add . && git commit -m "Add Supabase database" && git push`
3. Vercel auto-deploys in ~30 seconds

## Features

✅ **Real-time sync** across multiple tablets  
✅ **Offline support** - works without internet, syncs when back online  
✅ **Remote management** - add/remove employees from anywhere  
✅ **Audit trail** - full history of all actions  
✅ **Free tier** - 500MB database, 2 projects  
✅ **No vendor lock-in** - standard PostgreSQL  

## How It Works

### Hybrid Storage Strategy
- **Online**: Uses Supabase (real-time, multi-device sync)
- **Offline**: Falls back to localStorage automatically
- **Sync**: Pending changes upload when connection restored

### Data Flow
1. **Tablet A**: Employee taps name → writes to Supabase
2. **Tablet B**: Instantly sees status change (if online)
3. **Admin Panel**: Real-time view of all employees across tablets
4. **Offline Mode**: Changes queue locally, sync when online

## Security (Production)

For production deployment, update the RLS policies in Supabase:

```sql
-- Remove the permissive policies
DROP POLICY "Allow all operations on employees" ON employees;
DROP POLICY "Allow all operations on sessions" ON sessions;
DROP POLICY "Allow all operations on events" ON events;

-- Add secure policies (example)
CREATE POLICY "Authenticated users can manage employees" 
ON employees FOR ALL 
USING (auth.role() = 'authenticated');
```

Then add proper authentication to your app.

## Cost

- **Free tier**: Perfect for small teams (up to ~50 employees)
- **Paid tier**: Only $25/month if you exceed limits
- **Self-host**: Can export to your own PostgreSQL server anytime

## Troubleshooting

**Q: App still uses localStorage?**  
A: Check browser console for errors. Verify SUPABASE_URL and key are correct.

**Q: Sync not working?**  
A: Check network tab in browser dev tools. Ensure RLS policies allow operations.

**Q: Want to migrate existing data?**  
A: We can write a migration script to upload localStorage data to Supabase.