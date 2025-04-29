import { stripe } from "@/lib/stripe";
import { clerkClient } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const evt = await verifyWebhook(req);
		const { id } = evt.data;
		const eventType = evt.type;

        if (!id) {
            return NextResponse.json(
                { error: "Error verifying webhook" },
                { status: 400 }
            );
        }
        const authClient = await clerkClient();
		if (eventType === "user.created") {
			const newCustomer = await stripe.customers.create({
                email: evt.data.email_addresses[0].email_address,
                metadata: { userId: id }
            });
			await authClient.users.updateUserMetadata(id, {
				privateMetadata: { stripeId: newCustomer.id },
			});
            return NextResponse.json({ message: "user created successfully" }, { status: 200 });
		} else if (eventType === "user.deleted") {
            const user = await authClient.users.getUser(id);
            const stripeId = user.privateMetadata.stripeId as string;
            if (!stripeId) return;
            await stripe.customers.del(stripeId);
        }
	} catch (err) {
		console.error("An error occurred: ", err);
		return NextResponse.json(
			{ error: "Error verifying webhook" },
			{ status: 400 }
		);
	}
}
