# Tests (automatisch wiederholbar)

Voraussetzung: Node 20+, `npm i playwright-core`, Browser installieren: `npx playwright install webkit chromium-headless-shell`.

- `smoke.js`: kompletter Kundenweg im WebKit-Engine (iPhone-Profil): Cookie, Permalink, Bestellung, Rechnung, Widerruf, Admin-Tabs, Sicherung, Lagerbestand.
  Start: `B=https://deine-seite/ PW=pfad/zu/playwright-core node tests/smoke.js` (Demo-Admin-Zugang nötig).
- `security-anon-user.js`: Angriffe mit dem öffentlichen Schlüssel (alles außer Lesen der Produkte muss verweigert werden).
- `security-spam.js`: Spam und Riesen-Eingaben (max. 4 Anfragen pro Stunde und IP, Eingaben werden gekürzt und bereinigt).
- `security-orders.js`: Preis- und Statusmanipulation bei Bestellungen (muss serverseitig scheitern).
Nach jedem Lauf Testdaten in der Datenbank löschen (Bestellungen, Test-Konten, Spam-Zeilen).
