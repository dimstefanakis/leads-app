import { stripe } from '../../../utils/stripe';
import {
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
} from '../../../utils/supabase-admin';
import { NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// Stripe requires the raw body to construct the event.
export const config = {
  api: {
    bodyParser: false
  }
};

export const dynamic = 'force-dynamic'

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'price.created',
  'price.updated',
  'payment_intent.succeeded',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted'
]);

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET_LIVE ??
    process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) return;
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    return NextResponse.json(`Webhook Error: ${err.message}`);
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'plan.created':
        case 'plan.updated':
          // await upsertProductRecord(event.data.object as Stripe.Product);
          // await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case 'product.created':
        case 'product.updated':
          await upsertProductRecord(event.data.object as Stripe.Product);
          break;
        case 'price.created':
        case 'price.updated':
          await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === 'customer.subscription.created'
          );
          break;
        case 'checkout.session.completed':
          const checkoutSession = event.data
            .object as Stripe.Checkout.Session;
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            );
          } else {
            // @ts-ignore
            const id = event.data.object.id as any;
            const customerId = checkoutSession.customer as string;
            // Retrieve the Checkout Session with expand
            const session = await stripe.checkout.sessions.retrieve(id, {
              expand: ['line_items']
            });

            const productId = session?.line_items?.data[0]?.price?.product;
            const product = await stripe.products.retrieve(
              productId as string
            );
            const type = product.metadata.type;
            if (type == 'unlimited_questions') {
              // await enableUnlimitedQuestionsStatus(customerId);
            }
          }
          break;
        case 'payment_intent.succeeded':
          try {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const type = paymentIntent.metadata.type;
            const customerId = paymentIntent.customer as string;
            if (type == 'unlimited_questions') {
              // await enableUnlimitedQuestionsStatus(customerId);
            }
          } catch (err) {
            console.log(err);
          }
          break;

        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.log(error);
      return NextResponse.json({ message: 'Webhook error: "Webhook handler failed. View logs."' }, { status: 400 });
    }
  }

  return NextResponse.json({ received: true });
}

