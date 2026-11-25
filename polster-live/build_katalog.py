#!/usr/bin/env python3
"""Erzeugt katalog.html (statische Produktliste für Suchmaschinen) und sitemap.xml aus der Datenbank.
Nach größeren Katalogänderungen ausführen: python3 build_katalog.py"""
import json,urllib.request,html,sys
URL='https://jthmekehipiolsxtjavb.supabase.co';KEY='sb_publishable__YUQh9Vgtda2nPwyxn-hTw_oMXZDe5-'
BASE=sys.argv[1] if len(sys.argv)>1 else 'https://lawago23.github.io/portfolio-v7-demo/polster-live/'
req=urllib.request.Request(URL+'/rest/v1/products?select=*&order=id',headers={'apikey':KEY})
P=json.load(urllib.request.urlopen(req))
e=html.escape
items=''.join(f'<article><h2><a href="index.html?p={p["id"]}">{e(p["name"])}</a></h2><p>{e(p.get("kat") or "")} · {e(str(p.get("aktion") or p["preis"]))} €</p><p>{e(p.get("beschr") or "")}</p><p>Material: {e(p.get("material") or "")}. Maße: {e(p.get("masse") or "")}.</p></article>' for p in P)
ld=json.dumps([{"@context":"https://schema.org","@type":"Product","name":p["name"],"description":p.get("beschr") or "","offers":{"@type":"Offer","priceCurrency":"EUR","price":str(p.get("aktion") or p["preis"]),"availability":"https://schema.org/InStock","url":BASE+"index.html?p=%d"%p["id"]}} for p in P],ensure_ascii=False)
open('katalog.html','w').write(f'<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Katalog – Polstermöbel</title><meta name="description" content="Alle Möbel im Überblick: Sofas, Ecksofas, Sessel und Betten."><link rel="icon" href="data:,"><link rel="stylesheet" href="style.css?v=33"><script type="application/ld+json">{ld}</script></head><body><main class="wrap" style="max-width:820px;padding:30px 20px"><p><a href="index.html">← zum Shop</a></p><h1>Katalog</h1>{items}</main></body></html>')
urls=[BASE,BASE+'katalog.html',BASE+'ratgeber.html',BASE+'versand.html']+[BASE+'index.html?p=%d'%p['id'] for p in P]
open('sitemap.xml','w').write('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join(f'<url><loc>{e(u)}</loc></url>' for u in urls)+'</urlset>')
print(len(P),'Produkte')
