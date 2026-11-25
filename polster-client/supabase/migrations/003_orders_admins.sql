-- 003 Bestellung nur serverseitig (Preise kommen aus der Datenbank), Admins an Konto-ID gebunden, Lager, Gutscheine, Versand
alter table orders add column if not exists code text;
alter table orders add column if not exists rabatt numeric default 0;
alter table orders add column if not exists versand numeric default 0;
alter table orders add column if not exists telefon text;
alter table products add column if not exists bestand int;
alter table products add column if not exists gewicht numeric default 30;
create table if not exists codes(code text primary key, prozent int not null check(prozent between 1 and 90), min_wert numeric default 0, gueltig_bis date, aktiv boolean default true);
alter table codes enable row level security;
create policy "codes admin" on codes for all using (is_admin()) with check (is_admin());
grant select, insert, update, delete on codes to authenticated;
insert into codes values ('WILLKOMMEN10',10,300,null,true) on conflict do nothing;

create or replace function check_code(p_code text, p_sum numeric) returns int language sql stable security definer set search_path=public as $$
  select coalesce((select prozent from codes where upper(code)=upper(trim(p_code)) and aktiv and (gueltig_bis is null or gueltig_bis>=current_date) and p_sum>=min_wert),0)
$$;
grant execute on function check_code(text,numeric) to anon, authenticated;

create or replace function place_order(p_items jsonb, p_lv text, p_ort text, p_zh text, p_name text, p_tel text default '', p_code text default null) returns jsonb
language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); it jsonb; pr products%rowtype; q int; unit numeric; sum numeric:=0; wt numeric:=0; ship numeric:=0; rab numeric:=0; pct int; names jsonb:='[]'; oid text; total numeric; opt text; dg numeric; ds numeric; n int:=0; mail text:=auth.jwt()->>'email';
begin
  if uid is null then raise exception 'Anmeldung erforderlich'; end if;
  if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 or jsonb_array_length(p_items)>20 then raise exception 'Warenkorb ungueltig'; end if;
  if p_lv not in ('Lieferung','Abholung') or p_zh not in ('Karte','PayPal','Rechnung','Bar') then raise exception 'Angaben ungueltig'; end if;
  if (select count(*) from orders where user_id=uid and created_at>now()-interval '1 hour')>=5 then raise exception 'Zu viele Bestellungen, bitte spaeter erneut versuchen.'; end if;
  for it in select * from jsonb_array_elements(p_items) loop
    q := (it->>'q')::int; if q is null or q<1 or q>20 then raise exception 'Menge ungueltig'; end if;
    select * into pr from products where id=(it->>'id')::bigint; if not found then raise exception 'Produkt nicht gefunden'; end if;
    if pr.bestand is not null and pr.bestand<q then raise exception 'Nicht genug auf Lager: %', pr.name; end if;
    dg:=coalesce((select (x->>'d')::numeric from jsonb_array_elements(coalesce(pr.optionen->'groessen','[]')) x where x->>'n'=it->>'g' limit 1),0);
    ds:=coalesce((select (x->>'d')::numeric from jsonb_array_elements(coalesce(pr.optionen->'stoffe','[]')) x where x->>'n'=it->>'s' limit 1),0);
    unit:=coalesce(nullif(pr.aktion,0),pr.preis)+dg+ds; if unit<=0 then raise exception 'Preis ungueltig'; end if;
    sum:=sum+unit*q; wt:=wt+coalesce(pr.gewicht,30)*q;
    opt:=clean(concat_ws(' · ',nullif(left(it->>'c',40),''),nullif(left(it->>'g',40),''),nullif(left(it->>'s',40),'')),120);
    names:=names||jsonb_build_array(jsonb_build_object('n',pr.name||case when opt<>'' then ' ('||opt||')' else '' end,'q',q,'pr',unit));
    update products set bestand=bestand-q where id=pr.id and bestand is not null;
  end loop;
  if p_code is not null and trim(p_code)<>'' then pct:=check_code(p_code,sum); if pct>0 then rab:=round(sum*pct/100.0,2); end if; end if;
  if p_lv='Lieferung' then ship:=case when sum>=1500 then 0 when wt<30 then 29 when wt<80 then 49 else 79 end; end if;
  total:=sum-rab+ship;
  loop oid:='PH-'||lpad((floor(random()*900000)+100000)::text,6,'0'); begin
    insert into orders(id,user_id,email,name,items,total,lv,ort,zh,status,versand,rabatt,code,telefon) values(oid,uid,mail,clean(p_name,100),names,total,p_lv,clean(p_ort,250),p_zh,0,ship,rab,nullif(upper(trim(p_code)),''),clean(p_tel,60)); exit;
  exception when unique_violation then n:=n+1; if n>5 then raise; end if; end; end loop;
  return jsonb_build_object('id',oid,'total',total,'versand',ship,'rabatt',rab);
end $$;
grant execute on function place_order(jsonb,text,text,text,text,text,text) to authenticated;
drop policy if exists "own orders insert" on orders;
revoke insert on orders from authenticated;

-- Admins an Konto-ID binden (Registrierung mit fremder E-Mail reicht nicht mehr)
alter table admins add column if not exists user_id uuid;
update admins a set user_id=(select id from auth.users u where u.email=a.email) where user_id is null;
create or replace function is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from admins where user_id=auth.uid()) $$;
create or replace function is_owner() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from admins where user_id=auth.uid() and role='owner') $$;
drop policy if exists "owner write admins" on admins;
revoke insert, update, delete on admins from authenticated;
create or replace function add_admin(p_email text, p_role text) returns void language plpgsql security definer set search_path=public as $$
declare u uuid; begin
  if not is_owner() then raise exception 'Nur der Inhaber darf das'; end if;
  if p_role not in ('owner','staff') then raise exception 'Rolle ungueltig'; end if;
  select id into u from auth.users where lower(email)=lower(trim(p_email));
  if u is null then raise exception 'Diese Person muss sich zuerst auf der Webseite registrieren'; end if;
  insert into admins(email,user_id,role) values(lower(trim(p_email)),u,p_role) on conflict (email) do update set user_id=u, role=p_role;
end $$;
create or replace function remove_admin(p_email text) returns void language plpgsql security definer set search_path=public as $$
begin
  if not is_owner() then raise exception 'Nur der Inhaber darf das'; end if;
  if lower(trim(p_email))=lower(auth.jwt()->>'email') then raise exception 'Sie können sich nicht selbst entfernen'; end if;
  delete from admins where lower(email)=lower(trim(p_email));
end $$;
grant execute on function add_admin(text,text), remove_admin(text) to authenticated;
-- eine Bewertung pro Konto und Produkt
create unique index if not exists reviews_one_per_user on reviews(user_id, product_id) where user_id is not null;
