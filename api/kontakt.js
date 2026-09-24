import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    jmeno, email, telefon, paket, promokod, sluzba,
    maSeoWeb, seoUrl, seoObor, seoZakaznik, seoCil, seoPaket
  } = req.body;

  const paketLabels = {
    basic: 'A · Basic',
    business: 'B · Business',
    premium: 'C · Premium',
    nevim: 'Ještě neví',
    'seo-zaklad': 'SEO · Základ (4 990 Kč/měs.)',
    'seo-rust': 'SEO · Růst (9 990 Kč/měs.)',
    'seo-pro': 'SEO · Pro (19 990 Kč/měs.)',
    'seo-premium': 'SEO · Premium (49 990 Kč/měs.)',
  };

  const cilLabels = {
    navstevnost: 'Více návštěvníků',
    poptavky: 'Více poptávek',
    pozice: 'Lepší pozice na Google',
  };

  const jeSeo = sluzba === 'seo';

  const webRadky = `
    <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#555;width:160px">Balíček</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${paketLabels[paket] || '—'}</td></tr>
    <tr><td style="padding:10px 0;color:#555">Promo kód</td><td style="padding:10px 0;font-weight:600;color:${promokod ? '#E83A3A' : '#aaa'}">${promokod || '—'}</td></tr>
  `;

  const seoRadky = `
    <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#555;width:160px">Paušál</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${paketLabels[seoPaket] || '—'}</td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#555">Má web?</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${maSeoWeb === 'ano' ? 'Ano' : 'Ne'}</td></tr>
    ${maSeoWeb === 'ano' ? `<tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#555">URL webu</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${seoUrl || '—'}</td></tr>` : ''}
    <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#555">Obor</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${seoObor || '—'}</td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#555">Zákazník</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${seoZakaznik || '—'}</td></tr>
    <tr><td style="padding:10px 0;color:#555">Cíl</td><td style="padding:10px 0;font-weight:600">${cilLabels[seoCil] || '—'}</td></tr>
  `;

  const poznamka = jeSeo
    ? `<div style="margin-top:28px;padding:16px;background:#FFF5F5;border-radius:8px;font-size:14px;color:#555">SEO poptávka — klient čeká na kontakt do 24 hodin.</div>`
    : `<div style="margin-top:28px;padding:16px;background:#FFF5F5;border-radius:8px;font-size:14px;color:#555">Klient byl přesměrován na dotazník — výsledky přijdou v dalším e-mailu.</div>`;

  try {
    await resend.emails.send({
      from: 'maxxweb <office@maxxweb.cz>',
      to: ['office@maxxweb.cz', 'zakazky@maxxweb.cz', 'maxxweb@outlook.cz'],
      subject: `📩 ${jeSeo ? 'SEO poptávka' : 'Nová poptávka'} – ${jmeno}${promokod ? ` [${promokod}]` : ''}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1A1A1A">
          <div style="background:#1A1A1A;padding:24px 32px;border-radius:12px 12px 0 0">
            <span style="font-size:22px;font-weight:800;color:white">maxx<span style="color:#E83A3A">web</span></span>
            <span style="margin-left:12px;font-size:12px;font-weight:600;background:${jeSeo ? '#1a6e3a' : '#E83A3A'};color:white;padding:3px 10px;border-radius:100px;vertical-align:middle">${jeSeo ? 'SEO' : 'WEB'}</span>
          </div>
          <div style="background:#f9f9f9;padding:32px;border-radius:0 0 12px 12px;border:1px solid #eee">
            <h2 style="margin:0 0 24px;font-size:20px">${jeSeo ? 'Nová SEO poptávka' : 'Nová poptávka z webu'}</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#555;width:160px">Jméno</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${jmeno}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#555">E-mail</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600"><a href="mailto:${email}" style="color:#E83A3A">${email}</a></td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#555">Telefon</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${telefon || '—'}</td></tr>
              ${jeSeo ? seoRadky : webRadky}
            </table>
            ${poznamka}
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
