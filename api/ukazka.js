import nodemailer from 'nodemailer';
import { predmet, html, text } from './_sablona-ukazka.js';

export const config = { maxDuration: 60 };

const ODESILATEL = 'office@maxxweb.cz';
const MAX_ADRES = 40;

const najdiEmaily = vstup => [...new Set(
  (String(vstup || '').match(/[^\s@<>,;:"'()]+@[^\s@<>,;:"'()]+\.[a-z]{2,}/gi) || [])
    .map(e => e.toLowerCase())
)];

const escape = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { heslo, emaily, prodejce, jenNahled } = req.body || {};

  if (!process.env.ODESILANI_HESLO || !process.env.SEZNAM_SMTP_PASS) {
    return res.status(500).json({ error: 'Odesílání není nastavené (chybí proměnné ve Vercelu).' });
  }
  if (heslo !== process.env.ODESILANI_HESLO) {
    return res.status(401).json({ error: 'Špatné heslo.' });
  }

  const adresy = najdiEmaily(emaily);
  if (!adresy.length) return res.status(400).json({ error: 'V textu jsem nenašel žádnou e-mailovou adresu.' });
  if (adresy.length > MAX_ADRES) return res.status(400).json({ error: `Najednou lze poslat max. ${MAX_ADRES} e-mailů, vloženo je ${adresy.length}.` });
  if (jenNahled) return res.status(200).json({ adresy });

  const transporter = nodemailer.createTransport({
    host: 'smtp.seznam.cz',
    port: 465,
    secure: true,
    auth: { user: ODESILATEL, pass: process.env.SEZNAM_SMTP_PASS },
  });

  const vysledky = [];
  for (const to of adresy) {
    try {
      await transporter.sendMail({
        from: `maxxweb <${ODESILATEL}>`,
        to,
        subject: predmet,
        html,
        text,
        headers: { 'List-Unsubscribe': `<mailto:${ODESILATEL}?subject=odhlasit>` },
      });
      vysledky.push({ email: to, ok: true });
    } catch (err) {
      console.error(to, err);
      vysledky.push({ email: to, ok: false, chyba: err.message });
    }
  }

  // Záznam o odeslání (kdo, komu, kdy) – slouží i jako evidence telefonické domluvy.
  const kdy = new Date().toLocaleString('cs-CZ', { timeZone: 'Europe/Prague' });
  try {
    await transporter.sendMail({
      from: `maxxweb <${ODESILATEL}>`,
      to: ODESILATEL,
      subject: `Odesláno: Ukázka naší práce – ${vysledky.filter(v => v.ok).length}× (${prodejce || 'bez prodejce'})`,
      html: `<p>Odesláno ${escape(kdy)}, prodejce: <b>${escape(prodejce || '—')}</b></p><ul>${
        vysledky.map(v => `<li>${escape(v.email)} – ${v.ok ? 'odesláno' : `<b style="color:#c00">CHYBA: ${escape(v.chyba)}</b>`}</li>`).join('')
      }</ul>`,
    });
  } catch (err) {
    console.error('Záznam o odeslání se nepodařilo poslat', err);
  }

  res.status(200).json({ vysledky });
}
