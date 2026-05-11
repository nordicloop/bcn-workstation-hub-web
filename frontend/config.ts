import { z } from "zod";

const configScheama = z.object({
    googleMapsApiKey: z.string(),
});

export const config = configScheama.parse({
    // @ts-ignore
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
});
