import { Router } from "express";
import { asyncHandler } from "../errorHandler";
import { findProperties, findProperty } from "./repository";

const router = Router();

router.get(
    "/properties",
    asyncHandler(async (req, res, next) => {
        const data = await findProperties();
        res.json(data);
    })
);

router.get(
    "/properties/:id",
    asyncHandler(async (req, res, next) => {
        const data = await findProperty(req.params.id);
        if (!data) {
            res.status(404).send();
            return;
        }
        res.json(data);
    })
);

export default router;
