import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const labels = {
  typPodnikani: { remeslnik: 'Řemeslník', sluzby: 'Služby', krasa: 'Krása & wellness', gastro: 'Gastronomie', eshop: 'E-shop / obchod', jine: 'Jiné' },
  styl: { moderni: 'Moderní', pratelsky: 'Přátelský', profesionalni: 'Profesionální', kreativni: 'Kreativní' },
  barvy: { cervena: 'Červená & černá', modra: 'Modrá & bílá', zelena: 'Zelená & světlá', bila: 'Černobílá', tepla: 'Teplá & zlatá', fialova: 'Fialová' },
  stranky: { uvodni: 'Úvodní stránka', opodnikani: 'O firmě / o mně', sluzby: 'Stránka služeb', cenik: 'Ceník', blog: 'Blog / aktuality', galerie: 'Fotogalerie', kontakt: 'Kontaktní formulář', eshop: 'E-shop' },
  podklady: { logo: 'Logo', fotky: 'Fotky', texty: 'Texty', domenahosting: 'Doména / hosting' },
  termin: { 'co-nejdrive': 'Co nejdříve', mesic: 'Do měsíce', '2mesice': 'Do 2 měsíců', neresi: 'Termín neřeším' },
  rozpocet: { basic: 'Basic (20–40 tis. Kč)', business: 'Business (40–70 tis. Kč)', premium: 'Premium (70 tis. Kč+)', nevim: 'Ještě neví' },
};

function row(label, value) {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #eee;color:#555;width:160px;vertical-align:top">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${value || '—'}</td>
  </tr>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const d = req.body;

  const mapArr = (arr, map) => arr && arr.length ? arr.map(v => map[v] || v).join(', ') : '—';

  try {
    await resend.emails.send({
      from: 'maxxweb <onboarding@resend.dev>',
      to: 'maxxweb@outlook.cz',
      subject: `📋 Dotazník vyplněn – ${d.jmeno}${d.promokod ? ` [${d.promokod}]` : ''}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1A1A1A">
          <div style="background:#1A1A1A;padding:24px 32px;border-radius:12px 12px 0 0">
            <span style="font-size:22px;font-weight:800;color:white">maxx<span style="color:#E83A3A">web</span></span>
          </div>
          <div style="background:#f9f9f9;padding:32px;border-radius:0 0 12px 12px;border:1px solid #eee">
            <h2 style="margin:0 0 8px;font-size:20px">Vyplněný dotazník</h2>
            <p style="color:#555;margin:0 0 24px;font-size:14px">Klient dokončil dotazník na maxxweb.cz</p>

            <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#E83A3A;margin:0 0 12px">Kontaktní údaje</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
              ${row('Jméno', d.jmeno)}
              ${row('E-mail', `<a href="mailto:${d.email}" style="color:#E83A3A">${d.email}</a>`)}
              ${row('Promo kód', d.promokod ? `<span style="color:#E83A3A;font-weight:700">${d.promokod}</span>` : null)}
            </table>

            <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#E83A3A;margin:0 0 12px">Odpovědi z dotazníku</h3>
            <table style="width:100%;border-collapse:collapse">
              ${row('Typ podnikání', labels.typPodnikani[d.typPodnikani] + (d.typPodnikaniJine ? ` — ${d.typPodnikaniJine}` : ''))}
              ${row('Styl webu', labels.styl[d.styl])}
              ${row('Barvy', mapArr(d.barvy, labels.barvy) + (d.vlastniBarvy ? ` + ${d.vlastniBarvy}` : ''))}
              ${row('Stránky / funkce', mapArr(d.stranky, labels.stranky))}
              ${row('Podklady', mapArr(d.podklady, labels.podklady))}
              ${row('Stávající web', d.existujiciWeb)}
              ${row('Termín', labels.termin[d.termin])}
              ${row('Rozpočet', labels.rozpocet[d.rozpocet])}
            </table>

            ${d.poznamky ? `<div style="margin-top:24px;padding:16px;background:#fff;border:1px solid #eee;border-radius:8px">
              <div style="font-size:12px;font-weight:700;color:#555;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Poznámky klienta</div>
              <div style="font-size:15px;line-height:1.6">${d.poznamky}</div>
            </div>` : ''}
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
