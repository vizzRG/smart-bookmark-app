# 🔖 Smart Bookmarks

A real-time bookmark manager where users sign in with Google, save private bookmarks, and see changes sync instantly across tabs — no page refresh needed.

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)

> **Live Demo:** [https://your-app.vercel.app](https://your-app.vercel.app)

---

## ✨ Features

| Feature                   | Description                                                              |
| ------------------------- | ------------------------------------------------------------------------ |
| 🔐 **Google OAuth**       | Sign in with Google — no email/password needed                           |
| ➕ **Add Bookmarks**      | Save any URL with a custom title                                         |
| 🔒 **Private Data**       | Each user only sees their own bookmarks (enforced by Row Level Security) |
| ⚡ **Real-time Sync**     | Open two tabs — add a bookmark in one, it appears in the other instantly |
| 🗑️ **Delete Bookmarks**   | Remove bookmarks with optimistic UI updates                              |
| 🌐 **Deployed on Vercel** | Live and accessible with a working URL                                   |

---

## 🛠️ Tech Stack

| Layer              | Technology                                                            |
| ------------------ | --------------------------------------------------------------------- |
| **Framework**      | [Next.js 15](https://nextjs.org/) (App Router)                        |
| **Authentication** | [Supabase Auth](https://supabase.com/auth) (Google OAuth via PKCE)    |
| **Database**       | [Supabase](https://supabase.com/) (PostgreSQL)                        |
| **Real-time**      | [Supabase Realtime](https://supabase.com/realtime) (Postgres Changes) |
| **Styling**        | [Tailwind CSS v4](https://tailwindcss.com/)                           |
| **Language**       | TypeScript                                                            |
| **Deployment**     | [Vercel](https://vercel.com/)                                         |

---

## 📁 Project Structure

```
smart-bookmarks/
├── app/
│ ├── layout.tsx
│ ├── page.tsx
│ ├── globals.css
│ ├── auth/
│ │ └── callback/
│ │ └── route.ts
│ └── dashboard/
│ └── page.tsx
├── components/
│ ├── AuthButton.tsx
│ ├── DashboardClient.tsx
│ └── Navbar.tsx
├── lib/
│ └── supabase/
│ ├── client.ts
│ ├── server.ts
│ └── middleware.ts
├── types/
│ └── index.ts
├── proxy.ts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **Supabase** account ([free tier](https://supabase.com))
- **Google Cloud** OAuth credentials ([console](https://console.cloud.google.com/apis/credentials))

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/smart-bookmarks.git
cd smart-bookmarks
npm install
```

### 2. Set up Supabase

#### 1. Create a new project at supabase.com

#### 2. Go to SQL Editor and run the contents of supabase-schema.sql:

```bash Creates the bookmarks table, RLS policies, and enables Realtime
CREATE TABLE IF NOT EXISTS public.bookmarks (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
url TEXT NOT NULL,
title TEXT NOT NULL,
created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;
ALTER TABLE public.bookmarks REPLICA IDENTITY FULL;

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
```

#### 3. Enable Google Auth in Supabase:

- Go to Authentication → Providers → Google
  Toggle it ON
- Paste your Google Client ID and Client Secret

#### 4. Configure URL settings in Supabase:

- Site URL: http://localhost:3000 (change to your Vercel URL after deployment)
- Redirect URLs: Add both:

```bash
http://localhost:3000/auth/callback
https://your-app.vercel.app/auth/callback
```

### 3. Set up Google OAuth

#### 1. Go to Google Cloud Console → Credentials

#### 2. Create an OAuth 2.0 Client ID (Web application)

#### 3. Set Authorized redirect URI to:

```bash
https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
```

#### 4. Set Authorized JavaScript origins to:

```bash
http://localhost:3000
https://your-app.vercel.app
```

### 4. Configure environment variables

#### Create a .env file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run locally

```bash
npm run dev
```

Open http://localhost:3000

### 6. Deploy to Vercel

- Push your code to GitHub
- Import the repo at vercel.com/new
- Add environment variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- Deploy
- After deployment, update the Site URL in Supabase to your Vercel domain.

---

## 🏗️ Architecture

```
┌──────────────┐     Google OAuth      ┌──────────────────┐
│              │ ───────────────────▸  │                  │
│   Browser    │                       │     Supabase     │
│  (Next.js)   │ ◂─── JWT cookie ───  │   Auth + DB +    │
│              │                       │    Realtime      │
│              │ ── CRUD via RLS ──▸  │                  │
│              │ ◂── Realtime WS ───  │                  │
└──────────────┘                       └──────────────────┘
       │
       │ SSR + Middleware
       ▼
┌──────────────┐
│    Vercel    │
│   (Hosting)  │
└──────────────┘
```

### Key design decisions:

- <b>Server-side initial fetch:</b> Dashboard loads bookmarks on the server for fast first paint, then the client takes over with Realtime subscriptions
- <b>Optimistic U: </b> Deletes remove the bookmark instantly; inserts appear as soon as the database confirms
- <b>Row Level Security: </b> All data access is enforced at the database level, not just the UI
- <b>Middleware auth guard: </b> /dashboard is protected via Next.js middleware that validates the Supabase session
- <b>Cookie-based auth: </b> No client-side auth state management, avoiding hydration mismatches

---

## 🐛 Problems I Ran Into & How I Solved Them

### 1. ERR_SSL_PROTOCOL_ERROR after Google login on localhost

<b><span style="color:red">Problem:</span></b> Running npm run build && npm run start sets NODE_ENV=production. The original callback route forced https:// for production, which broke http://localhost:3000.

<b><span style="color:lightgreen">Solution:</span></b> Simplified the callback route to always use the origin from the request URL, which preserves http:// on localhost and https:// on Vercel automatically.

### 2. Hydration mismatch on date formatting

<b><span style="color:red">Problem:</span></b> new Date().toLocaleDateString() produced different output on the server (13/2/2026) vs. the client (2/13/2026) because of locale differences.

<b><span style="color:lightgreen">Solution:</span></b> Replaced toLocaleDateString() with a custom formatDate() function using getUTCFullYear/Month/Date that produces identical output on both server and client. Also added a getRelativeTime() function for better UX.

### 3. Bookmarks not updating without page refresh

<b><span style="color:red">Problem:</span></b> Initially used separate components for the form and list. The form would insert into the database, but the list component wouldn't know about it until a Realtime event arrived (which required proper Supabase Realtime configuration).

<b><span style="color:lightgreen">Solution:</span></b> Combined the form and list into a single DashboardClient component so they share state. The insert handler uses .select().single() to get the created bookmark back immediately and adds it to local state. Realtime is still active for cross-tab sync.

### 4. Supabase Realtime DELETE events returning empty old records

<b><span style="color:red">Problem:</span></b> By default, Supabase Realtime only sends the primary key in payload.old for DELETE events, but sometimes even that was empty.

<b><span style="color:lightgreen">Solution:</span></b> Set REPLICA IDENTITY FULL on the bookmarks table so the full row data is included in DELETE events:

```
ALTER TABLE public.bookmarks REPLICA IDENTITY FULL;
```

### 5. Supabase cookie handling in Next.js App Router

<b><span style="color:red">Problem:</span></b> Server Components, Route Handlers, and Middleware each have different APIs for reading/writing cookies in Next.js 15.

<b><span style="color:lightgreen">Solution:</span></b> Created three separate Supabase client factories following the official @supabase/ssr docs:

- lib/supabase/client.ts — for client components (browser)
- lib/supabase/server.ts — for server components and route handlers
- lib/supabase/middleware.ts — for Next.js middleware (session refresh)

### 6. OAuth redirect URL mismatch on Vercel

<b><span style="color:red">Problem:</span></b> Google OAuth returned an error because the redirect URL didn't match across Google Console, Supabase, and the app.

<b><span style="color:lightgreen">Solution:</span></b> Ensured all three places use the same Supabase callback URL:

```
https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
```

And added both localhost and production app URLs to Supabase's Redirect URL allowlist.

---

## 📄 License

### This project is open source and available under the <a>MIT License</a>.
