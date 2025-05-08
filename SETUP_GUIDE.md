# BlissAI-Chatbot Einrichtungsanleitung

## Voraussetzungen

1. Node.js (Version 18 oder höher)
2. npm oder yarn
3. PostgreSQL-Datenbank

## Einrichtungsschritte

### 1. Pakete installieren

```bash
npm install
# oder
yarn install
```

### 2. Umgebungsvariablen einrichten

Erstellen Sie eine Datei `.env` im Hauptverzeichnis des Projekts mit folgendem Inhalt:

```
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/blissai?schema=public"

# Stack Exchange OAuth
STACKEXCHANGE_CLIENT_ID=your-stackexchange-client-id
STACKEXCHANGE_CLIENT_SECRET=your-stackexchange-client-secret
STACKEXCHANGE_KEY=your-stackexchange-api-key

# OpenAI API
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo
```

Ersetzen Sie die Platzhalter mit Ihren tatsächlichen Werten:

- Generieren Sie einen sicheren NEXTAUTH_SECRET (z.B. mit `openssl rand -base64 32`)
- Passen Sie die DATABASE_URL an Ihre PostgreSQL-Instanz an
- Registrieren Sie eine App bei [Stack Apps](https://stackapps.com/apps/oauth/register) für die Stack Exchange OAuth-Anmeldung
- Fügen Sie Ihren OpenAI API-Schlüssel ein

### 3. Datenbank vorbereiten

```bash
npx prisma migrate dev --name init
```

Dieser Befehl erstellt die Datenbanktabellen gemäß dem Schema in `prisma/schema.prisma`.

### 4. Entwicklungsserver starten

```bash
npm run dev
# oder
yarn dev
```

Die Anwendung ist nun unter http://localhost:3000 verfügbar.

### 5. Für Produktionsumgebung bauen

```bash
npm run build
# oder
yarn build
```

Gefolgt von:

```bash
npm start
# oder
yarn start
```

## Stack Auth einrichten

Um Stack Exchange OAuth zu aktivieren:

1. Registrieren Sie eine App unter https://stackapps.com/apps/oauth/register
2. Fügen Sie als OAuth Domain und Redirect URI ein: `http://localhost:3000/api/auth/callback/stackexchange`
3. Kopieren Sie Client ID, Client Secret und Key in Ihre `.env`-Datei

## Fehlerbehebung

Bei Fehlern überprüfen Sie:

1. Ist die Datenbank erreichbar und läuft?
2. Sind alle Umgebungsvariablen korrekt gesetzt?
3. Laufen die Migrationen ohne Fehler durch?

Bei Problemen mit dem Stack Exchange OAuth, stellen Sie sicher, dass die Redirect-URLs und Domains korrekt konfiguriert sind. 