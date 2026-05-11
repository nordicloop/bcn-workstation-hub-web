import { readFileSync } from "fs";
import { join } from "path";
import { getConfig } from "./config";

export function readTemplate(name: string): string {
    return readFileSync(join(__dirname, "templates", name), "utf-8");
}

export function renderTemplate(
    template: string,
    vars: Record<string, string>
): string {
    return Object.entries(vars).reduce(
        (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
        template
    );
}

export async function sendEmail(params: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}): Promise<Response> {
    const config = getConfig();

    const { to, subject, text, html } = params;
    const form = new FormData();
    form.append("from", `BCN Workation Hub <noreply@${config.MAILGUN_DOMAIN}>`);
    form.append("to", to);
    form.append("subject", subject);
    if (text) form.append("text", text);
    if (html) form.append("html", html);

    return fetch(
        `https://api.mailgun.net/v3/${config.MAILGUN_DOMAIN}/messages`,
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(`api:${config.MAILGUN_API_KEY}`).toString("base64")}`,
            },
            body: form,
        }
    );
}
