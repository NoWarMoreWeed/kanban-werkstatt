# Kanban

## Projektüberblick

Interne Webanwendung als digitaler Ersatz für physische Kanban-Boards.

Aktueller Funktionsumfang:
- mehrere Gruppenboards innerhalb einer Werkstatt
- Spalten und Karten pro Board
- Karten anlegen und bearbeiten
- Karten zwischen Spalten verschieben
- Karten archivieren
- Suche im Board

## Fachliche Betriebsregel für die Board-Anlage

- Neue Boards sind fachlich nur für Admins vorgesehen.
- Version 1 enthält bewusst noch keine Login- oder Rollenlogik.
- Deshalb ist die Regel aktuell organisatorisch zu verstehen:
  Board-Anlage soll nur im administrativen Betrieb genutzt werden.
- Der Backend-Code markiert diese Stelle bereits gezielt für eine spätere echte Rechteprüfung.
- Die Frontend-Oberfläche bietet in Version 1 bewusst keine Funktion zum Anlegen neuer Boards.
- Vorhandene Boards kommen in Version 1 aus dem Seed oder werden bei Bedarf gezielt über die API angelegt.

## Verwendeter Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, dnd kit
- Backend: Node.js, Express, TypeScript
- Datenbank: PostgreSQL
- ORM: Prisma
- Formularbasis und Validierung: React Hook Form, Zod
- Betrieb: Docker Compose

## Projektstruktur

- `frontend`: React-Anwendung
- `backend`: Express-API und Prisma
- `docs/kanban`: Anforderungen, Design und Aufgaben
- `compose.yml`: lokale Container für Frontend, Backend und PostgreSQL

## Empfohlener Entwicklungsstart mit Docker Compose

Voraussetzungen:
- Docker Desktop oder eine kompatible Docker-Umgebung

Einmalig:

```bash
copy .env.example .env
```

Start:

```bash
docker compose up --build
```

Alternativ über das Root-Skript:

```bash
npm run dev:docker
```

## Was beim Compose-Start automatisch passiert

1. `database` startet und wartet, bis PostgreSQL gesund ist.
2. `backend-init` führt automatisch die Prisma-Migrationen aus.
3. `backend-init` führt danach den Seed aus.
4. Der Seed schreibt die Beispieldaten nur dann, wenn die Datenbank noch leer ist.
5. Erst wenn die Initialisierung erfolgreich abgeschlossen ist, startet `backend`.
6. Erst wenn `backend` gesund ist, startet `frontend`.

Damit ist der Compose-Start für lokale Entwicklung so aufgebaut, dass nach dem ersten Start möglichst keine manuellen Zusatzschritte nötig sind.

## Seed-Daten

Der Seed legt beim ersten Start an:
- eine Werkstatt
- drei Boards: `Rotary`, `Linear`, `Stator`
- feste Beispielspalten
- Beispielkarten

Wenn bereits Werkstattdaten vorhanden sind, wird der Seed übersprungen und bestehende Daten bleiben erhalten.

## Standard-URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Health: `http://localhost:4000/health`

## Öffentliche Veröffentlichung auf dem Home-Server

Für den öffentlichen Betrieb auf einem Home-Server gibt es einen separaten Deployment-Pfad über `Cloudflare Tunnel`.

Zielbild:
- `web`: stellt das gebaute Frontend bereit und leitet `/api` intern an das Backend weiter
- `backend`: Express-API, nicht direkt öffentlich erreichbar
- `database`: PostgreSQL, nur intern
- `cloudflared`: veröffentlicht die Website sicher über Cloudflare, ohne offene Router-Portfreigabe

Vorbereitung:

```bash
copy .env.public.example .env.public
```

Wichtige Werte in `.env.public`:
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `SESSION_SECRET`
- `MANAGER_MODE_PASSWORD`
- `CLOUDFLARE_TUNNEL_TOKEN`

Empfohlener Start auf dem Home-Server:

```bash
npm run deploy:home
```

Alternativ direkt mit Docker Compose:

