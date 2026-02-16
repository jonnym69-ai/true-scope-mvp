// Vercel Serverless Function for Stripe Checkout
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Price IDs for different tiers (replace with your actual Stripe price IDs)
const PRICE_IDS = {
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_1234567890', // $4.99/month
  pro: process.env.STRIPE_PRO_PRICE_ID || 'price_0987654321',       // $9.99/month
  studio: process.env.STRIPE_STUDIO_PRICE_ID || 'price_abcdefghij', // $19.99/month
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_klmnopqrst' // $49.99/month
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tier, userId } = req.body;

    // Validate tier
    if (!tier || !PRICE_IDS[tier]) {
      return res.status(400).json({ error: 'Invalid tier selected' });
    }

    const priceId = PRICE_IDS[tier];

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
      metadata: {
        userId: userId || 'anonymous',
        tier: tier,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
}
