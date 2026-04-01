# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Git

---

## Option 1: Vercel (Recommended — Zero Config)

The fastest way to deploy a Next.js app.

1. Push your code to GitHub (already done).
2. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New → Project**.
4. Import the `expense-tracker-ai` repository.
5. Leave all settings as default — Vercel auto-detects Next.js.
6. Click **Deploy**.

Your app will be live at `https://expense-tracker-ai.vercel.app` (or similar) within ~1 minute.

To redeploy after changes:
```bash
git add .
git commit -m "your message"
git push
```
Vercel auto-deploys on every push to `main`.

---

## Option 2: Docker

### Requirements
- Docker installed ([https://docs.docker.com/get-docker](https://docs.docker.com/get-docker))

### Build the image

```bash
docker build -t expense-tracker-ai .
```

### Run the container

```bash
docker run -p 3000:3000 expense-tracker-ai
```

Open [http://localhost:3000](http://localhost:3000).

### Run in background (detached)

```bash
docker run -d -p 3000:3000 --name expense-tracker expense-tracker-ai
```

### Stop the container

```bash
docker stop expense-tracker
```

### Push to Docker Hub (optional)

```bash
docker tag expense-tracker-ai your-dockerhub-username/expense-tracker-ai
docker push your-dockerhub-username/expense-tracker-ai
```

---

## Option 3: Manual Node.js Server (VPS / Ubuntu)

### Requirements
- Ubuntu 20.04+ server with Node.js 18+
- SSH access

### Steps

**1. Clone the repo on your server**
```bash
git clone https://github.com/PronoyJoy/expense-tracker-ai.git
cd expense-tracker-ai
```

**2. Install dependencies**
```bash
npm ci
```

**3. Build the app**
```bash
npm run build
```

**4. Start the production server**
```bash
npm start
```

The app runs on port `3000` by default.

**5. Run with a custom port**
```bash
PORT=8080 npm start
```

### Keep it running with PM2

```bash
npm install -g pm2
pm2 start npm --name "expense-tracker" -- start
pm2 save
pm2 startup
```

---

## Option 4: Netlify

1. Go to [https://netlify.com](https://netlify.com) and sign in with GitHub.
2. Click **Add new site → Import an existing project**.
3. Select the `expense-tracker-ai` repo.
4. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Click **Deploy site**.

> Note: Netlify requires the `@netlify/plugin-nextjs` plugin for full Next.js support.
> Add it by creating `netlify.toml`:
> ```toml
> [[plugins]]
> package = "@netlify/plugin-nextjs"
> ```

---

## Build Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local development server (port 3000) |
| `npm run build` | Create optimized production build in `.next/` |
| `npm run start` | Start production server (requires build first) |
| `npm run lint` | Run ESLint checks |

---

## Environment Variables

This app uses browser `localStorage` for data persistence — no backend or database required. No environment variables are needed for a basic deployment.

If you add a backend in the future, create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=https://your-api.com
```
