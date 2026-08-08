# Supabase Database Setup for iter8d Studio Blog

## Why Supabase
The blog currently uses seed articles hardcoded in JS.
Admin-created posts use localStorage (browser only).
This guide upgrades the admin to save posts to Supabase (PostgreSQL) so posts:
- Persist across all devices and browsers
- Are visible to all visitors immediately on publish
- Can be managed from any device

## Step 1 — Create a Supabase Project
1. Go to https://supabase.com and sign up (free)
2. Click "New Project"
3. Name it: iter8d-studio-blog
4. Choose a region close to Nigeria (eu-west or us-east)
5. Set a strong database password and save it

## Step 2 — Create the Posts Table
In your Supabase project, go to SQL Editor and run:

```sql
create table posts (
  id text primary key,
  title text not null,
  category text default 'Design',
  status text default 'draft',
  excerpt text,
  meta text,
  content text,
  read_time text,
  date timestamptz default now(),
  updated timestamptz default now()
);

-- Allow public read of published posts
create policy "Public can read published posts"
  on posts for select
  using (status = 'published');

-- Allow all operations (we'll lock this down later)
create policy "Allow all for now"
  on posts for all
  using (true);

alter table posts enable row level security;
```

## Step 3 — Get Your API Keys
In Supabase project settings → API:
- Copy "Project URL" → this is your SUPABASE_URL
- Copy "anon public" key → this is your SUPABASE_ANON_KEY

## Step 4 — Update admin.html
Find this line in admin.html:
```
var ADMIN_PASS = 'iter8dStudio2026';
```

Add these two lines above it:
```javascript
var SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
var SUPABASE_KEY = 'YOUR_ANON_PUBLIC_KEY';
```

Then replace the getPosts/setPosts functions with Supabase API calls.
(iter8d Studio team: send the API keys and we will integrate in the next session)

## Step 5 — Change Admin Password
Also in admin.html, change:
```
var ADMIN_PASS = 'iter8dStudio2026';
```
To something private before uploading to Hostinger.

## Current State
- 3 SEO seed articles are hardcoded in blog.html and post.html (always visible)
- Admin-created posts save to localStorage (browser only for now)
- Once Supabase is connected, all posts will sync across devices

## Next Session Task
Share your Supabase URL and anon key and we will wire up the full integration.
