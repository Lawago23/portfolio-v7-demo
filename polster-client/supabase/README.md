# Datenbank (Supabase)
Migrationen in Reihenfolge im SQL-Editor ausführen: 001_base, 002_security, 003_orders_admins, 004_storage_caps, 005_retouren_widerruf_errors_mfa.
Danach: Auth > Providers > Email: „Confirm email“ EINSCHALTEN (Produktivbetrieb) und eigenen SMTP-Server eintragen (Passwort-Reset, Bestellbestätigung).
Ersten Inhaber eintragen: Konto auf der Webseite registrieren, dann im SQL-Editor:
  insert into admins(email,user_id,role) select email,id,'owner' from auth.users where email='INHABER@EXAMPLE.DE';
Fehlende Spalten, die später ergänzt wurden (optionen, masse, pflege, lieferzeit, bestand, gewicht, samples/termine/neubezug/reviews) stehen in den Dateien 002 bis 005 bzw. in der Projekt-Historie.
