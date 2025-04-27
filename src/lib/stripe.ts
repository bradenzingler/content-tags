import Stripe from "stripe";

const secretKey = process.env.STRIPE_SK;
if (!secretKey) throw new Error("No stripe secret key provided!");

export const stripe = new Stripe(secretKey);