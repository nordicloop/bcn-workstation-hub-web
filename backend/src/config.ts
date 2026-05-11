import { z } from "zod";

const configScheama = z.object({
    MAILGUN_API_KEY: z.string(),
    MAILGUN_DOMAIN: z.string(),
});

export type Config = z.infer<typeof configScheama>;

export function getConfig(): Config {
    return configScheama.parse(process.env);
}
