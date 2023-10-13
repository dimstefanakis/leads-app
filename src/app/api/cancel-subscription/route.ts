import { stripe } from '../../../utils/stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { cancelSubscription } from '../../../utils/supabase-admin';
import { getURL } from '../../../utils/helpers';
import { Database } from '../../../../types_db';

export const dynamic = 'force-dynamic'

export async function POST(req: any) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw Error('Could not get user');
    const subscription = await cancelSubscription(user.id);

    if (!subscription) throw Error('Could not get subscription');

    return NextResponse.json({ subscription })
  } catch (err: any) {
    console.log(err);
    return NextResponse.json(new Error('Could not cancel subscription'));
  }
}
