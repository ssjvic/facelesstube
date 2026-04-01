const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { priceId, planName, amount, videoDuration } = req.body;

            // Test payment mode: one-time $0.01 charge
            if (amount !== undefined) {
                const session = await stripe.checkout.sessions.create({
                    line_items: [
                        {
                            price_data: {
                                currency: 'usd',
                                product_data: {
                                    name: `FacelessTube - Test Payment`,
                                    description: videoDuration
                                        ? `Video duration: ${videoDuration} minutes`
                                        : 'Payment test - $0.01 USD',
                                },
                                unit_amount: amount, // amount in cents (1 = $0.01)
                            },
                            quantity: 1,
                        },
                    ],
                    mode: 'payment',
                    success_url: `${req.headers.origin}/?payment=success`,
                    cancel_url: `${req.headers.origin}/?payment=canceled`,
                    metadata: {
                        type: 'test_payment',
                        video_duration: videoDuration || null,
                    },
                });

                res.status(200).json({ id: session.id });
                return;
            }

            // Subscription mode (existing flow)
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: `${req.headers.origin}/?success=true`,
                cancel_url: `${req.headers.origin}/?canceled=true`,
                subscription_data: {
                    metadata: {
                        plan: planName,
                    },
                },
            });

            res.status(200).json({ id: session.id });
        } catch (err) {
            res.status(err.statusCode || 500).json(err.message);
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}
