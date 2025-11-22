# Vercel Deployment Guide - EWS Weekly Reports

Dieses Dokument beschreibt, wie du die EWS Weekly Reports Anwendung auf Vercel deployest.

## Projektstruktur

```
Wochenbericht-Distribution-Claude-Based/
├── api/                      # Serverless Functions
│   └── index.js             # Haupt-API-Handler
├── public/                  # Statische Dateien
│   └── index.html          # Frontend-Anwendung
├── vercel.json             # Vercel-Konfiguration
├── .vercelignore          # Dateien, die von Vercel ignoriert werden
└── package.json           # Node.js Dependencies
```

## Voraussetzungen

1. **Node.js** (v18 oder höher)
2. **npm** (v9 oder höher)
3. **Vercel Account** (kostenlos unter https://vercel.com)
4. **Vercel CLI** (optional, aber empfohlen)

## Installation Vercel CLI

```bash
npm install -g vercel
```

## Deployment-Methoden

### Methode 1: Deployment über Vercel Dashboard (Empfohlen)

1. **Repository zu Vercel verbinden:**
   - Gehe zu https://vercel.com/new
   - Wähle dein Git-Repository aus (GitHub, GitLab, Bitbucket)
   - Klicke auf "Import"

2. **Projekt-Konfiguration:**
   - **Framework Preset:** Other
   - **Root Directory:** ./
   - **Build Command:** (leer lassen)
   - **Output Directory:** public
   - Die `vercel.json` wird automatisch erkannt

3. **Environment Variables (Optional):**
   - Füge bei Bedarf Environment Variables hinzu:
     - `NODE_ENV` = `production` (bereits in vercel.json)
     - Weitere nach Bedarf

4. **Deploy:**
   - Klicke auf "Deploy"
   - Vercel wird dein Projekt automatisch bauen und deployen

### Methode 2: Deployment über Vercel CLI

1. **Im Projekt-Verzeichnis:**
   ```bash
   cd /pfad/zu/Wochenbericht-Distribution-Claude-Based
   ```

2. **Login bei Vercel:**
   ```bash
   vercel login
   ```

3. **Erstes Deployment (Preview):**
   ```bash
   vercel
   ```
   - Beantworte die Fragen:
     - Set up and deploy? **Y**
     - Which scope? (Wähle deinen Account)
     - Link to existing project? **N**
     - Project name? (Standard: Projektname)
     - In which directory is your code located? **.**

4. **Production Deployment:**
   ```bash
   vercel --prod
   ```

### Methode 3: Automatisches Deployment via Git

Nach dem ersten Setup über das Dashboard oder CLI:

1. **Push zu Git:**
   ```bash
   git add .
   git commit -m "Setup Vercel deployment"
   git push origin main
   ```

2. **Automatisches Deployment:**
   - Vercel erkennt automatisch neue Commits
   - Jeder Push zu `main` = Production Deployment
   - Jeder Push zu anderen Branches = Preview Deployment

## Vercel-Konfiguration erklärt

### vercel.json

```json
{
  "version": 2,                    // Vercel Platform Version
  "name": "ews-weekly-reports",    // Projektname

  "rewrites": [                    // API-Routing
    {
      "source": "/api/(.*)",       // Alle /api/* Anfragen
      "destination": "/api"        // Werden an api/index.js geleitet
    }
  ],

  "headers": [                     // HTTP Headers
    {
      "source": "/api/(.*)",       // Für API-Requests
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"             // CORS erlauben
        }
      ]
    }
  ],

  "regions": ["fra1"],             // Frankfurt-Region (EU)
  "cleanUrls": true,               // URLs ohne .html
  "trailingSlash": false           // Keine trailing slashes
}
```

## API-Struktur

Die API läuft als Serverless Function unter `/api`:

- `GET  /api/health` - Health Check
- `GET  /api/reports` - Alle Reports abrufen
- `POST /api/reports` - Neuen Report erstellen
- `PUT  /api/reports/:id` - Report aktualisieren
- `DELETE /api/reports/:id` - Report löschen
- `GET  /api/tasks` - Alle Tasks abrufen
- `POST /api/tasks` - Neuen Task erstellen
- `GET  /api/analytics/*` - Analytics-Endpunkte
- Weitere siehe `api/index.js`

## Wichtige Hinweise

### Datenbank

⚠️ **WICHTIG:** Die aktuelle Implementierung verwendet einen In-Memory-Speicher. Das bedeutet:

- Daten werden bei jedem Deployment zurückgesetzt
- Daten gehen bei Serverless Function Timeouts verloren
- **Nicht für Production geeignet!**

**Für Production:**

Verwende eine persistente Datenbank:

1. **Vercel Postgres** (empfohlen für Vercel)
   ```bash
   vercel postgres create
   ```

2. **MongoDB Atlas** (Cloud-Datenbank)
   - Erstelle Cluster unter https://mongodb.com/atlas
   - Füge Connection String als Environment Variable hinzu

3. **Supabase** (PostgreSQL mit Realtime)
   - Erstelle Projekt unter https://supabase.com
   - Verwende die bereitgestellten Credentials

### Environment Variables

Setze in Vercel Dashboard unter Settings > Environment Variables:

```bash
NODE_ENV=production
DATABASE_URL=your_database_connection_string  # Für persistente Datenbank
ALLOWED_ORIGINS=https://your-domain.vercel.app
```

### Performance

- **Serverless Functions:** Max. 10 Sekunden Ausführungszeit (Free Plan)
- **Cold Starts:** Erste Anfrage kann langsamer sein
- **Region:** Projekt läuft in `fra1` (Frankfurt)
- **Caching:** Statische Dateien werden automatisch gecached

### Monitoring

- **Vercel Dashboard:** https://vercel.com/dashboard
  - Deployment Logs
  - Runtime Logs
  - Analytics
  - Performance Metrics

- **Health Check:**
  ```bash
  curl https://your-app.vercel.app/api/health
  ```

## Troubleshooting

### Problem: 404 bei API-Calls

**Lösung:**
- Prüfe `vercel.json` Konfiguration
- Stelle sicher, dass `/api` Pfad korrekt ist
- Checke Deployment Logs

### Problem: CORS-Fehler

**Lösung:**
- Headers in `vercel.json` prüfen
- Für spezifische Origins: `ALLOWED_ORIGINS` Environment Variable setzen

### Problem: Function Timeout

**Lösung:**
- Serverless Functions haben 10s Limit (Free Plan)
- Optimiere Datenbank-Queries
- Upgrade zu Pro Plan (60s Limit)

### Problem: Daten gehen verloren

**Lösung:**
- In-Memory Speicher ist temporär
- Implementiere persistente Datenbank (siehe oben)

## Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# Vercel Dev Server starten
vercel dev

# Öffne http://localhost:3000
```

Der `vercel dev` Befehl simuliert die Vercel-Umgebung lokal.

## Kosten

- **Free Plan:**
  - 100 GB Bandwidth
  - Serverless Function Executions: 100 GB-Hrs
  - 10s Function Timeout
  - Ideal für Development & kleine Apps

- **Pro Plan ($20/Monat):**
  - 1 TB Bandwidth
  - 1000 GB-Hrs Executions
  - 60s Function Timeout
  - Custom Domains
  - Analytics

## Nützliche Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Node.js Runtime](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

## Support

Bei Fragen oder Problemen:
- Vercel Support: https://vercel.com/support
- Vercel Community: https://github.com/vercel/vercel/discussions

---

**Viel Erfolg mit deinem Deployment! 🚀**
