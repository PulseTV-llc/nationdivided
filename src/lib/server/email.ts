import "server-only";
import { site } from "@/content/site";
import { env } from "./env";
import { log } from "./log";

type Mail = { to: string; subject: string; text: string; html: string; replyTo?: string };

export const emailEnabled = () => Boolean(env().RESEND_API_KEY && env().EMAIL_FROM);

/**
 * Sends through Resend's HTTP API. Returns false (never throws) when email
 * isn't configured or delivery fails, so callers can report the truth.
 */
export async function sendEmail(mail: Mail): Promise<boolean> {
  const { RESEND_API_KEY, EMAIL_FROM } = env();
  if (!RESEND_API_KEY || !EMAIL_FROM) {
    log.warn("email.not_configured", { subject: mail.subject });
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [mail.to],
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
        reply_to: mail.replyTo,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      log.error("email.send_failed", { status: res.status });
      return false;
    }
    return true;
  } catch (e) {
    log.error("email.send_error", { error: String(e) });
    return false;
  }
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function frame(title: string, paragraphs: string[]) {
  return `<!doctype html><html><body style="margin:0;background:#08090d;color:#f3f0ea;font-family:Georgia,serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#08090d"><tr><td align="center" style="padding:48px 20px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
<tr><td style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:4px;color:#c9a56a;text-transform:uppercase;padding-bottom:28px">Nation Divided &middot; ${esc(site.studio)}</td></tr>
<tr><td style="font-family:Impact,'Arial Narrow',sans-serif;font-size:40px;line-height:1;text-transform:uppercase;padding-bottom:24px">${esc(title)}</td></tr>
${paragraphs.map((p) => `<tr><td style="font-size:17px;line-height:1.6;color:#d9d4ca;padding-bottom:16px">${p}</td></tr>`).join("")}
<tr><td style="border-top:1px solid #2a2c33;padding-top:24px;font-family:Arial,sans-serif;font-size:12px;color:#9b978f">${esc(site.studio)} &middot; ${esc(site.contact.casting)}</td></tr>
</table></td></tr></table></body></html>`;
}

export function castingConfirmationEmail(name: string, reference: string): Omit<Mail, "to"> {
  const lines = [
    `Hi ${esc(name)},`,
    "Thank you for applying to share your story with <em>Nation Divided</em>. We've received your application.",
    `Your reference is <strong style="color:#f3f0ea;letter-spacing:1px">${esc(reference)}</strong>.`,
    "Our casting team reads every application personally. Because we receive more applications than we can film, we can't promise everyone a reply, but if your story may be a fit we will contact you to talk. Nothing is filmed without a conversation first and separate signed releases.",
    `If you'd like to withdraw your application or have questions, reply to this email or write to ${esc(site.contact.casting)}.`,
  ];
  return {
    subject: "We received your Nation Divided application",
    html: frame("Thank you.", lines),
    text: lines.map((l) => l.replace(/<[^>]+>/g, "")).join("\n\n"),
    replyTo: site.contact.casting,
  };
}

/** Internal notification — deliberately contains no applicant answers. */
export function castingStaffNotice(reference: string, adminUrl: string): Omit<Mail, "to"> {
  const lines = [
    `A new casting application (${esc(reference)}) has been submitted.`,
    `Review it securely in the admin area: <a style="color:#c9a56a" href="${esc(adminUrl)}">${esc(adminUrl)}</a>`,
  ];
  return {
    subject: `New casting application ${reference}`,
    html: frame("New application", lines),
    text: lines.map((l) => l.replace(/<[^>]+>/g, "")).join("\n\n"),
  };
}

export function pressNotice(p: { name: string; outlet: string; email: string; kind: string; deadline: string; message: string }) {
  const lines = [
    `<strong>${esc(p.name)}</strong> — ${esc(p.outlet)} (${esc(p.email)})`,
    `Request: ${esc(p.kind)}${p.deadline ? ` · Deadline: ${esc(p.deadline)}` : ""}`,
    esc(p.message).replace(/\n/g, "<br>"),
  ];
  return {
    subject: `Press inquiry: ${p.outlet}`,
    html: frame("Press inquiry", lines),
    text: `${p.name} — ${p.outlet} (${p.email})\nRequest: ${p.kind} ${p.deadline}\n\n${p.message}`,
    replyTo: p.email,
  };
}
