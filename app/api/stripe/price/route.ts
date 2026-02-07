import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function isStripeProduct(
    p: Stripe.Product | Stripe.DeletedProduct,
): p is Stripe.Product {
    // DeletedProduct has deleted: true and no name
    return !('deleted' in p) || p.deleted !== true;
}

export async function POST(req: Request) {
    try {
        const { priceId } = (await req.json()) as { priceId?: string };
        if (!priceId) {
            return NextResponse.json(
                { error: 'Missing priceId' },
                { status: 400 },
            );
        }

        const price = await stripe.prices.retrieve(priceId, {
            expand: ['product'],
        });

        const unitAmount = price.unit_amount ?? null;
        const currency = price.currency ?? 'usd';

        const productName =
            price.product &&
            typeof price.product === 'object' &&
            isStripeProduct(price.product)
                ? (price.product.name ?? null)
                : null;

        return NextResponse.json({
            unitAmount,
            currency,
            productName,
        });
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 },
        );
    }
}
