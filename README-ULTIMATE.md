# 📊 EWS Weekly Report Tool - Ultimate Edition

**Version 3.0.0** | Production-Ready | Full-Stack Solution

Eine vollständige, produktionsreife Lösung für Wochenberichte, KPI-Tracking und Aufgaben-Management für die Distribution-Abteilung der EWS GmbH.

---

## ✨ Features im Überblick

### 🎯 Kernfunktionen
- ✅ **Multi-Department Reports** - Vertrieb, Auftragsabwicklung, Lager, Kundenservice
- ✅ **KPI Analytics** - Interaktive Charts mit Chart.js
- ✅ **Task Management** - Kanban Board & Tabellen-Ansicht
- ✅ **Executive Reports** - Automatische Konsolidierung
- ✅ **Template System** - Vorgefertigte Berichtsvorlagen

### 🚀 Advanced Features (Phase 2)
- ☁️ **Cloud-Synchronisation** - Firebase/Supabase Integration
- 🤖 **AI-Summary** - Claude API für automatische Zusammenfassungen
- 📧 **Email-Automation** - Automatischer Versand
- 📱 **Progressive Web App** - Installierbar als Desktop/Mobile App
- 🔔 **Push-Notifications** - Browser-Benachrichtigungen
- 💬 **Kommentar-System** - Feedback direkt am Bericht
- 🗄️ **Auto-Archivierung** - Automatisch nach 12 Wochen
- 📊 **Excel/CSV Export** - Multi-Sheet Export mit Formatierung
- 📄 **Template Library** - Standard, Vertrieb, Operations, Projekt
- 🌍 **i18n Support** - Deutsch & Englisch

### 🛠️ Technical Features
- 🎨 **Dark/Light Mode** - Automatische Theme-Umschaltung
- 📱 **Fully Responsive** - Mobile, Tablet, Desktop
- 💾 **Offline-First** - LocalStorage mit Cloud-Sync
- 🔒 **Security** - Helmet.js, CORS, JWT Authentication
- 📈 **Monitoring** - Sentry, Winston Logging
- 🐳 **Docker** - Vollständige Containerisierung
- 🔄 **CI/CD** - GitHub Actions Pipeline
- ⚡ **Performance** - Compression, Caching, CDN

---

## 🚀 Quick Start

### Option 1: Lokale Standalone-Version (Einfachste Methode)

```bash
# Einfach die HTML-Datei im Browser öffnen
open wochenbericht-ultimate.html

# Oder mit einem lokalen Server
npx http-server . -p 3000
```

### Option 2: Mit Backend API (Full-Stack)

```bash
# Repository klonen
git clone https://github.com/ews-gmbh/weekly-reports.git
cd weekly-reports

# Dependencies installieren
npm install

# Umgebungsvariablen konfigurieren
cp .env.example .env
# Bearbeite .env mit deinen Werten

# Server starten
npm start
```

### Option 3: Docker (Empfohlen für Produktion)

```bash
# Mit Docker Compose (alle Services)
docker-compose up -d

# Oder nur die App
docker build -t ews-reports .
docker run -p 3000:3000 ews-reports
```

---

## 📦 Installation

### Voraussetzungen

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14 (optional, für Backend)
- **Redis** >= 7 (optional, für Caching)
- **Docker** (optional, für Container-Deployment)

### Dependencies

```bash
# Production Dependencies
npm install express cors helmet dotenv pg mongoose firebase-admin nodemailer

# Development Dependencies
npm install --save-dev nodemon jest eslint prettier
```

---

## 🏗️ Architektur

### Frontend
```
wochenbericht-ultimate.html
├── HTML Structure
├── CSS Styling (Dark/Light Mode)
├── JavaScript Application Logic
│   ├── State Management
│   ├── i18n Translations
│   ├── LocalStorage Persistence
│   ├── Chart.js Integration
│   └── PWA Service Worker
└── External Libraries
    ├── Chart.js 4.4.0
    ├── Font Awesome 6.4.0
    └── SheetJS (XLSX)
```

### Backend (Optional)
```
server.js
├── Express.js Server
├── REST API Endpoints
├── Database Integration
├── Authentication & Authorization
├── Email Service
├── File Upload Handler
└── Monitoring & Logging
```

### Database Schema
```
Reports
├── id (UUID)
├── week (String)
├── department (String)
├── highlights (Text)
├── challenges (Text)
├── kpis (JSON)
├── status (Enum: green/yellow/red)
├── notes (Text)
├── createdAt (Timestamp)
└── createdBy (String)

Tasks
├── id (UUID)
├── title (String)
├── description (Text)
├── assignee (String)
├── dueDate (Date)
├── priority (Enum: low/medium/high)
├── status (Enum: todo/inProgress/done)
└── createdAt (Timestamp)
```

---

## 🔧 Konfiguration

### Umgebungsvariablen

Siehe `.env.example` für alle verfügbaren Konfigurationsoptionen.

**Wichtigste Variablen:**

```bash
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Cloud Sync
FIREBASE_PROJECT_ID=your_project
SUPABASE_URL=https://your_project.supabase.co

# Claude AI
CLAUDE_API_KEY=sk-ant-your-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
```

### Feature Flags

```javascript
// In wochenbericht-ultimate.html oder .env
ENABLE_AI_SUMMARY=true
ENABLE_CLOUD_SYNC=true
ENABLE_EMAIL_AUTOMATION=true
ENABLE_NOTIFICATIONS=true
```

---

## 🌐 Deployment

### Vercel (Empfohlen für Frontend)

