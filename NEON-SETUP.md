# Neon Postgres Setup - EWS Weekly Reports

Komplette Anleitung zur Einrichtung von Neon Postgres für dein Vercel-Deployment.

## Was ist Neon?

Neon ist eine serverlose Postgres-Datenbank, perfekt für Vercel:
- **Serverless:** Keine Server-Verwaltung
- **Auto-Scaling:** Skaliert automatisch
- **Cost-Efficient:** Bezahle nur für Nutzung
- **Schnell:** HTTP-basierte Verbindungen (ideal für Serverless)
- **Kostenloser Plan verfügbar**

## Voraussetzungen

- Neon Account (kostenlos unter https://neon.tech)
- Vercel Account
- Node.js v18+ installiert (für lokale Entwicklung)

## Schritt-für-Schritt Setup

### 1. Neon-Datenbank erstellen

1. **Gehe zu https://neon.tech und registriere dich**
   - Melde dich mit GitHub, Google oder Email an
   - Kostenloser Plan ist ausreichend für den Start

2. **Erstelle ein neues Projekt:**
   - Klicke auf "New Project"
   - **Project Name:** `ews-weekly-reports`
   - **Region:** `Europe (Frankfurt)` (für niedrige Latenz)
   - **Postgres Version:** Latest (aktuell 16)
   - Klicke auf "Create Project"

3. **Connection String kopieren:**

   Nach der Erstellung siehst du einen Connection String:
   ```
   postgresql://[user]:[password]@[host]/[database]?sslmode=require
   ```

   **WICHTIG:** Kopiere diesen String! Du brauchst ihn für die Environment Variables.

### 2. Datenbank-Tabellen erstellen

#### Option A: Über Neon SQL Editor (Empfohlen)

1. **Gehe zu deinem Neon Dashboard**
2. **Klicke auf "SQL Editor"**
3. **Öffne die Migration-Datei:**
   - Öffne `api/db/migrate.js` in deinem Projekt
   - Kopiere das SQL aus der `createTablesSQL` Konstante

4. **Führe das SQL aus:**
   - Füge das SQL in den Neon SQL Editor ein
   - Klicke auf "Run"
   - Warte auf "Query executed successfully"

#### Option B: Über lokales Migrations-Script

1. **Environment Variable setzen:**
   ```bash
   # Erstelle .env Datei
   echo "DATABASE_URL=dein_neon_connection_string" > .env
   ```

2. **Dependencies installieren:**
   ```bash
   npm install
   ```

3. **Migration ausführen:**
   ```bash
   node api/db/migrate.js
   ```

   Du solltest sehen:
   ```
   🔄 Starting database migration...
   ✅ Migration completed successfully!
   ```

### 3. Environment Variables in Vercel setzen

1. **Gehe zu deinem Vercel Dashboard:**
   - https://vercel.com/dashboard

2. **Wähle dein Projekt aus**

3. **Gehe zu Settings > Environment Variables**

4. **Füge DATABASE_URL hinzu:**
   - **Key:** `DATABASE_URL`
   - **Value:** Dein Neon Connection String
   - **Environments:** Production, Preview, Development (alle auswählen)
   - Klicke auf "Save"

   Beispiel:
   ```
   postgresql://user:password@ep-cool-name-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

5. **Optional: Weitere Environment Variables:**
   ```
   NODE_ENV=production
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

### 4. Deployment

Nach dem Setzen der Environment Variable:

```bash
# Option 1: Push zu Git (automatisches Deployment)
git add .
git commit -m "Add Neon database integration"
git push origin main

# Option 2: Manuelles Deployment
vercel --prod
```

### 5. Testen

1. **Health Check:**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

   Erwartete Antwort:
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-11-22T...",
     "version": "3.0.0",
     "platform": "Vercel",
     "database": {
       "status": "healthy",
       "database": "neon-postgres"
     }
   }
   ```

2. **Ersten Report erstellen:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/reports \
     -H "Content-Type: application/json" \
     -d '{
       "week": "2025-W47",
       "department": "Vertrieb",
       "status": "green",
       "achievements": "Test Report",
       "kpis": {"sales": 100}
     }'
   ```

3. **Reports abrufen:**
   ```bash
   curl https://your-app.vercel.app/api/reports
   ```

## Lokale Entwicklung

### Setup für lokale Entwicklung:

1. **Environment Variable setzen:**
   ```bash
   # .env Datei erstellen
   DATABASE_URL=postgresql://user:password@...
   ```

2. **Dependencies installieren:**
   ```bash
   npm install
   ```

3. **Vercel Dev Server starten:**
   ```bash
   vercel dev
   ```

4. **Oder Node.js direkt:**
   ```bash
   node server.js
   ```

   Öffne http://localhost:3000

