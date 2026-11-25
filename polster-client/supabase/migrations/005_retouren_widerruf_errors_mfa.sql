-- 005 Retoure, elektronischer Widerruf (EU-Pflicht), Fehlerprotokoll, Herkunft der Besucher, 2FA-Pflicht für Admins mit aktivem 2FA
alter table visits add column if not exists source text;
create table if not exists retouren(id bigint generated always as identity primary key, order_id text not null, user_id uuid default auth.uid(), grund text, status text default 'offen', created_at timestamptz default now(), ip_hash text);
create table if not exists widerrufe(id bigint generated always as identity primary key, name text, email text, bestellnr text, hinweis text, created_at timestamptz default now(), ip_hash text);
create table if not exists errors(id bigint generated always as identity primary key, created_at timestamptz default now(), page text, msg text, ua text, ip_hash text);
alter table retouren enable row level security; alter table widerrufe enable row level security; alter table errors enable row level security;
create policy "retouren own insert" on retouren for insert to authenticated with check (user_id=auth.uid() and exists(select 1 from orders o where o.id=order_id and o.user_id=auth.uid()));
create policy "retouren own read" on retouren for select to authenticated using (user_id=auth.uid() or is_admin());
create policy "retouren admin update" on retouren for update to authenticated using (is_admin()) with check (is_admin());
create policy "widerruf insert" on widerrufe for insert with check (true);
create policy "widerruf admin read" on widerrufe for select using (is_admin());
create policy "errors insert" on errors for insert with check (true);
create policy "errors admin read" on errors for select using (is_admin());
create policy "errors admin delete" on errors for delete using (is_admin());
grant insert, select, update on retouren to authenticated;
grant insert on widerrufe, errors to anon, authenticated; grant select on widerrufe to authenticated; grant select, delete on errors to authenticated;

create or replace function guard_insert() returns trigger language plpgsql security definer set search_path=public as $$
declare lim int; win interval; cnt int; h text; col text:='created_at';
begin
  h := client_ip_hash();
  if tg_table_name='termine' then lim:=4; win:='1 hour'; new.name:=clean(new.name,100); new.telefon:=clean(new.telefon,60); new.wunsch:=clean(new.wunsch,120); new.nachricht:=clean(new.nachricht,1500);
  elsif tg_table_name='samples' then lim:=6; win:='1 hour'; new.name:=clean(new.name,100); new.email:=clean(new.email,120); new.adresse:=clean(new.adresse,250); new.produkt:=clean(new.produkt,120); new.farbe:=clean(new.farbe,60);
  elsif tg_table_name='neubezug' then lim:=4; win:='1 hour'; new.name:=clean(new.name,100); new.telefon:=clean(new.telefon,60); new.typ:=clean(new.typ,60); new.stoff:=clean(new.stoff,60); new.masse:=clean(new.masse,100); new.schaetzung:=clean(new.schaetzung,60); new.nachricht:=clean(new.nachricht,1500);
    if jsonb_typeof(new.fotos)<>'array' or jsonb_array_length(new.fotos)>3 or length(new.fotos::text)>1200 then raise exception 'ungueltige Fotos'; end if;
  elsif tg_table_name='visits' then lim:=120; win:='10 minutes'; col:='t'; new.path:=clean(new.path,120); new.source:=clean(new.source,80);
  elsif tg_table_name='reviews' then lim:=6; win:='1 hour'; new.name:=clean(new.name,60); new.text:=clean(new.text,600);
    if new.user_id is null then raise exception 'Anmeldung erforderlich'; end if;
  elsif tg_table_name='retouren' then lim:=5; win:='1 hour'; new.grund:=clean(new.grund,600); new.status:='offen';
  elsif tg_table_name='widerrufe' then lim:=5; win:='1 hour'; new.name:=clean(new.name,100); new.email:=clean(new.email,120); new.bestellnr:=clean(new.bestellnr,40); new.hinweis:=clean(new.hinweis,600);
  elsif tg_table_name='errors' then lim:=15; win:='10 minutes'; new.page:=clean(new.page,150); new.msg:=clean(new.msg,400); new.ua:=clean(new.ua,160);
  end if;
  execute format('select count(*) from %I where ip_hash=$1 and %I > now()-$2', tg_table_name, col) into cnt using h, win;
  if cnt >= lim then raise exception 'Zu viele Anfragen, bitte später erneut versuchen.'; end if;
  new.ip_hash := h;
  return new;
end $$;
drop trigger if exists g_retouren on retouren; create trigger g_retouren before insert on retouren for each row execute function guard_insert();
drop trigger if exists g_widerrufe on widerrufe; create trigger g_widerrufe before insert on widerrufe for each row execute function guard_insert();
drop trigger if exists g_errors on errors; create trigger g_errors before insert on errors for each row execute function guard_insert();

-- 2FA: wenn ein Admin einen bestätigten zweiten Faktor hat, gelten Admin-Rechte nur nach Code-Eingabe (aal2)
create or replace function has_mfa() returns boolean language sql stable security definer set search_path=public,auth as $$ select exists(select 1 from auth.mfa_factors where user_id=auth.uid() and status='verified') $$;
create or replace function is_admin() returns boolean language sql stable security definer set search_path=public,auth as $$ select exists(select 1 from admins where user_id=auth.uid()) and (not has_mfa() or coalesce(auth.jwt()->>'aal','')='aal2') $$;
create or replace function is_owner() returns boolean language sql stable security definer set search_path=public,auth as $$ select exists(select 1 from admins where user_id=auth.uid() and role='owner') and (not has_mfa() or coalesce(auth.jwt()->>'aal','')='aal2') $$;
