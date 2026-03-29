# Plan

## B. Fehlt noch

- [ ] Frontend zum Anlegen von Karten umsetzen  
  Es gibt aktuell keine Benutzeroberfläche, kein Formular und keinen vollständigen Nutzerfluss für `POST /api/cards`.

- [ ] Frontend zum Aktualisieren von Karten umsetzen  
  Es gibt zwar `PUT /api/cards/:cardId`, aber keine Bearbeitungsoberfläche im Frontend.

- [ ] Frontend zum Anlegen von Boards umsetzen  
  Es gibt `POST /api/boards`, aber keine passende UI oder Bedienlogik dafür.

- [ ] Formular Stack im Frontend ergänzen  
  Der im Zielstack genannte Formularbereich ist im Frontend praktisch noch nicht umgesetzt.  
  In `frontend/package.json` fehlen `react-hook-form` und `zod`.

- [ ] Frontend Validierung ergänzen  
  Im Frontend gibt es aktuell keine Formularvalidierung.

- [ ] Umsetzungs Checkliste in der Doku vervollständigen  
  `docs/kanban/tasks.md` ist aktuell leer und erfüllt seine Aufgabe noch nicht.

- [ ] Docker Compose vollständig automatisieren  
  `docker compose up` startet die Services, führt Migrationen und Seed aber nicht automatisch aus.  
  Für einen vollständig startklaren V1 Betrieb ist das noch zu manuell.

- [ ] Fachliche Regel zur Board Anlage durch Admins technisch absichern oder bewusst als Betriebsregel dokumentieren  
  Für Version 1 ist das ohne Login nachvollziehbar, aber es gibt aktuell keine Platzhalter Middleware und keine klar dokumentierte Betriebsregel im Codepfad.

## C. Teilweise vorhanden oder unklar

- [ ] Dokumentation konsistent machen  
  `docs/kanban/requirements.md` und `docs/kanban/design.md` sind inhaltlich brauchbar.  
  `docs/kanban/tasks.md` ist leer.  
  `README.md` hat fehlerhafte Zeichenkodierung und ist dadurch qualitativ eingeschränkt.

- [ ] Datenmodell und API Regeln angleichen  
  In `backend/prisma/schema.prisma` sind `partNumber`, `serialNumber`, `sapNumber` und `orderNumber` nullable.  
  In `backend/src/modules/cards/card.schemas.ts` sind diese Felder Pflichtfelder.  
  Fachlich sollen sie laut Anforderungen Pflichtfelder sein.

- [ ] Columns API bewerten und entweder umsetzen oder bewusst als Platzhalter kennzeichnen  
  `backend/src/routes/api/columns.ts` liefert aktuell nur `501`.

- [ ] Nutzerführung für Suche und Archiv bei leeren Treffern prüfen und verbessern  
  Funktional ist beides da, aber es gibt keine klare spezielle Rückmeldung wie „keine Treffer“.

- [ ] Dark Mode manuell auf Qualität prüfen  
  Die technische Grundlage ist da, aber die visuelle Güte ist noch nicht belastbar bewertet.

- [ ] Entscheidung zur Board Erstellung per UI in Version 1 treffen  
  Die Board Erstellung per API ist vorhanden, aber noch nicht final entschieden.

- [ ] Seed Verhalten bewusst dokumentieren oder anpassen  
  `backend/prisma/seed.ts` löscht aktuell vorab alle Daten und baut sie neu auf.  
  Für Entwicklung ist das okay, für internen Betrieb zumindest erwähnenswert.

## D. Technische Risiken oder Schwachstellen

- [ ] Fehlende Erfassungs und Bearbeitungsoberfläche für Karten schließen  
  Das Backend kann aktuell mehr als das Frontend anbietet.  
  Dadurch ist Version 1 fachlich noch nicht vollständig benutzbar.

- [ ] Zielstack und Ist Stand im Formularbereich angleichen  
  `react-hook-form` und `zod` werden im Frontend weder verwendet noch installiert.

