import nodemailer from "nodemailer";

// Envoi des e-mails (Mailpit en développement : http://localhost:8025). Côté serveur uniquement.
const transport = process.env.SMTP_URL ? nodemailer.createTransport(process.env.SMTP_URL) : null;

const FROM = process.env.MAIL_FROM ?? "Fid’s <no-reply@fids.sn>";

export async function sendMail(message: { to: string; subject: string; text: string; html: string }) {
  if (!transport) {
    // Sans SMTP configuré, on ne bloque pas le parcours : le lien reste lisible dans les journaux du serveur.
    console.warn(`[mailer] SMTP_URL absent : e-mail non envoyé à ${message.to} (${message.subject})\n${message.text}`);
    return;
  }
  await transport.sendMail({ from: FROM, ...message });
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// Mise en forme commune : un paragraphe, un bouton, le lien en clair.
export function actionMail(opts: { greeting: string; body: string; action: string; url: string; footer: string }) {
  const text = `${opts.greeting}\n\n${opts.body}\n\n${opts.action} : ${opts.url}\n\n${opts.footer}`;
  const html = `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;color:#1b1b1b">
<p>${escapeHtml(opts.greeting)}</p><p>${escapeHtml(opts.body)}</p>
<p><a href="${escapeHtml(opts.url)}" style="display:inline-block;background:#C84A00;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:600">${escapeHtml(opts.action)}</a></p>
<p style="font-size:13px;color:#666">Ou copiez ce lien : ${escapeHtml(opts.url)}</p>
<p style="font-size:13px;color:#666">${escapeHtml(opts.footer)}</p></div>`;
  return { text, html };
}
