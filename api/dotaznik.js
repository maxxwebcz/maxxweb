import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { jmeno, email, telefon, paket, promokod } = req.body;

  const paketLabels = {
    basic: 'A · Basic',
    business: 'B · Business',
    premium: 'C · Premium',
    nevim: 'Ještě neví',
  };

  try {
    await resend.emails.send({
      from: 'maxxweb <office@maxxweb.cz>',
      to: ['office@maxxweb.cz', 'zakazky@maxxweb.cz'],
      subject: `📩 Nová poptávka – ${jmeno}${promokod ? ` [${promokod}]` : ''}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1A1A1A">
          <div style="background:#1A1A1A;padding:24px 32px;border-radius:12px 12px 0 0">
            <span style="font-size:22px;font-weight:800;color:white">maxx<span style="color:#E83A3A">web</span></span>
          </div>
          <div style="background:#f9f9f9;padding:32px;border-radius:0 0 12px 12px;border:1px solid #eee">
            <h2 style="margin:0 0 24px;font-size:20px">Nová poptávka z webu</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#555;width:140px">Jméno</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${jmeno}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#555">E-mail</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600"><a href="mailto:${email}" style="color:#E83A3A">${email}</a></td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#555">Telefon</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${telefon || '—'}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#555">Balíček</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${paketLabels[paket] || '—'}</td></tr>
              <tr><td style="padding:10px 0;color:#555">Promo kód</td><td style="padding:10px 0;font-weight:600;color:${promokod ? '#E83A3A' : '#aaa'}">${promokod || '—'}</td></tr>
            </table>
            <div style="margin-top:28px;padding:16px;background:#FFF5F5;border-radius:8px;font-size:14px;color:#555">
              Klient byl přesměrován na dotazník — výsledky přijdou v dalším emailu.
            </div>
          </div>
        </div>
      `,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba při odesílání emailu.' });
  }
}      subject: `📋 Dotazník – ${d.jmeno || 'Nový klient'}${d.promokod ? ` [${d.promokod}]` : ''}`,
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
              ${row('Poznámky', d.poznamky)}
              ${row('Preferovaná / stávající doména', d.domena)}
              ${row('Firma / Jméno', d.faktNazev)}
              ${row('IČO', d.faktIco)}
              ${row('Fakturační adresa', d.faktAdresa)}
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