```bash
# Vercel CLI installieren
npm install -g vercel

# Deployen
vercel --prod

# Oder mit GitHub Integration
# Push zu main branch → Automatisches Deployment
```

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" },
    { "src": "wochenbericht-ultimate.html", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server.js" },
    { "src": "/(.*)", "dest": "wochenbericht-ultimate.html" }
  ]
}
```

### Railway (Empfohlen für Backend)

```bash
# Railway CLI installieren
npm install -g @railway/cli

# Deployen
railway up

# Oder via Web Dashboard
# 1. GitHub Repo verbinden
# 2. Environment Variables setzen
# 3. Deploy!
```

### Docker / Kubernetes

```bash
# Docker Build & Push
docker build -t ghcr.io/ews-gmbh/weekly-reports:latest .
docker push ghcr.io/ews-gmbh/weekly-reports:latest

# Kubernetes Deployment
kubectl apply -f k8s/deployment.yml
kubectl apply -f k8s/service.yml
```

---

## 📊 API Dokumentation

### REST API Endpoints

#### Reports

```http
# Get all reports
GET /api/reports?department=Vertrieb&week=2024-W47&limit=50

# Get single report
GET /api/reports/:id

# Create report
POST /api/reports
Content-Type: application/json
{
  "week": "2024-W47",
  "department": "Vertrieb",
  "highlights": "...",
  "challenges": "...",
  "kpis": {...},
  "status": "green"
}

# Update report
PUT /api/reports/:id
Content-Type: application/json
{...}

# Delete report
DELETE /api/reports/:id
```

#### Tasks

```http
# Get all tasks
GET /api/tasks?status=todo&assignee=MaxMustermann

# Create task
POST /api/tasks
Content-Type: application/json
{
  "title": "Q4 Meeting",
  "description": "...",
  "assignee": "Max Mustermann",
  "dueDate": "2024-12-01",
  "priority": "high",
  "status": "todo"
}

# Update task
PUT /api/tasks/:id

# Delete task
DELETE /api/tasks/:id
```

#### Analytics

```http
# KPI Analytics
GET /api/analytics/kpi?timeRange=12&department=all

# Department Performance
GET /api/analytics/departments

# Task Statistics
GET /api/analytics/tasks
```

#### Comments

```http
# Get comments for report
GET /api/reports/:reportId/comments

# Add comment
POST /api/reports/:reportId/comments
Content-Type: application/json
{
  "text": "Great work!",
  "author": "CEO"
}
```

#### Export

```http
# Export as JSON
GET /api/export/json
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### E2E Tests

```bash
# Playwright
npm run test:e2e

# Cypress
npm run cypress:open
```

### API Tests

```bash
# Postman Collection
newman run tests/api-collection.json

# Manual with curl
curl http://localhost:3000/api/health
```

---

## 📈 Monitoring & Logging

### Logging

```javascript
// Winston Logger
logger.info('Report created', { reportId, department });
logger.error('Failed to save report', { error });
```

### Error Tracking

```javascript
// Sentry Integration
Sentry.captureException(error);
```

### Performance Monitoring

```javascript
// Prometheus Metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});
```

---

## 🔐 Security

### Best Practices
- ✅ Helmet.js für Security Headers
- ✅ CORS konfiguriert
- ✅ Rate Limiting
- ✅ Input Validation
- ✅ SQL Injection Prevention
- ✅ XSS Protection
- ✅ CSRF Protection
- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Environment Variables für Secrets

### Dependency Scanning

```bash
# npm audit
npm audit fix

# Snyk
snyk test
snyk monitor
```

---

## 🎨 Customization

### Branding

```css
/* In wochenbericht-ultimate.html */
:root {
  --primary-color: #2563eb;  /* Hauptfarbe ändern */
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
}
```

### Abteilungen

```javascript
// Abteilungen anpassen
const departments = [
  'Vertrieb',
  'Auftragsabwicklung',
  'Lager',
  'Kundenservice',
  // Neue Abteilungen hier hinzufügen
];
```

### Sprachen

```javascript
// Neue Sprache hinzufügen
const TRANSLATIONS = {
  de: {...},
  en: {...},
  fr: {...}  // Französisch hinzufügen
};
```

---

## 📚 Weitere Dokumentation

- [API Reference](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

---

## 🤝 Support

### Issues
GitHub Issues: [https://github.com/ews-gmbh/weekly-reports/issues](https://github.com/ews-gmbh/weekly-reports/issues)

### Contact
- **Email:** support@ews-gmbh.de
- **Slack:** #weekly-reports
- **Teams:** Distribution Team

---

## 📄 License

MIT License - siehe [LICENSE](LICENSE) für Details

---

## 👏 Credits

**Entwickelt für EWS GmbH** | Handewitt, Deutschland

**Technologies:**
- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Charts: Chart.js
- Backend: Node.js, Express.js
- Database: PostgreSQL / MongoDB
- Cloud: Firebase / Supabase
- Deployment: Vercel, Railway, Docker
- CI/CD: GitHub Actions
- Monitoring: Sentry, Winston

---

## 🚀 Roadmap

### Version 3.1 (Q1 2025)
- [ ] Mobile Native Apps (React Native)
- [ ] Advanced Analytics Dashboard
- [ ] Machine Learning Predictions
- [ ] Integration mit SAP
- [ ] Multi-Tenant Support

### Version 3.2 (Q2 2025)
- [ ] Video Conferencing Integration
- [ ] Voice Input
- [ ] Advanced Permissions System
- [ ] Audit Log
- [ ] GraphQL API

---

**Version 3.0.0** | Letztes Update: November 2024 | EWS GmbH ©
