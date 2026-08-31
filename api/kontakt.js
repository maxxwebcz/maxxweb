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
      to: ['office@maxxweb.cz', 'zakazky@maxxweb.cz', 'maxxweb@outlook.cz'],
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
}
