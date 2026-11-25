-- 002 Sicherheit: Eingabe-Prüfung, Ratenbegrenzung, serverseitige Bestellung, ID-basierte Admins
-- Ratenbegrenzung und Längenprüfung für öffentliche Formulare
alter table samples add column if not exists ip_hash text;
alter table termine add column if not exists ip_hash text;
alter table neubezug add column if not exists ip_hash text;
alter table visits add column if not exists ip_hash text;
alter table reviews add column if not exists ip_hash text;
alter table reviews add column if not exists user_id uuid default auth.uid();

create or replace function client_ip_hash() returns text language sql stable as $$
  select md5(coalesce(split_part((current_setting('request.headers', true)::json->>'x-forwarded-for'),',',1),'?')||'polster-salt')
$$;

create or replace function clean(t text, n int) returns text language sql immutable as $$
  select left(regexp_replace(coalesce(t,''),'[<>]','','g'), n)
$$;

create or replace function guard_insert() returns trigger language plpgsql security definer set search_path=public as $$
declare lim int; win interval; cnt int; h text;
begin
  h := client_ip_hash();
  if tg_table_name='termine' then lim:=4; win:='1 hour'; new.name:=clean(new.name,100); new.telefon:=clean(new.telefon,60); new.wunsch:=clean(new.wunsch,120); new.nachricht:=clean(new.nachricht,1500);
  elsif tg_table_name='samples' then lim:=6; win:='1 hour'; new.name:=clean(new.name,100); new.email:=clean(new.email,120); new.adresse:=clean(new.adresse,250); new.produkt:=clean(new.produkt,120); new.farbe:=clean(new.farbe,60);
  elsif tg_table_name='neubezug' then lim:=4; win:='1 hour'; new.name:=clean(new.name,100); new.telefon:=clean(new.telefon,60); new.typ:=clean(new.typ,60); new.stoff:=clean(new.stoff,60); new.masse:=clean(new.masse,100); new.schaetzung:=clean(new.schaetzung,60); new.nachricht:=clean(new.nachricht,1500);
    if jsonb_typeof(new.fotos)<>'array' or jsonb_array_length(new.fotos)>3 or length(new.fotos::text)>1200 then raise exception 'ungueltige Fotos'; end if;
  elsif tg_table_name='visits' then lim:=120; win:='10 minutes'; new.path:=clean(new.path,120);
  elsif tg_table_name='reviews' then lim:=6; win:='1 hour'; new.name:=clean(new.name,60); new.text:=clean(new.text,600);
    if new.user_id is null then raise exception 'Anmeldung erforderlich'; end if;
  end if;
  execute format('select count(*) from %I where ip_hash=$1 and %s > now()-$2', tg_table_name, case tg_table_name when 'visits' then 't' else 'created_at' end) into cnt using h, win;
  if cnt >= lim then raise exception 'Zu viele Anfragen, bitte später erneut versuchen.'; end if;
  new.ip_hash := h;
  return new;
end $$;
drop trigger if exists g_termine on termine; create trigger g_termine before insert on termine for each row execute function guard_insert();
drop trigger if exists g_samples on samples; create trigger g_samples before insert on samples for each row execute function guard_insert();
drop trigger if exists g_neubezug on neubezug; create trigger g_neubezug before insert on neubezug for each row execute function guard_insert();
drop trigger if exists g_visits on visits; create trigger g_visits before insert on visits for each row execute function guard_insert();
drop trigger if exists g_reviews on reviews; create trigger g_reviews before insert on reviews for each row execute function guard_insert();
