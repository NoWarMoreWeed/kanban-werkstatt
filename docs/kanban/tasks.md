# Kanban System V1 Aufgaben

## Nutzung dieser Checkliste
- `[x]` bedeutet: im aktuellen Projektstand bereits umgesetzt.
- `[ ]` bedeutet: fuer Version 1 noch offen.
- Jede Aufgabe nennt kurz Zweck, Ergebnis und Abhaengigkeiten.
- Die Reihenfolge folgt dem sinnvollen Weg von Grundlagen ueber Kernfunktionen bis zur Abnahme.

## Phase 1: Grundlagen und Betriebsfaehigkeit

### [x] Projektgeruest als Fullstack-Anwendung
- Zweck: Technische Basis fuer Frontend, Backend und gemeinsame Entwicklung schaffen.
- Ergebnis: React/Vite-Frontend, Express/TypeScript-Backend, Prisma-Vorbereitung und Workspace-Struktur vorhanden.
- Abhaengigkeiten: Keine.

### [x] Datenmodell in Prisma definieren
- Zweck: Fachliche Kernobjekte und Relationen sauber in der Datenbank modellieren.
- Ergebnis: `Workshop`, `Board`, `Column`, `Card` und `CardArchiveStatus` sind im Prisma Schema angelegt.
- Abhaengigkeiten: Projektgeruest.

### [x] Migration und Seed anlegen
- Zweck: Datenbankstruktur und Beispieldaten fuer Entwicklung und Tests bereitstellen.
- Ergebnis: Migrationen sowie Seed fuer eine Werkstatt, drei Boards, feste Spalten und Beispielkarten sind vorhanden.
- Abhaengigkeiten: Datenmodell in Prisma definieren.

### [x] Backend-Basis aufbauen
- Zweck: Laufzeit, Routing, Validierung und Fehlerbehandlung technisch sauber vorbereiten.
- Ergebnis: Express-App, Health Route, zentrale Fehlerbehandlung, Env-Konfiguration und Prisma-Anbindung sind vorhanden.
- Abhaengigkeiten: Projektgeruest, Datenmodell in Prisma definieren.

### [x] Docker-Basis fuer lokale Entwicklung bereitstellen
- Zweck: Frontend, Backend und PostgreSQL konsistent per Docker Compose betreiben.
- Ergebnis: Dockerfiles fuer Frontend und Backend sowie `compose.yml` mit PostgreSQL-Volume sind vorhanden.
- Abhaengigkeiten: Projektgeruest, Backend-Basis aufbauen.

### [x] Docker-Startpfad fuer Erstinbetriebnahme vereinfachen
- Zweck: Den ersten Start fuer Entwickler und Testbetrieb robuster und eindeutiger machen.
- Ergebnis: `backend-init` fuehrt beim Compose-Start Migrationen und Seed automatisch aus, bevor das Backend startet.
- Abhaengigkeiten: Docker-Basis fuer lokale Entwicklung bereitstellen, Migration und Seed anlegen.

## Phase 2: Backend-Kernfunktionen

### [x] Board-API implementieren
- Zweck: Boards fachlich korrekt abrufen und anlegen koennen.
- Ergebnis: Endpunkte fuer Board-Liste, Board-Detail und Board-Erstellung mit Schutz gegen doppelte Gruppenboards sind vorhanden.
- Abhaengigkeiten: Backend-Basis aufbauen, Datenmodell in Prisma definieren.

### [x] Card-API implementieren
- Zweck: Karten anlegen, aendern, verschieben, archivieren und abrufen koennen.
- Ergebnis: Endpunkte fuer Create, Update, Move, Archive und List sind vorhanden.
- Abhaengigkeiten: Backend-Basis aufbauen, Board-API implementieren.

### [x] Suche im Backend bereitstellen
- Zweck: Karten innerhalb eines Boards ueber die relevanten Felder durchsuchen koennen.
- Ergebnis: Suchendpunkt fuer `deviceName`, `partNumber`, `serialNumber`, `sapNumber` und `orderNumber` ist vorhanden.
- Abhaengigkeiten: Card-API implementieren.

### [ ] Datenmodell und Backend-Validierung fuer Kartenfelder abschliessen
- Zweck: Fachliche Pflichtfelder in Datenbankmodell und API-Regeln konsistent halten.
- Ergebnis: Entscheidung und technische Angleichung, ob `partNumber`, `serialNumber`, `sapNumber` und `orderNumber` im Prisma-Modell ebenfalls durchgaengig als Pflichtfelder gespeichert werden.
- Abhaengigkeiten: Datenmodell in Prisma definieren, Card-API implementieren.

### [x] Entscheidung zu Board-Erstellung in Version 1 festhalten
- Zweck: Klar festlegen, ob Boards in V1 nur ueber API/Seed oder auch ueber die UI angelegt werden.
- Ergebnis: Dokumentiert ist, dass Board-Anlage in Version 1 bewusst nicht ueber das Frontend angeboten wird und stattdessen ueber Seed oder API fuer administrative Zwecke erfolgt.
- Abhaengigkeiten: Board-API implementieren.

## Phase 3: Frontend-Anzeige und Interaktion

### [x] Frontend-Grundlayout erstellen
- Zweck: Eine klare Werkstattoberflaeche mit Navigation und Hauptbereich bereitstellen.
- Ergebnis: Seitenleiste, Hauptlayout und Routing fuer Uebersicht und Board-Detail sind vorhanden.
- Abhaengigkeiten: Projektgeruest als Fullstack-Anwendung.