## Datenbank-Schema Übersicht

### Tabellen:

1. **reports** - Wochenberichte
   - id, week, department, status
   - kpis (JSONB), achievements, challenges
   - created_at, updated_at

2. **tasks** - Aufgaben
   - id, title, description, status
   - priority, assignee, department
   - due_date, completed_at

3. **comments** - Kommentare zu Reports
   - id, report_id, text
   - author, author_email

4. **templates** - Vorlagen
   - id, name, description
   - content (JSONB), is_default

5. **archive** - Archivierte Reports
   - id, original_id, week
   - data (JSONB), archived_at

6. **users** - Benutzer (optional)
   - id, email, name
   - department, role

### Indexe für Performance:

Alle wichtigen Felder haben Indexe:
- `idx_reports_week`, `idx_reports_department`
- `idx_tasks_status`, `idx_tasks_assignee`
- `idx_comments_report_id`
- und mehr...

### Auto-Update Trigger:

Die Felder `updated_at` werden automatisch aktualisiert bei Updates.

## Neon Dashboard Features

### Monitoring:

1. **Gehe zu Neon Dashboard > Monitoring**
   - Connection Metrics
   - Query Performance
   - Storage Usage

2. **Gehe zu Operations > Query History**
   - Sieh alle ausgeführten Queries
   - Performance-Analyse

### Branching (Advanced):

Neon unterstützt Database Branching:
```bash
# Erstelle einen Branch für Testing
neonctl branches create --name testing
```

### Backups:

- Automatische Backups sind im Free Plan enthalten
- Point-in-Time Recovery verfügbar (Pro Plan)

## Troubleshooting

### Problem: "DATABASE_URL not set"

**Lösung:**
- Prüfe, ob Environment Variable in Vercel gesetzt ist
- Für lokale Entwicklung: `.env` Datei erstellen
- Stelle sicher, dass `.env` in `.gitignore` ist

### Problem: Connection Timeout

**Lösung:**
- Neon verwendet HTTP-basierte Connections (kein Timeout bei Serverless)
- Prüfe Connection String Format
- Stelle sicher, dass `?sslmode=require` am Ende ist

### Problem: Migration schlägt fehl

**Lösung:**
```bash
# 1. Prüfe Connection
curl https://console.neon.tech/api/v2/projects

# 2. Führe Migration einzeln aus
node api/db/migrate.js

# 3. Bei Fehler: Manuell via Neon SQL Editor
```

### Problem: "Column does not exist"

**Lösung:**
- Migrations wurden nicht ausgeführt
- Führe `node api/db/migrate.js` aus
- Oder nutze Neon SQL Editor

## Kosten & Limits

### Free Plan:
- **Storage:** 3 GB
- **Compute Time:** 191.9 hours/month
- **Branches:** 10
- **Projects:** Unlimited
- **Perfect für Development & kleine Apps**

### Pro Plan ($19/month):
- **Storage:** 200 GB
- **Compute Time:** Unlimited
- **Branches:** Unlimited
- **Point-in-Time Recovery**
- **Advanced Monitoring**

### Tipps zur Kostenoptimierung:

1. **Auto-Suspend:** Aktiviert standardmäßig (suspendiert bei Inaktivität)
2. **Connection Pooling:** Nutze `@neondatabase/serverless` (HTTP-basiert)
3. **Indexe:** Optimiere Queries mit Indexen
4. **Archive:** Alte Daten archivieren (Auto-Archive API nutzen)

## Sicherheit

### Best Practices:

1. **Connection String geheim halten:**
   ```bash
   # NIEMALS in Git committen!
   echo ".env" >> .gitignore
   ```

2. **SSL verwenden:**
   - Immer `?sslmode=require` verwenden
   - Standardmäßig in Neon aktiviert

3. **Read-Only User (Optional):**
   ```sql
   CREATE USER readonly_user WITH PASSWORD 'strong_password';
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
   ```

4. **IP Allowlisting (Pro Plan):**
   - Beschränke Zugriff auf spezifische IPs
   - Konfiguriere in Neon Dashboard

## Nützliche Links

- **Neon Documentation:** https://neon.tech/docs
- **Neon Console:** https://console.neon.tech
- **Neon API Reference:** https://neon.tech/docs/reference/api-reference
- **Vercel + Neon Guide:** https://vercel.com/guides/using-neon-postgres-with-vercel
- **Drizzle ORM Docs:** https://orm.drizzle.team

## Support

Bei Fragen:
- **Neon Discord:** https://discord.gg/neon
- **Neon Support:** support@neon.tech
- **Vercel Support:** https://vercel.com/support

---

**Deine Datenbank ist jetzt production-ready! 🚀**
