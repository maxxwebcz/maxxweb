import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { jmeno, email, telefon, paket, promokod } = req.body;

  const paketLabels = {
    basic: 'A Âˇ Basic',
    business: 'B Âˇ Business',
    premium: 'C Âˇ Premium',
    nevim: 'JeĹĄtÄ nevĂ­',
  };

  try {
    await resend.emails.send({
      from: 'maxxweb <office@maxxweb.cz>',
      to: 'office@maxxweb.cz',
      subject: `đŠ NovĂĄ poptĂĄvka â ${jmeno}${promokod ? ` [${promokod}]` : ''}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1A1A1A">
          <div style="background:#1A1A1A;padding:24px 32px;border-radius:12px 12px 0 0">
            <span style="font-size:22px;font-weight:800;color:white">maxx<span style="color:#E83A3A">web</span></span>
          </div>
          <div style="background:#f9f9f9;padding:32px;border-radius:0 0 12px 12px;border:1px solid #eee">
            <h2 style="margin:0 0 24px;font-size:20px">NovĂĄ poptĂĄvka z webu</h2>

            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#555;width:140px">JmĂŠno</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${jmeno}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#555">E-mail</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600"><a href="mailto:${email}" style="color:#E83A3A">${email}</a></td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#555">Telefon</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${telefon || 'â'}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#555">BalĂ­Äek</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${paketLabels[paket] || 'â'}</td></tr>
              <tr><td style="padding:10px 0;color:#555">Promo kĂłd</td><td style="padding:10px 0;font-weight:600;color:${promokod ? '#E83A3A' : '#aaa'}">${promokod || 'â'}</td></tr>
            </table>

            <div style="margin-top:28px;padding:16px;background:#FFF5F5;border-radius:8px;font-size:14px;color:#555">
              Klient byl pĹesmÄrovĂĄn na dotaznĂ­k â vĂ˝sledky pĹijdou v dalĹĄĂ­m emailu.
            </div>
          </div>
        </div>
      `,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba pĹi odesĂ­lĂĄnĂ­ emailu.' });
  }
}
