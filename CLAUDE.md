# maxxweb.cz – podklady pro Clauda

Web studia maxxweb (ELEOS s.r.o., IČO 01950398). Majitel komunikuje česky a často z mobilu – odpovídej česky, stručně, bez technického žargonu.

## Nasazení
- Statický web bez buildu: HTML soubory v kořeni + serverless funkce ve složce `api/` (Vercel).
- **Push do `main` = okamžité nasazení na https://www.maxxweb.cz** (Vercel projekt `maxxweb-s-projects/maxxweb`). Majitel dovolil změny nasazovat rovnou; před pushem změnu zkontroluj a po nasazení ověř živý web (`curl`).
- Commity piš za uživatele `maxxwebcz <maxxweb@outlook.cz>`.
- `CLAUDE.md` a `.claude/` se nenasazují (`.vercelignore`).

## Struktura
| Soubor | Co to je |
|---|---|
| `index.html` | Hlavní stránka (CZ/EN/PL přes slovník `i18n` v `<script>` – texty měň v HTML i ve všech jazycích) |
| `dotaznik.html` | Dotazník po kontaktním formuláři (kroky, historie prohlížeče) → `api/dotaznik.js` |
| `api/kontakt.js`, `api/dotaznik.js` | Maily z formulářů přes Resend z `onboarding@resend.dev` na `maxxweb@outlook.cz` (doména maxxweb.cz v Resendu není ověřená) |
| `odeslat.html` + `api/ukazka.js` | Heslem chráněné odesílání mailů „Ukázka naší práce“ / „Vánoční akce“ přes Seznam SMTP z office@maxxweb.cz. Šablony `api/_sablona-*.js` |
| `api/tydenni-souhrn.js` | Pondělní souhrn odeslaných ukázek podle prodejců (Vercel cron ve `vercel.json`) |
| `tvorba-webovych-stranek.html`, `web-pro-*.html`, `kolik-stoji-web.html`, `reference/*.html` | SEO podstránky, sdílí `seo.css` a `seo.js` |
| `menu.js` | Vysouvací menu na všech stránkách – při přidání stránky doplň `SECTIONS` |
| `sitemap.xml` | Při přidání stránky doplň |

Proměnné ve Vercelu (hodnoty nikdy nevypisuj): `RESEND_API_KEY`, `ODESILANI_HESLO`, `SEZNAM_SMTP_PASS`.

## Fakta, která musí sedět všude
- **Telefon: +420 604 419 420** (jediný). Číslo 604 339 385 už nikde nepoužívat.
- E-mail office@maxxweb.cz, web https://www.maxxweb.cz/
- Sídlo Čenětická 2413/1a, Praha 11 – jen jako firemní údaj. **Cílíme na celou ČR, nikdy jen na Prahu nebo jiné město.**
- Ceny webů: Základ od 19 900 Kč, Rozšířený od 39 900 Kč, Prémiový od 69 900 Kč, systém na míru od 150 000 Kč. SEO paušály 4 990 / 9 990 / 19 990 / 49 990 Kč měsíčně.
- Reference: evercleancar.cz (autodetailing Hodonín, rezervace + platby), destiny-barber.cz (barber shop Krnov).
- Telefon/ceny se objevují i v JSON-LD v `<head>` stránek a v šablonách mailů – při změně prohledej celý repozitář (`grep`).

## Pravidla
- Nevymýšlej čísla, recenze ani reference, které nejsou ověřené.
- Reklamní maily jen lidem, kteří dostali „Ukázku naší práce“ po telefonické domluvě; vždy s možností odhlášení.
- Firmy.cz: popis bez cen a bez opakování kontaktů; screenshot webu nesmí být úvodní fotka.
