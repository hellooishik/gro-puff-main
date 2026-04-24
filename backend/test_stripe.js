const dotenv = require('dotenv');
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripe() {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'gbp',
                        product_data: {
                            name: 'Total Order',
                        },
                        unit_amount: 957,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `http://localhost:5173/order/123?success=true`,
            cancel_url: `http://localhost:5173/checkout?canceled=true`,
        });
        console.log(session.url);
    } catch (err) {
        console.error("ERROR:", err);
    }
}
testStripe();
