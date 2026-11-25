# Datenbank (Supabase)
Migrationen in Reihenfolge im SQL-Editor ausführen: 001_base, 002_security, 003_orders_admins, 004_storage_caps, 005_retouren_widerruf_errors_mfa.
Danach: Auth > Providers > Email: „Confirm email“ EINSCHALTEN (Produktivbetrieb) und eigenen SMTP-Server eintragen (Passwort-Reset, Bestellbestätigung).
Ersten Inhaber eintragen: Konto auf der Webseite registrieren, dann im SQL-Editor:
  insert into admins(email,user_id,role) select email,id,'owner' from auth.users where email='INHABER@EXAMPLE.DE';
Fehlende Spalten, die später ergänzt wurden (optionen, masse, pflege, lieferzeit, bestand, gewicht, samples/termine/neubezug/reviews) stehen in den Dateien 002 bis 005 bzw. in der Projekt-Historie.

## Zahlung (Stripe Checkout, Test- und Livemodus)
Edge Function `checkout` (Datei checkout.ts) erstellt die Stripe-Bezahlseite und bestätigt Zahlungen. Einrichtung:
1. Stripe-Konto erstellen, Secret-Key (Test: sk_test… / rk_test…) kopieren.
2. Supabase > Edge Functions > Secrets: `STRIPE_SECRET_KEY` eintragen.
3. Supabase > Edge Functions > Deploy: Funktion „checkout“ mit dem Inhalt von checkout.ts.
4. SQL: `grant usage on schema public to service_role; grant select, update on orders to service_role;`
5. Livebetrieb: Stripe-Konto verifizieren (Firmendaten, Bank), Live-Key statt Test-Key eintragen, Zahlungsarten (PayPal, Klarna, Apple Pay) im Stripe-Dashboard aktivieren.
Testkarte: 4242 4242 4242 4242, beliebiges Datum in der Zukunft, CVC 123.
