# Testcheckliste

## Vorbereitung

1. Datenbank läuft.
2. Migration wurde ausgeführt.
3. Seed wurde ausgeführt.
4. Frontend und Backend laufen.

## Board laden

1. Frontend öffnen.
2. Prüfen, ob in der Seitenleiste Boards geladen werden.
3. Ein Board öffnen.
4. Prüfen, ob Spalten sichtbar sind.
5. Prüfen, ob Karten in den Spalten sichtbar sind.

## Board anlegen

1. API-Endpunkt zum Anlegen eines Boards aufrufen.
2. Board mit neuer Gruppe anlegen.
3. Prüfen, ob das neue Board in `GET /api/boards` erscheint.
4. Versuch mit derselben Gruppe wiederholen.
5. Prüfen, ob der zweite Versuch sauber mit Konflikt fehlschlägt.

## Karte anlegen

1. API-Endpunkt zum Anlegen einer Karte aufrufen.
2. Gültige Pflichtfelder senden:
   Gerätebezeichnung, P/N, S/N, SAP Nummer, Auftragsnummer.
3. Prüfen, ob die Karte im richtigen Board und in der richtigen Spalte erscheint.

## Karte verschieben

1. Im aktiven Board eine Karte in eine andere Spalte ziehen.
2. Prüfen, ob die Karte direkt im UI verschoben wird.
3. Seite neu laden.
4. Prüfen, ob die neue Spalte gespeichert wurde.

## Karte archivieren

1. Im aktiven Board eine Karte archivieren.
2. Prüfen, ob sie aus der aktiven Ansicht verschwindet.
3. In die Archivansicht wechseln.
4. Prüfen, ob die Karte dort sichtbar ist.

## Karte suchen

1. Im aktiven Board nach einem Teilwert suchen:
   Gerätebezeichnung, P/N, S/N, SAP Nummer oder Auftragsnummer.
2. Prüfen, ob passende Treffer sichtbar sind.
3. In die Archivansicht wechseln.
4. Dort erneut suchen.
5. Prüfen, ob aktive und archivierte Karten getrennt behandelt werden.
