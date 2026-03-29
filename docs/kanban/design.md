# Kanban System Design

## Zielbild der Architektur
Die Anwendung ist als schlanke Fullstack-Webanwendung fuer genau eine Werkstatt aufgebaut.

- `Frontend`: React, TypeScript, Vite, Tailwind CSS
- `Backend`: Node.js, Express, TypeScript
- `Datenbank`: PostgreSQL
- `ORM`: Prisma
- `Betrieb`: Docker Compose mit getrennten Services fuer Frontend, Backend und Datenbank

Das Zielbild fuer Version 1 ist eine einfache, klar trennbare Architektur:
- Das Frontend rendert Boards, Spalten und Karten und spricht ausschliesslich ueber HTTP mit dem Backend.
- Das Backend kapselt Validierung, API, Fachregeln und Datenzugriff.
- PostgreSQL speichert den fachlichen Zustand.
- Prisma bildet das Datenmodell und die Migrationen ab.

## Frontend Aufbau

### Ziele
- Einfache PC-taugliche Werkstattoberflaeche
- Klare Navigation zwischen Boards
- Stabile Kartenanzeige und Suchlogik
- Drag and Drop nur fuer Karten
- Karten anlegen und bearbeiten ueber schlanke Modal-Dialoge

### Struktur
- `app`: Einstieg, Routing, globale Provider
- `components`: wiederverwendbare UI- und Layout-Bausteine
- `features`: fachnahe Frontend-Logik je Bereich
- `pages`: Seiten fuer Board-Uebersicht und Board-Detail
- `lib`: API-Hilfen und Formularbasis
- `types`: API- und View-Modelle
- `styles`: globale Styles

### Routing
- `/`: Board-Uebersicht
- `/boards/:boardId`: Einzelnes Board

### Bewusste Abgrenzung fuer Version 1
- Die Frontend-Oberflaeche bietet keine Funktion zum Anlegen neuer Boards.
- Boards werden fuer Version 1 ueber Seed-Daten bereitgestellt oder bei Bedarf ausserhalb der normalen Nutzeroberflaeche per API angelegt.
- Damit bleibt die Oberflaeche schlank und auf die taegliche Arbeit mit bestehenden Boards fokussiert.

## Backend Aufbau

### Ziele
- Klare technische Trennung
- Schlanke API-Struktur nach Fachbereichen
- Zentrale Fehlerbehandlung
- Saubere Validierung pro Endpunkt

### Struktur
- `config`: Umgebungsvariablen und Konstanten
- `errors`: gemeinsame Fehlerklassen
- `lib`: technische Adapter wie Prisma Client
- `middleware`: Fehlerbehandlung, Validierung, Async-Handling
- `modules/boards`: Boardschemas, Service, Controller
- `modules/cards`: Cardschemas, Service, Controller
- `routes`: API-Grundstruktur und Routing

## Datenbank und Relationen

### Grundmodell
- Eine `Workshop`
- Mehrere `Board`
- Mehrere `Column` pro `Board`
- Mehrere `Card` pro `Board`

### Relationen
- `Workshop 1:n Board`
- `Board 1:n Column`
- `Board 1:n Card`
- `Column 1:n Card`

### Wichtige fachliche Regeln im Modell
- Ein Board gehoert genau einer Werkstatt
- Ein Board gehoert genau einer Gruppe
- Eine Gruppe hat genau ein Board
- Eine Spalte gehoert genau zu einem Board
- Eine Karte gehoert genau zu einem Board und genau zu einer Spalte

## Vorschlag fuer zentrale Modelle

### Workshop
- `id`
- `name`
- `createdAt`
- `updatedAt`

### Board
- `id`
- `workshopId`
- `groupName`
- `title`
- `createdAt`
- `updatedAt`

### Column
- `id`
- `boardId`
- `key`
- `title`
- `position`
- `createdAt`
- `updatedAt`

### Card
- `id`
- `boardId`
- `columnId`
- `archiveStatus`
- `position`
- `creatorName`
- `responsibleName`
- `deviceName`
- `priority`
- `dueDate`
- `partNumber`
- `serialNumber`
- `sapNumber`
- `orderNumber`
- `createdAt`
- `updatedAt`

Hinweis zum aktuellen Projektstand:
- Im Prisma-Modell sind `partNumber`, `serialNumber`, `sapNumber` und `orderNumber` derzeit noch nullable modelliert.
- Die Backend- und Frontend-Validierung behandelt diese Felder in Version 1 bereits als Pflichtfelder.
- Diese Inkonsistenz ist ein bewusst offener Punkt und in der Aufgabenliste markiert.

## API Grundstruktur

### Technische Basis
- `GET /health`

### Boards
- `GET /api/boards`
- `GET /api/boards/:boardId`
- `POST /api/boards`

Hinweis fuer Version 1:
- `POST /api/boards` bleibt als technische Schnittstelle erhalten.
- Der Endpunkt ist fuer administrative Nutzung ausserhalb der normalen Frontend-Oberflaeche gedacht.
- Eine Frontend-Maske fuer Board-Anlage ist nicht Bestandteil von Version 1.

