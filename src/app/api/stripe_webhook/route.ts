// import { stripe } from "@/lib/stripe";
// import { NextRequest, NextResponse } from "next/server";
// import { updateUserTier, ApiKeyTier, createApiKey, getUserApiKey, deleteApiKey } from "@/lib/ddb";
// import { generateApiKey } from "@/lib/generateApiKeys";
// import { clerkClient } from "@clerk/nextjs/server";
// import Stripe from "stripe";

// export const config = {
// 	api: {
// 		bodyParse: false,
// 	},
// };

// export async function POST(req: NextRequest) {
// 	const sig = req.headers.get("stripe-signature");
// 	if (!req.body)
// 		return Response.json({ error: "Body not provided" }, { status: 400 });
// 	if (!sig)
// 		return Response.json(
// 			{ error: "Stripe signature not provided" },
// 			{ status: 400 }
// 		);
//     const rawBody = await req.arrayBuffer();
//     const buffer = Buffer.from(rawBody);

//     try {
//         const event = stripe.webhooks.constructEvent(buffer, sig, process.env.STRIPE_WEBHOOK_SIGNING_SECRET!);
//         const clerk = await clerkClient();
        
//         if (event.type === "checkout.session.completed") {
//             // First time user is subscribing, they will need an API key
//             const session = event.data.object;
//             const userId = session.client_reference_id;
//             const customer = session.customer as string;
            
//             if (!userId) {
//                 console.error("No client_reference_id found in checkout session");
//                 return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
//             }

//             // Update customer metadata with userId
//             await stripe.customers.update(customer, {
//                 metadata: { userId }
//             });

//             // Update Clerk user metadata with subscription status
//             await clerk.users.updateUserMetadata(userId, {
//                 privateMetadata: {
//                     hasActiveSubscription: true,
//                     stripeId: customer
//                 }
//             });

//             const newApiKey = generateApiKey();
            
//             // Extract the plan tier from the purchased product
//             const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
//             const productId = lineItems.data[0]?.price?.product as string;
            
//             if (!productId) {
//                 console.error("No product ID found in checkout session");
//                 return NextResponse.json({ error: "Missing product information" }, { status: 400 });
//             }
            
//             const product = await stripe.products.retrieve(productId);
//             const planTier = product.metadata.tier as ApiKeyTier; 

//             if (!planTier) {
//                 console.error("No tier information found in product metadata");
//                 return NextResponse.json({ error: "Missing plan tier" }, { status: 400 });
//             }
            
//             // Create new API key with the selected tier
//             const success = await createApiKey(userId, newApiKey, planTier);
//             if (!success) {
//                 console.error(`Failed to create API key for user ${userId}`);
//                 return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
//             }
            
//             console.log(`Successfully created API key for user ${userId} with tier ${planTier}`);
//         } else if (event.type === "customer.subscription.updated") {
//             // User subscription updated (upgrade, downgrade, etc.)
//             const subscription = event.data.object;
//             const customerId = subscription.customer as string;

//             // Get the user ID from the customer ID
//             const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
            
//             if (customer.deleted) {
//                 console.error(`No customer found with ID ${customerId}`);
//                 return NextResponse.json({ error: "Customer not found" }, { status: 400 });
//             }
//             const userId = customer.metadata.userId;
//             if (!userId) {
//                 console.error(`No user ID found for customer ${customerId}`);
//                 return NextResponse.json({ error: "Missing user ID in customer metadata" }, { status: 400 });
//             }

//             // Get the current plan from the subscription
//             const productId = subscription.items.data[0]?.price.product as string;
//             const product = await stripe.products.retrieve(productId);
//             const planTier = product.metadata.tier as ApiKeyTier;
            
//             // Update Clerk user metadata with subscription status
//             await clerk.users.updateUserMetadata(userId, {
//                 privateMetadata: {
//                     tier: planTier,
//                     hasActiveSubscription: subscription.status === 'active',
//                     stripeId: customerId
//                 }
//             });

//             await stripe.customers.update(customerId, {
//                 metadata: {
//                     tier: planTier
//                 }
//             });
            
//             if (!planTier) {
//                 console.error("No tier information found in product metadata");
//                 return NextResponse.json({ error: "Missing plan tier" }, { status: 400 });
//             }
            
//             // Update the user's tier in the database
//             const success = await updateUserTier(userId, planTier);
//             if (!success) {
//                 console.error(`Failed to update tier for user ${userId}`);
//                 return NextResponse.json({ error: "Failed to update tier" }, { status: 500 });
//             }
            
//             console.log(`Successfully updated subscription for user ${userId} to ${planTier}`);
//         } else if (event.type === "customer.subscription.deleted") {
//             // Handle subscription cancellation
//             const subscription = event.data.object;
//             const customerId = subscription.customer as string;
            
//             const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
//             const userId = customer.metadata.userId;
            
//             if (userId) {
//                 // Update Clerk user metadata to reflect cancelled subscription
//                 await clerk.users.updateUserMetadata(userId, {
//                     privateMetadata: {
//                         hasActiveSubscription: false,
//                         stripeId: customerId
//                     }
//                 });
//                 await deleteApiKey(userId);
//             }
//         }
        
//         return NextResponse.json({ received: true }, { status: 200 });
//     } catch (error) {
//         console.error("Error processing webhook:", error);
//         return NextResponse.json(
//             { error: "Error processing webhook" },
//             { status: 400 }
//         );
//     }
// }
