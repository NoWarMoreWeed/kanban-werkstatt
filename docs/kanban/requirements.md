# Kanban System Anforderungen

## Projektziel
Die Anwendung ersetzt physische Whiteboards in genau einer Werkstatt durch ein digitales Kanban System. Ziel ist eine einfache, wartbare Webanwendung, in der Gruppen ihre Auftraege und Geraete transparent verwalten, suchen, verschieben und archivieren koennen.

## Fachlicher Kontext
- Es gibt in Version 1 genau eine Werkstatt.
- Innerhalb dieser Werkstatt gibt es mehrere Gruppen, zum Beispiel `Rotary`, `Linear` und `Stator`.
- Jede Gruppe besitzt genau ein eigenes Board.
- Ein Board gehoert genau einer Gruppe.
- Karten repraesentieren Geraete oder Auftraege innerhalb eines Boards.
- Karten werden durch feste Spalten eines Boards bewegt.
- Abgeschlossene Karten werden archiviert, nicht geloescht.

## Zentrale Begriffe
- `Workshop`: Die eine Werkstatt, in der die Anwendung genutzt wird.
- `Group`: Fachliche Gruppe innerhalb der Werkstatt, zum Beispiel `Rotary`.
- `Board`: Kanban Board einer genau einen Gruppe.
- `Column`: Feste Spalte innerhalb eines Boards, zum Beispiel `Eingang` oder `In Arbeit`.
- `Card`: Arbeitseinheit auf einem Board. Repraesentiert ein Geraet oder einen Auftrag.
- `Archive`: Status einer Karte, die nicht mehr aktiv im Board angezeigt wird.

## Scope Version 1
Version 1 umfasst bewusst nur den schlanken Kern:

- Anzeige mehrerer Boards innerhalb einer Werkstatt
- Auswahl eines Boards ueber die Oberflaeche
- Anzeige von Spalten und Karten eines Boards
- Vorhandene Boards ueber Seed oder API bereitstellen
- Anlegen und Aktualisieren von Karten ueber Modal-Dialoge im Frontend
- Verschieben von Karten zwischen festen Spalten
- Archivieren von Karten
- Suche innerhalb eines Boards
- Betrieb per Docker Compose fuer lokale Entwicklung und internen Betrieb

## Nicht im Scope
Folgende Themen sind in Version 1 ausdruecklich nicht enthalten:

- Keine Login Funktion
- Keine technische Rollenlogik
- Keine Kommentarfunktion
- Keine UC Funktion
- Keine SAP oder Aspen Anbindung
- Keine Anhaenge
- Keine Mehrwerkstatt-Unterstuetzung
- Keine ueberladene Chefansicht
- Keine Loeschfunktion fuer Karten
- Keine erweiterten Reporting- oder Dashboard-Funktionen
- Keine Frontend-Funktion zum Anlegen neuer Boards

## Funktionale Anforderungen

### Werkstatt und Boards
- Es gibt genau eine Werkstatt.
- Alle Boards gehoeren zu dieser einen Werkstatt.
- Jede Gruppe hat genau ein Board.
- Pro Gruppe darf nur ein Board existieren.
- Neue Boards duerfen fachlich nur durch einen Admin angelegt werden.
- In Version 1 wird diese Admin-Regel noch nicht technisch per Login oder Rollenmodell abgesichert.
- In Version 1 gilt diese Regel organisatorisch: Board-Anlage ist nur fuer den administrativen Betrieb vorgesehen, auch wenn der API-Endpunkt technisch noch nicht authentifiziert ist.
- In Version 1 wird die Board-Anlage bewusst nicht ueber das Frontend angeboten.
- Boards werden in Version 1 ueber Seed-Daten bereitgestellt oder bei Bedarf gezielt ueber die API fuer administrative Zwecke angelegt.