### Cards
- `GET /api/boards/:boardId/cards`
- `POST /api/cards`
- `PUT /api/cards/:cardId`
- `PATCH /api/cards/:cardId/move`
- `PATCH /api/cards/:cardId/archive`
- `GET /api/cards/search`

### API-Prinzipien
- JSON als Standardformat
- Zentrale Fehlerantworten
- Validierung vor Fachlogik
- Keine versteckte Fachlogik im Routing

## Validierungskonzept
- Zod validiert Request-Parameter, Querys und Bodies
- React Hook Form und Zod validieren Formulare im Frontend
- Backend validiert immer unabhaengig vom Frontend
- Fehlende Pflichtfelder oder ungueltige IDs liefern klare 4xx-Fehler

Pflichtfelder fuer Karten in Frontend und Backend:
- `creatorName`
- `responsibleName`
- `deviceName`
- `priority`
- `dueDate`
- `partNumber`
- `serialNumber`
- `sapNumber`
- `orderNumber`

Frontend-Formularstruktur in Version 1:
- wiederverwendbare Zod-Schemas fuer Karten und Boards
- gemeinsame Formular-Helfer unter `frontend/src/lib/forms`
- Karten anlegen und bearbeiten ueber `react-hook-form` und `zod`

## Suche

### Ziel
Einfache, robuste Volltext-nahe Suche innerhalb eines einzelnen Boards.

### Suchfelder
- `deviceName`
- `partNumber`
- `serialNumber`
- `sapNumber`
- `orderNumber`

### Verhalten
- Teiltreffer
- Case-insensitive Suche
- Filter auf genau ein Board
- Archivierte Karten wahlweise:
  - ausschliessen
  - nur archivierte zeigen
  - beide einschliessen

### Technische Umsetzung Version 1
- Ein einfacher API-Endpunkt mit Query-Parametern
- Kein erweitertes Filtersystem
- Indizes auf den relevanten Such- und Beziehungsfeldern

## Archivlogik
- Karten werden nicht geloescht.
- Archivierung wird als Status auf der Karte gespeichert.
- Aktive Boards zeigen standardmaessig nur aktive Karten.
- Archivierte Karten bleiben suchbar und separat abrufbar.
- Archivierte Karten koennen in Version 1 nicht bearbeitet werden.
- Eine Wiederherstellung aus dem Archiv ist nicht Bestandteil von Version 1.

## Docker Aufbau

### Services
- `backend-init`
- `frontend`
- `backend`
- `database`

### Zusammenspiel
- `database` startet zuerst und liefert PostgreSQL.
- `backend-init` fuehrt Migrationen und Seed einmalig aus, sobald die Datenbank gesund ist.
- `backend` startet erst nach erfolgreicher Initialisierung.
- `frontend` startet erst, wenn das Backend gesund ist.
- `database` speichert persistente PostgreSQL-Daten in einem Volume.

### Ziele
- Lokal einheitlicher Start per `docker compose up --build`
- Moeglichst keine manuellen Zusatzschritte beim ersten Entwicklungsstart
- Keine produktive Deployment-Logik in Version 1
- Kein Reverse Proxy
- Kein NGINX

## Vorschlag fuer Ordnerstruktur

```text
frontend/
  src/
    app/
    components/
    features/
    lib/
    pages/
    styles/
    types/

backend/
  prisma/
    migrations/
    schema.prisma
    seed.ts
  src/
    config/
    errors/
    lib/
    middleware/
    modules/
      boards/
      cards/
    routes/

docs/
  kanban/
```

## Technische Entscheidungen
- `React + Vite`: schneller Frontend-Start, einfache TypeScript-Integration
- `Express`: schlanke, gut kontrollierbare API fuer Version 1
- `Prisma`: klare Modellierung, Migrationen und Typsicherheit
- `PostgreSQL`: stabile relationale Datenbasis
- `Tailwind CSS`: schneller, konsistenter Aufbau funktionaler Oberflaechen
- `dnd kit`: gut geeignete Bibliothek fuer Kartenverschiebung im Board
- `React Hook Form + Zod`: saubere Formularlogik und robuste Validierung
- `Docker Compose`: einfacher lokaler Betrieb mit klar getrennten Services und automatisiertem Initialisierungspfad

## Spaetere Erweiterungsmoeglichkeiten
Die folgenden Punkte gehoeren nicht zu Version 1, sind aber spaeter moeglich:

- Login und technische Rollenlogik
- abgesicherte Admin-Funktionen
- Kommentare auf Karten
- Wiederherstellung archivierter Karten
- Spaltenkonfiguration ueber die UI
- Auswertungen oder Reporting
- Fremdsystem-Anbindungen wie SAP oder Aspen
- Stammdatenlogik fuer Vorbelegung der Geraetebezeichnung anhand der P/N

Wichtig:
- Diese Erweiterungen sollen Version 1 nicht vorab komplizierter machen.
- Version 1 bleibt bewusst auf einen Werkstattstandort und den Kernprozess begrenzt.