- [ ] Pflichtfelder im Datenmodell strenger machen  
  Nullable Kartenfelder im Prisma Schema passen nicht sauber zu den fachlichen Pflichtfeldern.

- [ ] Docker Setup in Richtung „ein Befehl und alles steht“ verbessern  
  Migration und Seed müssen aktuell manuell angestoßen werden.

- [ ] README technisch und sprachlich bereinigen  
  In `README.md` sind Umlaute kaputt.  
  Das erhöht das Risiko für Missverständnisse bei Setup und Betrieb.

- [ ] Repository auf unnötige Build Artefakte und lokale Abhängigkeiten prüfen  
  `frontend/dist`, `backend/dist` und `frontend/node_modules` sind im Dateibaum sichtbar.

- [ ] Frontend Datenfluss entkoppeln, falls weitere Formulare dazukommen  
  `frontend/src/features/board-detail/useBoardDetail.ts` bündelt Laden, Suche, Archivierung und Drag and Drop.  
  Das ist aktuell noch okay, wird aber schnell zu voll.

- [ ] Spätere technische Absicherung der Admin Regel vorbereiten  
  Es gibt keine sichtbare Middleware, keinen Hook und keine klare Markierung im API Code für eine spätere Absicherung.

## E. Nächste sinnvolle Schritte

- [ ] Entscheidung zur Board Anlage treffen  
  Klären, ob die Board Anlage in Version 1 überhaupt eine Frontend Funktion sein soll oder bewusst nur über API und Seed erfolgt.

- [ ] Formularbasis im Frontend ergänzen  
  `react-hook-form` und `zod` installieren und eine einfache Formularstruktur vorbereiten.

- [ ] Karten im Frontend anlegen können  
  Das ist die größte funktionale Lücke gegenüber dem V1 Ziel.

- [ ] Karten im Frontend bearbeiten können  
  Die API ist vorhanden, der Nutzerfluss fehlt.

- [ ] Optional Board Anlage im Frontend ergänzen  
  Nur dann, wenn diese Funktion in Version 1 wirklich benötigt wird.

- [ ] Prisma Schema an fachliche Pflichtfelder anpassen  
  Entscheiden, ob die Kartenfelder in der Datenbank ebenfalls `non-null` sein sollen.

- [ ] Docker Startpfad für Entwicklung sauberer machen  
  Klar entscheiden, ob manuelle Migration und Seed bleiben oder der Start automatisiert wird.

- [ ] Dokumentation schließen  
  `docs/kanban/tasks.md` füllen und `README.md` inhaltlich sowie technisch bereinigen.

- [ ] Gezielte manuelle V1 Abnahme durchführen  
  Nach den offenen Punkten soll eine bewusste Endprüfung des tatsächlichen Nutzungsflusses erfolgen.

## F. Manuelle Prüfempfehlung

- [ ] Kernnutzung im Browser prüfen  
  Board öffnen  
  Karten sehen  
  Karte verschieben  
  Karte archivieren  
  Suche verwenden

- [ ] Bewusst prüfen, was aktuell nicht über die UI geht  
  Kann ich eine Karte anlegen?  
  Kann ich eine Karte bearbeiten?  
  Kann ich ein Board anlegen?

- [ ] Docker Betrieb frisch testen  
  `docker compose down -v`  
  `docker compose up --build -d`  
  Danach prüfen, ob ohne zusätzliche Kommandos schon alles benutzbar ist

- [ ] Datenqualität prüfen  
  Sind auf Karten wirklich alle Pflichtfelder gepflegt?  
  Verhalten sich Suche und Archivansicht bei leeren Treffern verständlich?

- [ ] Dokumentation gegen Realität prüfen  
  Stimmen `README.md` und die tatsächlichen Startschritte überein?  
  Ist die leere `docs/kanban/tasks.md` beabsichtigt oder ein Fehler?