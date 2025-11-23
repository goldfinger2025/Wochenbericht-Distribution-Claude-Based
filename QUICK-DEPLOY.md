# 🚀 Quick Deploy to Vercel

## Schnellstart (5 Minuten)

### 1. Neon Database
```bash
# Gehe zu https://neon.tech
# Erstelle neues Projekt
# Kopiere Connection String
```

### 2. Vercel CLI Installation
```bash
npm i -g vercel
vercel login
```

### 3. Deploy
```bash
# Erster Deploy (Interactive Setup)
vercel

# Environment Variables setzen
vercel env add DATABASE_URL production
# Paste deine Neon Connection String

vercel env add NODE_ENV production  
# Tippe: production

vercel env add ALLOWED_ORIGINS production
# Tippe: *

# Production Deploy
vercel --prod
```

### 4. Fertig! 🎉
Deine App läuft auf: `https://your-project.vercel.app`

## Ohne CLI (Dashboard)

1. Push code zu GitHub
2. Gehe zu [vercel.com/new](https://vercel.com/new)
3. Import Repository
4. Füge Environment Variables hinzu:
   - `DATABASE_URL`: Deine Neon Connection String
   - `NODE_ENV`: `production`
   - `ALLOWED_ORIGINS`: `*`
5. Deploy!

## Testen

```bash
# Frontend
open https://your-project.vercel.app

# Backend API
curl https://your-project.vercel.app/api/health
```

## Weitere Details

Siehe [VERCEL-FULL-STACK-DEPLOYMENT.md](./VERCEL-FULL-STACK-DEPLOYMENT.md) für vollständige Anleitung.
