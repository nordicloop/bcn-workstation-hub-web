import { Router } from "express";
import { asyncHandler } from "../errorHandler";
import { createProperty, findProperties, findProperty } from "./repository";
import { getRealPrice } from "../price-lookup";
import { sendReservationEmails } from "./service";

const router = Router();

router.get(
    "/properties",
    asyncHandler(async (_, res) => {
        const properties = await findProperties();

        const propertiesWithPrices = properties.map((property) => ({
            ...property,
            pricePerNight:
                getRealPrice(property.id) || property.pricePerNight || 0,
        }));

        res.json(propertiesWithPrices);
    })
);

router.get(
    "/properties/:id",
    asyncHandler(async (req, res) => {
        const id = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;

        const property = await findProperty(id);
        if (!property) {
            res.status(404).send();
            return;
        }

        property.pricePerNight =
            getRealPrice(property.id) || property.pricePerNight || 0;
        res.json(property);
    })
);

router.post(
    "/properties",
    asyncHandler(async (req, res) => {
        const data = req.body;

        if (!data.id) {
            res.status(400).json({ error: "Property ID is required" });
            return;
        }

        const property = await createProperty(data);

        res.json(property);
    })
);

router.post(
    "/send-reservation-email",
    asyncHandler(async (request, response) => {
        const {
            property,
            fromDate,
            toDate,
            adults,
            children,
            infants,
            guestEmail,
            totalAmount,
        } = request.body;

        if (!property || !fromDate || !toDate || !guestEmail) {
            response.status(400).json({ error: "Missing required fields" });
            return;
        }

        const fromDateObj =
            typeof fromDate === "string" ? new Date(fromDate) : fromDate;
        const toDateObj =
            typeof toDate === "string" ? new Date(toDate) : toDate;

        await sendReservationEmails({
            property,
            fromDate: fromDateObj,
            toDate: toDateObj,
            adults,
            children,
            infants,
            guestEmail,
            totalAmount,
        });

        response.status(200).send();
    })
);

export default router;