```bash
docker compose --env-file .env.public -f compose.public.yml up --build -d
```

Hinweise:
- Für den öffentlichen Betrieb sollte `SESSION_SECRET` lang und zufällig gesetzt werden.
- `MANAGER_MODE_PASSWORD` muss für den Internetbetrieb zwingend durch ein starkes Passwort ersetzt werden.
- Die Datenbank wird im öffentlichen Setup nicht nach außen veröffentlicht.
- Das Frontend ist im öffentlichen Setup unter derselben Domain wie die API erreichbar; `/api` läuft intern über den Web-Container zum Backend.

## Wichtige Umgebungsvariablen

Root `.env` aus `.env.example` anlegen.

Wichtige Werte:
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`
- `FRONTEND_PORT`
- `VITE_API_BASE_URL`
- `BACKEND_HOST`
- `BACKEND_PORT`
- `BACKEND_INTERNAL_PORT`
- `DATABASE_URL`

## Umgebungsvariablen auf einem Debian-Server anpassen

Für lokale Tests ohne Docker legst du wie oben beschrieben `.env` an und startest Frontend/Backend mit `npm run dev`. Die gleichen Variablen greifen später auch in Docker Compose, sobald du `.env` oder `.env.public` als `--env-file` übergibst.

### Lokale Entwicklung ohne Docker

1. `cp .env.example .env`
2. Datei bearbeiten (`nano .env` oder Editor deiner Wahl) und mindestens folgende Werte setzen:
   - `POSTGRES_PASSWORD`
   - `DATABASE_URL=postgresql://postgres:<PASSWORD>@localhost:5432/werkstatt_kanban`
   - `VITE_API_BASE_URL=http://localhost:4000/api`
   - `BACKEND_HOST=0.0.0.0`
3. Backend/Frontend mit `npm run dev` starten – Vite und das Backend lesen die Variablen automatisch beim Start ein.

### Öffentlicher Betrieb auf Debian (Docker Compose)

1. `cp .env.public.example .env.public`
2. Datei bearbeiten und die produktiven Werte setzen (`POSTGRES_PASSWORD`, `SESSION_SECRET`, `MANAGER_MODE_PASSWORD`, `DATABASE_URL`, `VITE_API_BASE_URL=https://deine-domain/api`, `BACKEND_HOST=0.0.0.0`, `BACKEND_PORT=4000`, `PUBLIC_WEB_PORT=8080`, etc.).
3. Starten oder neu deployen:
   ```bash
   docker compose --env-file .env.public -f compose.public.yml up --build -d
   ```
4. Änderungen an `.env.public` greifen nach einem erneuten `docker compose up` automatisch, ein kompletter Server-Neustart ist nicht nötig.

Tipp: Auf Debian bleibt die `.env.public` im Projektordner. Bei Bedarf kannst du unterschiedliche Dateien für Staging/Produktion pflegen und sie einfach per `--env-file` übergeben.

## Lokaler Start ohne Docker

Falls nötig:

```bash
npm install
npm run dev
```

Der bevorzugte Startpfad für Entwicklung bleibt jedoch Docker Compose.

## Manuelle Prüfung

Nach dem Start:
1. Frontend unter `http://localhost:5173` öffnen.
2. Prüfen, ob Boards in der Seitenleiste sichtbar sind.
3. Ein Board öffnen.
4. Prüfen, ob Spalten und Karten geladen werden.
5. Eine Karte anlegen.
6. Eine Karte bearbeiten.
7. Eine Karte verschieben, archivieren und suchen.

Siehe auch:
- [`TESTCHECKLIST.md`](/c:/Users/maiks/Documents/Dev/Kanban/TESTCHECKLIST.md)
- [`requirements.md`](/c:/Users/maiks/Documents/Dev/Kanban/docs/kanban/requirements.md)
- [`design.md`](/c:/Users/maiks/Documents/Dev/Kanban/docs/kanban/design.md)
- [`tasks.md`](/c:/Users/maiks/Documents/Dev/Kanban/docs/kanban/tasks.md)
