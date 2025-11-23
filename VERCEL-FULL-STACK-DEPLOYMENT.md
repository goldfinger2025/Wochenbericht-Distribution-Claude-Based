# 🚀 Vercel Deployment Guide - Frontend + Backend

Diese Anleitung zeigt dir, wie du die EWS Weekly Reports App mit Frontend UND Backend auf Vercel deployen kannst.

## 📋 Voraussetzungen

1. **Vercel Account**: Registriere dich kostenlos auf [vercel.com](https://vercel.com)
2. **Neon Database**: Erstelle eine kostenlose Postgres-Datenbank auf [neon.tech](https://neon.tech)
3. **GitHub/GitLab/Bitbucket Account**: (optional, aber empfohlen)
4. **Vercel CLI**: (optional) `npm i -g vercel`

## 🏗️ Projekt-Struktur

```
├── api/
│   ├── index.js           # ✅ Backend API (Serverless Function)
│   └── db/
│       ├── connection.js  # Database Connection
│       ├── schema.js      # Database Schema
│       └── migrate.js     # Migration Script
├── public/
│   └── index.html        # ✅ Frontend (Static)
├── vercel.json           # ✅ Vercel Configuration
├── package.json          # Dependencies
└── .vercelignore         # Files to ignore
```

## 🗄️ Schritt 1: Neon Database Setup

1. Gehe zu [neon.tech](https://neon.tech) und erstelle ein Projekt
2. Erstelle eine neue Datenbank
3. Kopiere die Connection String (sieht so aus):
   ```
   postgresql://user:password@ep-cool-name-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

## 🔧 Schritt 2: Lokale Vorbereitung

### Umgebungsvariablen testen

Erstelle eine `.env` Datei (wird NICHT committed):

```env
DATABASE_URL=postgresql://user:password@ep-xyz.eu-central-1.aws.neon.tech/neondb?sslmode=require
NODE_ENV=production
ALLOWED_ORIGINS=*
```

### Dependencies installieren

```bash
npm install
```

### Datenbank migrieren (optional - macht API automatisch)

```bash
npm run db:migrate
```

## 🚀 Schritt 3: Deployment via Vercel Dashboard

### Option A: GitHub Integration (Empfohlen)

1. **Repository pushen**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Vercel Dashboard öffnen**:
   - Gehe zu [vercel.com/dashboard](https://vercel.com/dashboard)
   - Klicke auf **"Add New Project"**
   - Wähle **"Import Git Repository"**

3. **Repository auswählen**:
   - Autorisiere GitHub/GitLab/Bitbucket
   - Wähle dein Repository aus
   - Klicke auf **"Import"**

4. **Projekt konfigurieren**:
   - **Framework Preset**: "Other" (oder leer lassen)
   - **Root Directory**: `.` (Standard)
   - **Build Command**: Leer lassen (wir nutzen Serverless Functions)
   - **Output Directory**: `public`

5. **Environment Variables hinzufügen**:
   - Klicke auf **"Environment Variables"**
   - Füge hinzu:
     ```
     DATABASE_URL = postgresql://your-connection-string
     NODE_ENV = production
     ALLOWED_ORIGINS = *
     ```

6. **Deploy klicken**! 🎉

### Option B: Vercel CLI

```bash
# Login
vercel login

# Deploy (follow prompts)
vercel

# Production Deploy
vercel --prod
```

Während des Setups:
- Set up and deploy? **Y**
- Which scope? (Wähle deinen Account)
- Link to existing project? **N**
- What's your project's name? **ews-weekly-reports**
- In which directory is your code located? **.**
- Want to modify settings? **Y**
  - Build Command: (leer lassen)
  - Output Directory: `public`
  - Development Command: (leer lassen)

Dann Environment Variables setzen:
```bash
vercel env add DATABASE_URL production
# Paste your connection string

vercel env add NODE_ENV production
# Enter: production

vercel env add ALLOWED_ORIGINS production
# Enter: *
```

Nochmal deployen:
```bash
vercel --prod
```

## ✅ Schritt 4: Verifizierung

Nach dem Deployment erhältst du eine URL wie: `https://ews-weekly-reports.vercel.app`

### Frontend testen
- Öffne: `https://your-app.vercel.app`
- Du solltest die Weekly Reports App sehen

### Backend API testen
- Öffne: `https://your-app.vercel.app/api/health`
- Du solltest sehen:
  ```json
  {
    "status": "ok",
    "timestamp": "2025-11-22T...",
    "database": "connected"
  }
  ```

### API Endpoints testen

```bash
# Health Check
curl https://your-app.vercel.app/api/health

# Create Report
curl -X POST https://your-app.vercel.app/api/reports \
  -H "Content-Type: application/json" \
  -d '{"week": 47, "year": 2025, "tasks": []}'

# Get Reports
curl https://your-app.vercel.app/api/reports?year=2025&week=47
```

## 🔄 Automatische Deployments

Bei GitHub Integration:
- **Push zu `main`** → Automatisches Production Deployment
- **Push zu anderen Branches** → Preview Deployment
- **Pull Requests** → Preview Deployment mit eigener URL

## 🛠️ Troubleshooting

### Problem: "Module not found"
**Lösung**: Stelle sicher, dass alle Dependencies in `package.json` sind:
```bash
npm install --save express cors helmet compression body-parser @neondatabase/serverless drizzle-orm
```

### Problem: "Database connection failed"
**Lösung**: 
1. Überprüfe DATABASE_URL in Vercel Dashboard
2. Stelle sicher, dass Neon Database läuft
3. Checke ob Connection String korrekt ist (mit `?sslmode=require`)

### Problem: "404 Not Found" bei `/api/...`
**Lösung**: Überprüfe `vercel.json`:
```json
{
  "builds": [
    { "src": "api/index.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" }
  ]
}
```

### Problem: Frontend lädt nicht
**Lösung**: Überprüfe dass `public/index.html` existiert und:
```json
{
  "builds": [
    { "src": "public/**", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/public/$1" }
  ]
}
```

### Logs ansehen
```bash
# Via CLI
vercel logs

# Oder im Dashboard
# https://vercel.com/your-username/your-project/logs
```

## 📊 Monitoring

### Vercel Analytics
- Aktiviere in: Project Settings → Analytics
- Sieh Performance, Requests, Errors

### Database Monitoring
- Neon Dashboard: [console.neon.tech](https://console.neon.tech)
- Überprüfe Connection Count, Query Performance

## 🔐 Sicherheit

### Environment Variables
- Setze in Vercel Dashboard unter "Settings → Environment Variables"
- **NIEMALS** in Code committen
- Nutze Production/Preview/Development Environments

### CORS Configuration
Für Production, beschränke ALLOWED_ORIGINS:
```bash
vercel env add ALLOWED_ORIGINS production
# Enter: https://your-domain.com,https://another-domain.com
```

## 💰 Kosten

- **Vercel**: 
  - Hobby Plan: Kostenlos
  - Pro Plan: $20/Monat (für Teams)
  
- **Neon Database**:
  - Free Tier: 512 MB Storage, 1 Projekt
  - Pro: Ab $19/Monat

## 🎯 Nächste Schritte

1. **Custom Domain**: Settings → Domains → Add
2. **SSL/HTTPS**: Automatisch von Vercel
3. **Environment Variables**: Für verschiedene Stages
4. **Monitoring**: Analytics aktivieren
5. **Backups**: Neon Auto-Backups nutzen

## 📚 Weitere Ressourcen

- [Vercel Docs](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Neon Docs](https://neon.tech/docs)
- [Drizzle ORM](https://orm.drizzle.team)

## 🆘 Support

- Vercel: [vercel.com/support](https://vercel.com/support)
- Neon: [neon.tech/docs/introduction/support](https://neon.tech/docs/introduction/support)
- GitHub Issues: [dein-repo/issues](https://github.com/your-username/your-repo/issues)

---

**Viel Erfolg mit deinem Deployment! 🚀**
