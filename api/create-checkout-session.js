import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      line_items: [
        { price: "price_1SurdrHJwxkdxPOOI54XsZmA", quantity: 1 }
      ],
      return_url: "https://adnv.ro/ty-quiz?session_id={CHECKOUT_SESSION_ID}",
    });

    res.status(200).json({ clientSecret: session.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
