import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import {
	updateUserTier,
	ApiKeyTier,
	pauseApiKey,
} from "@/lib/ddb";

export const config = {
	api: {
		bodyParse: false,
	},
};

export async function POST(req: NextRequest) {
	const sig = req.headers.get("stripe-signature");
	if (!req.body)
		return Response.json({ error: "Body not provided" }, { status: 400 });
	if (!sig)
		return Response.json(
			{ error: "Stripe signature not provided" },
			{ status: 400 }
		);
	const rawBody = await req.arrayBuffer();
	const buffer = Buffer.from(rawBody);

	try {
		const event = stripe.webhooks.constructEvent(
			buffer,
			sig,
			process.env.STRIPE_WEBHOOK_SIGNING_SECRET!
		);

		if (event.type === "customer.subscription.updated") {
			const subscription = event.data.object;
			const customerId = subscription.customer as string;

			// Get the user ID from the customer ID
			const customer = await stripe.customers.retrieve(customerId);

			if (customer.deleted || !customer.metadata.userId) {
				console.error(`No customer found with ID ${customerId}`);
				return NextResponse.json(
					{ error: "Customer not found" },
					{ status: 400 }
				);
			}

			const userId = customer.metadata.userId;
			if (!userId) {
				console.error(`No user ID found for customer ${customerId}`);
				return NextResponse.json(
					{ error: "Missing user ID in customer metadata" },
					{ status: 400 }
				);
			}

			// Get the current plan from the subscription
			const productId = subscription.items.data[0]?.price
				.product as string;
			const product = await stripe.products.retrieve(productId);
			const planTier = product.metadata.tier as ApiKeyTier;

			if (
				subscription.status === "past_due" ||
				subscription.status === "canceled" ||
				subscription.status === "unpaid"
			) {
                // If a user does not pay, we pause their api key
				await pauseApiKey(userId);
				return NextResponse.json({ received: true }, { status: 200 });
			}

			if (!planTier) {
				console.error("No tier information found in product metadata");
				return NextResponse.json(
					{ error: "Missing plan tier" },
					{ status: 400 }
				);
			}

			// Update the user's tier in the database
			const success = await updateUserTier(userId, planTier);
			if (!success) {
				console.error(`Failed to update tier for user ${userId}`);
				return NextResponse.json(
					{ error: "Failed to update tier" },
					{ status: 500 }
				);
			}

			console.log(
				`Successfully updated subscription for user ${userId} to ${planTier}`
			);
		}

		return NextResponse.json({ received: true }, { status: 200 });
	} catch (error) {
		console.error("Error processing webhook:", error);
		return NextResponse.json(
			{ error: "Error processing webhook" },
			{ status: 400 }
		);
	}
}
