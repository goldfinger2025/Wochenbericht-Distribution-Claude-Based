# 🚀 Vercel Deployment Guide

## Schnellstart - In 3 Schritten deployen

### 1. Vercel CLI installieren (falls noch nicht vorhanden)
```bash
npm i -g vercel
```

### 2. In Vercel einloggen
```bash
vercel login
```

### 3. Projekt deployen
```bash
vercel --prod
```

Das war's! 🎉

---

## ✨ Features

- **Keine Datenbank erforderlich** - Nutzt In-Memory Storage
- **Serverless Functions** - Automatisch skalierend
- **CDN-optimiert** - Statische Dateien über Vercel CDN
- **Instant Rollbacks** - Bei Problemen schnell zurück zur vorherigen Version

---

## 📋 Detaillierte Deployment-Schritte

### Option A: Automatisches Deployment (empfohlen)

1. **GitHub Repository verbinden**
   ```bash
   vercel --prod
   ```
   
2. **Folge den Prompts**:
   - Project name: `ews-weekly-reports` (oder dein Wunschname)
   - Directory: `.` (aktuelles Verzeichnis)
   - Override settings: **Nein**

3. **Fertig!** Die URL wird angezeigt, z.B.:
   ```
   https://ews-weekly-reports.vercel.app
   ```

### Option B: GitHub Auto-Deployment

1. **Repository auf GitHub pushen**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **In Vercel Dashboard**:
   - Gehe zu https://vercel.com/new
   - Wähle dein GitHub Repository
   - Klicke "Import"
   - Klicke "Deploy"

3. **Automatische Deployments**:
   - Jeder Push auf `main` = Production Deployment
   - Jeder Pull Request = Preview Deployment

---

## ⚙️ Konfiguration

### Umgebungsvariablen (optional)

Im Vercel Dashboard unter **Settings > Environment Variables**:

| Variable | Wert | Beschreibung |
|----------|------|--------------|
| `NODE_ENV` | `production` | Node Umgebung |
| `ALLOWED_ORIGINS` | `https://deine-domain.com` | CORS Origins (optional) |

---

## 📊 Storage & Datenpersistenz

### ⚠️ Wichtig zu wissen

Die aktuelle Version nutzt **In-Memory Storage**:
- ✅ Perfekt zum Testen und Demonstrieren
- ⚠️ Daten gehen bei jedem Deployment/Cold Start verloren
- 🔄 Ideal für Prototypen und POCs

### 🔄 Upgrade auf persistente Datenbank

Für Production mit Datenpersistenz, siehe:
- [NEON-SETUP.md](./NEON-SETUP.md) - Neon Postgres Setup
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) - Integrierte Lösung
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv) - Redis-basiert

---

## 🔍 Testing nach Deployment

### Health Check
```bash
curl https://deine-app.vercel.app/api/health
```

Erwartete Antwort:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "3.0.0",
  "platform": "Vercel Serverless",
  "storage": "In-Memory"
}
```

### Frontend testen
Öffne im Browser:
```
https://deine-app.vercel.app
```

---

## 🐛 Troubleshooting

### Build-Fehler

**Problem**: `Module not found: express`
```bash
# Lösung: Dependencies installieren
npm install
vercel --prod
```

**Problem**: API funktioniert nicht
```bash
# Lösung: Vercel Logs prüfen
vercel logs
```

### Runtime-Fehler

**Problem**: 500 Internal Server Error
- Prüfe Vercel Dashboard > Deployment > Functions
- Schau in die Logs für Details

**Problem**: CORS-Fehler
- Füge `ALLOWED_ORIGINS` in Environment Variables hinzu
- Format: `https://domain1.com,https://domain2.com`

---

## 📈 Performance & Limits

### Vercel Free Tier
- ✅ 100 GB Bandwidth/Monat
- ✅ 100 Deployments/Tag
- ✅ Unlimited API Requests
- ⏱️ 10 Sekunden Execution Time Limit

### Optimierungen
- Statische Dateien werden über CDN ausgeliefert
- Serverless Functions sind automatisch skalierend
- Cold Start-Zeit: ~1-2 Sekunden

---

## 🔐 Custom Domain einrichten

1. **In Vercel Dashboard**:
   - Gehe zu Project > Settings > Domains
   - Klicke "Add Domain"
   - Gib deine Domain ein: `reports.deine-firma.de`

2. **DNS konfigurieren**:
   - Füge einen CNAME Record hinzu:
   ```
   reports.deine-firma.de → cname.vercel-dns.com
   ```

3. **SSL Zertifikat**:
   - Automatisch erstellt von Vercel
   - Kein Aufwand erforderlich! 🎉

---

## 🔄 Updates & Rollbacks

### Neues Deployment
```bash
git push origin main
# Oder
vercel --prod
```

### Rollback zu vorheriger Version
1. Gehe zu Vercel Dashboard
2. Wähle Deployment aus der Liste
3. Klicke "Promote to Production"

---

## 💡 Best Practices

### Vor dem Deployment
```bash
# Code prüfen
npm run lint

# Tests ausführen (falls vorhanden)
npm test

# Lokales Build testen
npm run build
```

### Production Monitoring
- Nutze Vercel Analytics für Traffic-Insights
- Setze Up-Time Monitoring (z.B. UptimeRobot)
- Überwache Error-Logs im Vercel Dashboard

---

## 📚 Weitere Ressourcen

- [Vercel Dokumentation](https://vercel.com/docs)
- [Serverless Functions Guide](https://vercel.com/docs/functions)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/domains)

---

## 🆘 Support

Bei Problemen:
1. Prüfe die [Vercel Status Page](https://www.vercel-status.com/)
2. Schaue in die [Vercel Community](https://github.com/vercel/vercel/discussions)
3. Kontaktiere das Entwicklerteam

---

**Viel Erfolg beim Deployment! 🚀**
