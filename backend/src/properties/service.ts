import { readTemplate, renderTemplate, sendEmail } from "../mailer";

interface ReservationEmailParams {
    property: { name: string; id: string; address: string };
    fromDate: Date;
    toDate: Date;
    adults: number;
    children: number;
    infants: number;
    guestEmail: string;
    totalAmount: number;
}

export async function sendReservationEmails({
    property,
    fromDate,
    toDate,
    adults,
    children,
    infants,
    guestEmail,
    totalAmount,
}: ReservationEmailParams): Promise<{ checkIn: string; checkOut: string }> {
    const fmt = (d: Date) => {
        if (!(d instanceof Date) || isNaN(d.getTime())) return "Invalid Date";
        return d.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const guests = [
        `${adults} adult${adults !== 1 ? "s" : ""}`,
        children > 0 ? `${children} child${children !== 1 ? "ren" : ""}` : null,
        infants > 0 ? `${infants} infant${infants !== 1 ? "s" : ""}` : null,
    ]
        .filter(Boolean)
        .join(", ");

    const nights = Math.ceil(
        (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const checkIn = fmt(fromDate);
    const checkOut = fmt(toDate);

    const guestHtml = renderTemplate(readTemplate("reservation.html"), {
        PROPERTY_NAME: property.name,
        PROPERTY_ID: property.id,
        PROPERTY_ADDRESS: property.address,
        CHECK_IN: checkIn,
        CHECK_OUT: checkOut,
        NIGHTS: String(nights),
        GUESTS: guests as string,
        TOTAL_AMOUNT: String(totalAmount),
    });

    const managerText = `New booking request received:

Guest Information:
- Email: ${guestEmail}
- Check-in: ${checkIn}
- Check-out: ${checkOut}
- Duration: ${nights} nights
- Guests: ${guests}
- Total Amount: $${totalAmount} USD

Property: ${property.name} (ID: ${property.id})
Address: ${property.address}

Please contact the guest to confirm availability and provide payment instructions for the 10% deposit.`.trim();

    const [guestRes, managerRes] = await Promise.all([
        sendEmail({
            to: guestEmail,
            subject: `Booking Request – ${property.name}`,
            html: guestHtml,
        }),
        sendEmail({
            to: "dfernandezbiz@gmail.com",
            subject: `New Booking Request – ${property.name} – ${guestEmail}`,
            text: managerText,
        }),
    ]);

    if (!guestRes.ok || !managerRes.ok) {
        throw new Error("Failed to send emails");
    }

    return { checkIn, checkOut };
}
