import { Router } from "express";
import { asyncHandler } from "../errorHandler";
import { searchCompetition } from "./search";

const router = Router();

router.get(
    "/competition",
    asyncHandler(async (req, res) => {
        const checkin = req.query.checkin as string;
        const checkout = req.query.checkout as string;
        const location = (req.query.location as string) || "Premià de Mar, Barcelona";

        if (!checkin || !checkout) {
            res.status(400).json({ error: "checkin and checkout query params required (YYYY-MM-DD)" });
            return;
        }

        const results = await searchCompetition(location, checkin, checkout);
        res.json(results);
    })
);

export default router;
