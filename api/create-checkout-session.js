import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Domenii permise să-ți apeleze endpoint-ul
const ALLOWED_ORIGINS = new Set([
  "https://adnv.ro",
  "https://www.adnv.ro",
  // Preview Framer (poți să îl scoți după ce testezi doar live)
  "https://framer.com",
])

export default async function handler(req, res) {
  const origin = req.headers.origin

  // Dacă vine un Origin pe care îl permiți, îl întorci în header.
  // Pentru preview Framer (care are subdomenii variabile), permitem orice *.framercanvas.com și *.framer.website
  const isFramerPreview =
    typeof origin === "string" &&
    (origin.endsWith(".framercanvas.com") || origin.endsWith(".framer.website"))

  if (origin && (ALLOWED_ORIGINS.has(origin) || isFramerPreview)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
  }

  // CORS headers standard
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  res.setHeader("Access-Control-Max-Age", "86400")

  // Preflight request (browser-ul trimite OPTIONS înainte de POST)
  if (req.method === "OPTIONS") {
    return res.status(204).end()
  }

  // Acceptăm doar POST
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed")
  }

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      line_items: [{ price: "price_1SurdrHJwxkdxPOOI54XsZmA", quantity: 1 }],
      return_url: "https://adnv.ro/ty-quiz?session_id={CHECKOUT_SESSION_ID}",
    })

    return res.status(200).json({ clientSecret: session.client_secret })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