### [x] Board-Anzeige mit echten Daten anbinden
- Zweck: Boards, Spalten und Karten aus dem Backend im Frontend sichtbar machen.
- Ergebnis: Seitenleiste und Board-Ansicht laden echte API-Daten und stellen sie im Layout dar.
- Abhaengigkeiten: Frontend-Grundlayout erstellen, Board-API implementieren, Card-API implementieren.

### [x] Drag and Drop fuer Karten umsetzen
- Zweck: Karten direkt im Board zwischen Spalten verschieben koennen.
- Ergebnis: Karten lassen sich mit `dnd-kit` verschieben und die Aenderung wird im Backend gespeichert.
- Abhaengigkeiten: Board-Anzeige mit echten Daten anbinden, Card-API implementieren.

### [x] Archivfunktion im Frontend anbinden
- Zweck: Abgeschlossene Karten aus dem aktiven Board auslagern und getrennt anzeigen.
- Ergebnis: Archivieren ueber die UI sowie Umschalten zwischen aktiver Sicht und Archivsicht ist vorhanden.
- Abhaengigkeiten: Card-API implementieren, Board-Anzeige mit echten Daten anbinden.

### [x] Suche im Frontend anbinden
- Zweck: Karten direkt im aktuell geoeffneten Board schnell finden koennen.
- Ergebnis: Suchleiste mit API-Anbindung und Trennung zwischen aktiven und archivierten Treffern ist vorhanden.
- Abhaengigkeiten: Suche im Backend bereitstellen, Board-Anzeige mit echten Daten anbinden.

### [x] Formularbasis und Frontend-Validierung vorbereiten
- Zweck: Eine wiederverwendbare Grundlage fuer spaetere Board- und Kartenformulare schaffen.
- Ergebnis: `react-hook-form`, `zod`, Resolver-Anbindung sowie wiederverwendbare Frontend-Schemas fuer Board- und Kartenformulare sind vorhanden.
- Abhaengigkeiten: Frontend-Grundlayout erstellen.

### [x] Kartenformular zum Anlegen einer Karte bauen
- Zweck: Neue Karten ueber die Oberflaeche erfassen koennen.
- Ergebnis: Modal fuer Kartenanlage mit Frontend-Validierung, API-Anbindung und automatischer Anlage in der Startspalte `Eingang` ist vorhanden.
- Abhaengigkeiten: Formularbasis und Frontend-Validierung vorbereiten, Card-API implementieren, Board-Anzeige mit echten Daten anbinden.

### [x] Kartenformular zum Bearbeiten einer Karte bauen
- Zweck: Karteninhalte im laufenden Boardbetrieb anpassen koennen.
- Ergebnis: Bearbeiten ist ueber das Drei-Punkte-Menue aktiver Karten erreichbar und oeffnet ein vorausgefuelltes Modal mit Update-Endpunkt.
- Abhaengigkeiten: Formularbasis und Frontend-Validierung vorbereiten, Card-API implementieren, Board-Anzeige mit echten Daten anbinden.

### [ ] Boardformular zum Anlegen eines Boards bauen
- Zweck: Neue Gruppenboards spaeter bei Bedarf ueber die Oberflaeche anlegen koennen.
- Ergebnis: Nicht Teil von Version 1. Die Aufgabe bleibt bewusst fuer spaetere Ausbaustufen zurueckgestellt.
- Abhaengigkeiten: Entscheidung zu Board-Erstellung in Version 1 festhalten, Formularbasis und Frontend-Validierung vorbereiten, Board-API implementieren.

## Phase 4: Abschluss fuer Version 1

### [ ] Leere und fehlerhafte Benutzerpfade gezielt absichern
- Zweck: Die Anwendung fuer typische Werkstattnutzung robuster und klarer machen.
- Ergebnis: Saubere Nutzerfuehrung fuer leere Listen, leere Suchtreffer, API-Fehler und Formularfehler.
- Abhaengigkeiten: Frontend-Kernfunktionen der Phase 3.

### [x] Projektdokumentation vervollstaendigen
- Zweck: Anforderungen, Design, Start und Bedienung nachvollziehbar dokumentieren.
- Ergebnis: `README` und `docs/kanban` sind konsistent, vollstaendig und auf dem echten Projektstand.
- Abhaengigkeiten: Docker-Basis fuer lokale Entwicklung bereitstellen, Frontend- und Backend-Kernfunktionen.

### [ ] Manuelle V1-Abnahme durchfuehren
- Zweck: Den fertigen Funktionsumfang gegen den Zielumfang von Version 1 pruefen.
- Ergebnis: Durchgefuehrte Testschritte fuer Board-Laden, Karte-Anlegen, Karte-Bearbeiten, Karte-Verschieben, Karte-Archivieren und Suche.
- Abhaengigkeiten: Alle fuer Version 1 benoetigten offenen Aufgaben abschliessen.

## V1 Fokus
- Keine Login-Funktion
- Keine technische Rollenlogik
- Keine Kommentarfunktion
- Keine UC-Funktion
- Keine SAP- oder Aspen-Anbindung
- Keine Anhaenge
- Keine Mehrwerkstatt-Unterstuetzung
- Keine zusaetzlichen Management- oder Reporting-Ansichten
