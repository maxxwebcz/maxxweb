import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const maps = {
  typPodnikani: { remeslnik:'Řemeslník', sluzby:'Služby', krasa:'Krása & wellness', gastro:'Gastronomie', eshop:'E-shop / obchod', jine:'Jiné' },
  praktickeInfo: { adresa:'Adresa/region', oteviraci:'Otevírací doba', rozvoz:'Doručení/rozvoz', socialni:'Sociální sítě', cenik_info:'Ceník', objednavky:'Objednávky předem' },
  webFunkce: { kontakt_form:'Kontaktní formulář', galerie:'Galerie fotek', mapa:'Mapa', eshop_funkce:'E-shop', rezervace:'Rezervační systém', recenze:'Recenze zákazníků', instagram_link:'Instagram', chat:'Chat/WhatsApp' },
  styl: { luxusni:'Luxusní a elegantní', hravy:'Hravý a milý', utulny:'Útulný a domácí', moderni_styl:'Moderní a dynamický', prirodni:'Přírodní a čistý', minimalisticky:'Minimalistický' },
  barvy: { cervena:'Červená & černá', modra:'Modrá & bílá', zelena:'Zelená & světlá', bila:'Černobílá', tepla:'Teplá & zlatá', fialova:'Fialová' },
  logoFotky: { mam_logo:'Mám logo', nemam_logo:'Nemám logo', mam_fotky:'Mám fotky', nemam_fotky:'Nemám fotky' },
  zakaznik: { maminky:'Maminky s dětmi', studenti:'Studenti a mladí lidé', firmy:'Firmy a podniky', '30_50':'Lidé 30–50 let', zdravi:'Zdravě žijící lidé', vsichni:'Všichni' },
  termin: { 'co-nejdrive':'Co nejdříve', mesic:'Do měsíce', '2mesice':'Do 2 měsíců', neresi:'Termín neřeším' },
  rozpocet: { basic:'Basic', business:'Business', premium:'Premium', nevim:'Ještě nevím' },
};

const mapArr = (arr, map) => arr && arr.length ? arr.map(v => map[v] || v).join(', ') : '—';
const mapVal = (val, map) => (val && map[val]) ? map[val] : (val || '—');

function row(label, value) {
  const v = value || '—';
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #333;color:#aaa;width:180px;vertical-align:top;font-size:14px">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid #333;font-weight:600;font-size:14px">${v}</td>
  </tr>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const d = req.body;

  try {
    await resend.emails.send({
      from: 'maxxweb <onboarding@resend.dev>',
      to: 'maxxweb@outlook.cz',
      subject: `📋 Dotazník – ${d.jmeno || 'Nový klient'}${d.promokod ? ` [${d.promokod}]` : ''}`,
      html: `
        <div style="font-family:sans-serif;max-width:640px;margin:0 auto;background:#1A1A1A;color:#fff;border-radius:12px;overflow:hidden">
          <div style="background:#111;padding:24px 32px;border-bottom:1px solid #333">
            <span style="font-size:22px;font-weight:800">ma<span style="color:#E83A3A">xx</span><span style="color:#aaa;font-weight:400">web</span></span>
            <span style="margin-left:16px;background:#E83A3A;color:#fff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:100px">Nový dotazník</span>
          </div>

          <div style="padding:32px">
            <h2 style="margin:0 0 6px;font-size:18px">📋 Vyplněný dotazník</h2>
            <p style="color:#aaa;font-size:13px;margin:0 0 28px">Klient dokončil dotazník na maxxweb.cz</p>

            <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#E83A3A;margin:0 0 12px">KONTAKTNÍ ÚDAJE</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
              ${row('Jméno', d.jmeno)}
              ${row('E-mail', d.email ? `<a href="mailto:${d.email}" style="color:#E83A3A">${d.email}</a>` : null)}
              ${row('Promo kód', d.promokod ? `<span style="color:#E83A3A;font-weight:700">${d.promokod}</span>` : null)}
              ${row('Balíček (z formuláře)', mapVal(d.paketZFormu, maps.rozpocet))}
            </table>

            <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#E83A3A;margin:0 0 12px">ODPOVĚDI Z DOTAZNÍKU</p>
            <table style="width:100%;border-collapse:collapse">
              ${row('Typ podnikání', mapVal(d.typPodnikani, maps.typPodnikani) + (d.typPodnikaniJine ? ` — ${d.typPodnikaniJine}` : ''))}
              ${row('Popis podnikání', d.popisPodnikani)}
              ${row('Slogan / pocit z webu', d.slogan)}
              ${row('Praktické info', mapArr(d.praktickeInfo, maps.praktickeInfo))}
              ${row('Detaily (info)', d.praktickeDetaily)}
              ${row('Co má web umět', mapArr(d.webFunkce, maps.webFunkce))}
              ${row('Styl a pocit', [mapArr(d.styl, maps.styl), d.stylVlastni].filter(v => v && v !== '—').join(', ') || '—')}
              ${row('Barvy', [mapArr(d.barvy, maps.barvy), d.vlastniBarvy].filter(v => v && v !== '—').join(', ') || '—')}
              ${row('Logo a fotky', mapArr(d.logoFotky, maps.logoFotky))}
              ${row('Detaily (logo/fotky)', d.logoFotkyDetail)}
              ${row('Inspirace', d.inspirace)}
              ${row('Zákazník', [mapArr(d.zakaznik, maps.zakaznik), d.zakaznikDetail].filter(v => v && v !== '—').join(' — ') || '—')}
              ${row('Termín', mapVal(d.termin, maps.termin))}
              ${row('Rozpočet', mapVal(d.rozpocet, maps.rozpocet))}
              ${row('Poznámky', d.poznamky)}
            </table>
          </div>
        </div>
      `,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba při odesílání emailu.' });
  }
}
