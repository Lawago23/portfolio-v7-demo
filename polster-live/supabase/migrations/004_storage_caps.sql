-- 004 Upload-Deckel für öffentliche Foto-Anfragen (max. 60 Dateien pro Stunde insgesamt)
drop policy if exists "anfragen insert" on storage.objects;
create policy "anfragen insert" on storage.objects for insert to anon, authenticated
 with check (bucket_id='anfragen' and (select count(*) from storage.objects o where o.bucket_id='anfragen' and o.created_at > now()-interval '1 hour') < 60);
