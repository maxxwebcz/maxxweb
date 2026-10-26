import { ImapFlow } from 'imapflow';
import nodemailer from 'nodemailer';

export const config = { maxDuration: 60 };

const SCHRANKA = 'office@maxxweb.cz';
// Předmět záznamu, který posílá api/ukazka.js: „Odesláno: Ukázka naší práce – 3× (Petr)“
const PREDMET = /^Odesláno: Ukázka naší práce – (\d+)× \((.*)\)$/;
const PRESKOCIT = ['\\Trash', '\\Junk', '\\Sent', '\\Drafts'];

const escape = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const datum = d => d.toLocaleDateString('cs-CZ', { timeZone: 'Europe/Prague' });

function povoleno(req) {
  // Vercel Cron posílá Authorization: Bearer <CRON_SECRET>, pokud je proměnná nastavená.
  if (process.env.CRON_SECRET) {
    if (req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`) return true;
  } else if (/vercel-cron/i.test(req.headers['user-agent'] || '')) {
    return true;
  }
  // Ruční spuštění (tlačítko na odeslat.html)
  return req.method === 'POST' && req.body?.heslo && req.body.heslo === process.env.ODESILANI_HESLO;
}

export default async function handler(req, res) {
  if (!povoleno(req)) return res.status(401).json({ error: 'Nepovoleno.' });

  const do_ = new Date();
  const od = new Date(do_.getTime() - 7 * 24 * 60 * 60 * 1000);

  const imap = new ImapFlow({
    host: 'imap.seznam.cz',
    port: 993,
    secure: true,
    auth: { user: SCHRANKA, pass: process.env.SEZNAM_SMTP_PASS },
    logger: false,
  });

  const prodejci = {};
  try {
    await imap.connect();
    const slozky = (await imap.list()).filter(s => !PRESKOCIT.includes(s.specialUse) && !s.flags?.has('\\Noselect'));
    for (const slozka of slozky) {
      const lock = await imap.getMailboxLock(slozka.path);
      try {
        const uids = await imap.search({ since: od, from: SCHRANKA }, { uid: true });
        if (!uids || !uids.length) continue;
        for await (const msg of imap.fetch(uids, { envelope: true, internalDate: true }, { uid: true })) {
          const m = PREDMET.exec(msg.envelope?.subject || '');
          if (!m || new Date(msg.internalDate) < od) continue;
          const jmeno = m[2].trim() || 'bez prodejce';
          prodejci[jmeno] ??= { maily: 0, odeslani: 0 };
          prodejci[jmeno].maily += Number(m[1]);
          prodejci[jmeno].odeslani += 1;
        }
      } finally {
        lock.release();
      }
    }
    await imap.logout();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Nepodařilo se přečíst schránku.', detail: err.message });
  }

  const radky = Object.entries(prodejci).sort((a, b) => b[1].maily - a[1].maily);
  const celkem = radky.reduce((s, [, v]) => s + v.maily, 0);
  const obdobi = `${datum(od)} – ${datum(do_)}`;

  const td = 'padding:10px 12px;border-bottom:1px solid #eee';
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1A1A1A">
      <div style="background:#1A1A1A;padding:24px 32px;border-radius:12px 12px 0 0">
        <span style="font-size:22px;font-weight:800;color:white">maxx<span style="color:#E83A3A">web</span></span>
      </div>
      <div style="background:#f9f9f9;padding:32px;border-radius:0 0 12px 12px;border:1px solid #eee">
        <h2 style="margin:0 0 4px;font-size:20px">Týdenní souhrn ukázek</h2>
        <p style="margin:0 0 24px;color:#555">${escape(obdobi)}</p>
        ${radky.length ? `
        <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px">
          <tr><th style="${td};text-align:left;color:#555">Prodejce</th><th style="${td};text-align:right;color:#555">Odesláno mailů</th><th style="${td};text-align:right;color:#555">Počet dávek</th></tr>
          ${radky.map(([jmeno, v]) => `<tr><td style="${td};font-weight:600">${escape(jmeno)}</td><td style="${td};text-align:right;font-weight:700">${v.maily}</td><td style="${td};text-align:right;color:#555">${v.odeslani}</td></tr>`).join('')}
          <tr><td style="padding:10px 12px;font-weight:800">Celkem</td><td style="padding:10px 12px;text-align:right;font-weight:800;color:#E83A3A">${celkem}</td><td></td></tr>
        </table>` : '<p>Tento týden nebyla odeslána žádná ukázka.</p>'}
      </div>
    </div>`;

  try {
    await nodemailer.createTransport({
      host: 'smtp.seznam.cz',
      port: 465,
      secure: true,
      auth: { user: SCHRANKA, pass: process.env.SEZNAM_SMTP_PASS },
    }).sendMail({
      from: `maxxweb <${SCHRANKA}>`,
      to: SCHRANKA,
      subject: `Týdenní souhrn ukázek (${obdobi}) – celkem ${celkem}`,
      html,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Souhrn se nepodařilo odeslat.', detail: err.message });
  }

  res.status(200).json({ ok: true, obdobi, prodejci, celkem });
}
