# Kanban

## Projektüberblick

Interne Webanwendung als digitaler Ersatz für physische Kanban-Boards.

Aktueller Funktionsumfang:
- mehrere Gruppenboards innerhalb von T/AO425
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
- die Einheit T/AO425
- drei Boards: `Rotary`, `Linear`, `Stator`
- feste Beispielspalten
- Beispielkarten

Wenn bereits Daten für T/AO425 vorhanden sind, wird der Seed übersprungen und bestehende Daten bleiben erhalten.

## Standard-URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Health: `http://localhost:4000/health`

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

## Lokaler Start ohne Docker

Falls nötig:

```bash
npm install
npm run dev
```

Der bevorzugte Startpfad für Entwicklung bleibt jedoch Docker Compose.

## Manuelle Pr?fung

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
