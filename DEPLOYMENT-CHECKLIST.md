# ✅ Vercel Deployment Checkliste

Verwende diese Checkliste um sicherzustellen, dass alles für das Deployment bereit ist.

## Vor dem Deployment

### 1. Dependencies ✓
- [x] `package.json` enthält alle benötigten Dependencies
- [x] `express`, `cors`, `helmet`, `compression`, `body-parser`
- [x] `@neondatabase/serverless`, `drizzle-orm`

### 2. Projektstruktur ✓
```
├── api/
│   ├── index.js          ✅ Serverless Function (Backend)
│   └── db/
│       ├── connection.js ✅ Database Connection
│       ├── schema.js     ✅ Database Schema
│       └── migrate.js    ✅ Migration Script
├── public/
│   └── index.html       ✅ Frontend (Static)
├── vercel.json          ✅ Vercel Config
├── .vercelignore        ✅ Ignore File
├── package.json         ✅ Dependencies
└── .env.example         ✅ Environment Template
```

### 3. Konfiguration ✓
- [x] `vercel.json` ist korrekt konfiguriert
- [x] `api/index.js` exportiert Express App mit `module.exports = app`
- [x] `.vercelignore` schließt unnötige Dateien aus

### 4. Datenbank
- [ ] Neon Account erstellt ([neon.tech](https://neon.tech))
- [ ] Datenbank-Projekt erstellt
- [ ] Connection String kopiert

## Deployment Optionen

### Option A: Vercel Dashboard (Empfohlen)

1. **Code vorbereiten**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Vercel Dashboard**
   - [ ] Gehe zu [vercel.com/new](https://vercel.com/new)
   - [ ] Repository importieren
   - [ ] Framework: "Other" wählen

3. **Environment Variables setzen**
   - [ ] `DATABASE_URL` = Deine Neon Connection String
   - [ ] `NODE_ENV` = `production`
   - [ ] `ALLOWED_ORIGINS` = `*` (oder spezifische Domains)

4. **Deploy**
   - [ ] "Deploy" Button klicken
   - [ ] Warten bis fertig (ca. 1-2 Minuten)

### Option B: Vercel CLI

```bash
# Installation
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Environment Variables
vercel env add DATABASE_URL production
vercel env add NODE_ENV production
vercel env add ALLOWED_ORIGINS production

# Production Deploy
vercel --prod
```

## Nach dem Deployment

### 1. URLs notieren
- [ ] Frontend URL: `https://your-project.vercel.app`
- [ ] API URL: `https://your-project.vercel.app/api`

### 2. Tests durchführen

**Frontend Test:**
```bash
# Im Browser öffnen
open https://your-project.vercel.app
```
✅ Erwartung: Weekly Reports App wird angezeigt

**Backend Health Check:**
```bash
curl https://your-project.vercel.app/api/health
```
✅ Erwartung: 
```json
{
  "status": "ok",
  "timestamp": "2025-11-22T...",
  "database": "connected"
}
```

**API Test - Report erstellen:**
```bash
curl -X POST https://your-project.vercel.app/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "week": 47,
    "year": 2025,
    "tasks": [
      {
        "text": "Test Task",
        "category": "vertrieb",
        "status": "completed"
      }
    ]
  }'
```
✅ Erwartung: Report-Objekt mit ID zurück

**API Test - Reports abrufen:**
```bash
curl https://your-project.vercel.app/api/reports?year=2025
```
✅ Erwartung: Array mit Reports

### 3. Funktionalität prüfen
- [ ] Dashboard lädt
- [ ] Tasks können hinzugefügt werden
- [ ] KPIs werden angezeigt
- [ ] Charts werden gerendert
- [ ] Export funktioniert (PDF, Excel)
- [ ] Dark Mode funktioniert
- [ ] LocalStorage funktioniert

### 4. Performance prüfen
- [ ] Frontend lädt < 3 Sekunden
- [ ] API antwortet < 1 Sekunde
- [ ] Keine Fehler in Browser Console
- [ ] Keine 404/500 Fehler

## Troubleshooting

### Problem: 404 auf `/api/health`
**Check:**
```bash
# vercel.json Routes korrekt?
cat vercel.json | grep -A 5 routes
```

**Fix:**
```json
{
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" }
  ]
}
```

### Problem: Database Connection Error
**Check:**
1. Environment Variables in Vercel Dashboard
2. Neon Database Status
3. Connection String Format

**Fix:**
```bash
# Environment Variables neu setzen
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production
# Paste neue Connection String
```

### Problem: Module not found
**Check:**
```bash
# package.json dependencies
cat package.json | grep -A 20 dependencies
```

**Fix:**
```bash
npm install --save <missing-package>
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push
```

### Logs ansehen
```bash
# Via CLI
vercel logs

# Via Dashboard
# https://vercel.com/your-username/your-project/logs
```

## Optional: Custom Domain

1. **Domain kaufen** (z.B. bei Namecheap, Google Domains)
2. **In Vercel hinzufügen:**
   - Settings → Domains → Add
   - Domain eingeben (z.B. `reports.yourdomain.com`)
3. **DNS konfigurieren** (folge Vercel-Anleitung)
4. **Warten auf SSL** (automatisch, ca. 5 Minuten)

## Monitoring Setup (Optional)

### Vercel Analytics
```bash
# Im Projekt aktivieren
vercel analytics
```

### Error Tracking
- Sentry Integration
- LogRocket
- Datadog

## Sicherheit (Production)

- [ ] Environment Variables nur in Vercel setzen
- [ ] `.env` niemals committen
- [ ] ALLOWED_ORIGINS auf spezifische Domains beschränken
- [ ] Rate Limiting implementieren (optional)
- [ ] API Keys für sensitive Endpoints (optional)

## Backup

- [ ] Neon Auto-Backup aktiviert
- [ ] Export-Funktionalität getestet
- [ ] Lokale Backups erstellen (optional)

## Dokumentation

- [x] VERCEL-FULL-STACK-DEPLOYMENT.md erstellt
- [x] QUICK-DEPLOY.md erstellt
- [x] .env.example vorhanden

---

## 🎉 Fertig!

Wenn alle Punkte abgehakt sind, ist deine App erfolgreich deployed!

**Deine URLs:**
- Frontend: `https://your-project.vercel.app`
- API: `https://your-project.vercel.app/api`
- Health: `https://your-project.vercel.app/api/health`

**Nächste Schritte:**
1. Custom Domain hinzufügen
2. Analytics aktivieren
3. Monitoring einrichten
4. Team einladen
5. Production-Daten migrieren

**Support:**
- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- GitHub Issues: dein-repo/issues