### Spalten
- Jedes Board besitzt feste Spalten.
- Spalten sind pro Board eindeutig und sortierbar.
- Die Spaltenbezeichnungen sollen in Version 1 einfach austauschbar bleiben.
- Neutrale Startbezeichnungen sind ausreichend, zum Beispiel `Eingang`, `In Arbeit`, `Warten`, `Testing`, `Fertig`.

### Karten
- Karten gehoeren genau zu einem Board und genau zu einer Spalte.
- Karten koennen angelegt und aktualisiert werden.
- Neue Karten werden in Version 1 immer im aktuell geoeffneten Board in der Startspalte `Eingang` angelegt.
- Karten koennen zwischen Spalten verschoben werden.
- Karten werden nicht geloescht, sondern archiviert.
- Archivierte Karten sollen im aktiven Board nicht mehr sichtbar sein.
- Archivierte Karten sollen separat sichtbar und suchbar bleiben.
- Archivierte Karten sind in Version 1 nicht bearbeitbar.
- Das Bearbeiten bestehender Karten erfolgt in Version 1 ueber ein Drei-Punkte-Menue an aktiven Karten.

### Suche
- Die Suche erfolgt innerhalb des aktuell geoeffneten Boards.
- Teiltreffer muessen gefunden werden.
- Suchbar sind:
  - Geraetebezeichnung
  - P/N
  - S/N
  - SAP Nummer
  - Auftragsnummer
- Aktive und archivierte Karten muessen sinnvoll getrennt behandelbar sein.

## Nicht funktionale Anforderungen
- Schlanke, wartbare Architektur ohne unnoetige Vorwegnahmen spaeterer Features
- Klare Trennung zwischen Frontend, Backend und Datenhaltung
- Technisch saubere Validierung auf API-Ebene
- Gut verstaendliche, robuste Oberflaeche fuer PC-Nutzung in der Werkstatt
- Nachvollziehbare Docker-Umgebung fuer lokalen Start und internen Betrieb
- Such- und Board-Daten sollen fuer typische Werkstattgroessen schnell genug reagieren
- Lesbare Fehlerbehandlung fuer Benutzer und Entwickler
- Keine fachliche Komplexitaet durch vorbereitete Mehrwerkstatt- oder Fremdsystemlogik

## Daten pro Karte
Pro Karte sollen in Version 1 mindestens folgende Daten gespeichert werden:

- Name der anlegenden Person
- Aktuell zustaendige Person
- Geraetebezeichnung
- Prioritaet
- Eckende
- P/N
- S/N
- SAP Nummer
- Auftragsnummer
- Zugehoeriges Board
- Zugehoerige Spalte
- Archivstatus
- Positionsinformation innerhalb der Spalte
- Zeitstempel fuer Erstellung
- Zeitstempel fuer letzte Aenderung

## Grundannahmen
- Die Anwendung wird intern fuer genau eine Werkstatt betrieben.
- Die Nutzer kennen die Gruppen und deren Boards bereits fachlich.
- Spalten sind in Version 1 fest und nicht durch Endnutzer frei konfigurierbar.
- Karten werden archiviert, um die Historie zu erhalten.
- Die Admin-Regel fuer das Anlegen von Boards ist fachlich relevant, aber technisch erst spaeter voll absicherbar.
- Der bestehende Create-Board-Endpunkt ist in Version 1 als vorbereitete technische Schnittstelle zu verstehen, nicht als Frontend-Funktion und nicht als offene Selbstbedienungsfunktion fuer alle Nutzer.

## Offene Punkte
- Soll das Bearbeiten von Spaltenbezeichnungen bereits in Version 1 moeglich sein oder zunaechst nur technisch vorbereitet bleiben?
- Welche exakte Definition gilt fachlich fuer `fertig`, also ab wann eine Karte archiviert werden darf?
- Sollen archivierte Karten spaeter nach Zeitraum oder Anzahl zusaetzlich eingeschraenkt angezeigt werden?
- Soll spaeter eine Stammdatenlogik hinzukommen, die bei Eingabe der P/N eine bekannte Geraetebezeichnung vorbelegt?
