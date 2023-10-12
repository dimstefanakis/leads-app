import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { stripe } from '../../../utils/stripe';
import { createOrRetrieveCustomer } from '../../../utils/supabase-admin';
import { getURL } from '../../../utils/helpers';
import { Database } from '../../../../types_db';

export async function POST(req: any) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const { price, quantity = 1, metadata = {} } = await req.json();

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false })
    }

    const customer = await createOrRetrieveCustomer({
      uuid: user?.id || '',
      email: user?.email || ''
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      customer,
      line_items: [
        {
          price: price.id,
          quantity
        }
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      subscription_data: {
        metadata
      },
      success_url: `${getURL()}/builder?plan=${price.id}`,
      cancel_url: `${getURL()}/`
    });

    return NextResponse.json({ sessionId: session.id })
  } catch (err: any) {
    console.log(err);
    return NextResponse.json(new Error('Could not create subscription'));
  }
};
