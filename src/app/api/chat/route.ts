// ./app/api/chat/route.js
import OpenAI from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Database } from '../../../../types_db'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages } = await req.json()
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'You need to be signed in' })
  }

  // @ts-ignore
  const requestCount = await supabase.rpc('get_monthly_chat_request_count', {
    p_user_id: user.id,
  })

  if (requestCount.error) {
    return NextResponse.json({ error: 'An error has occured' }), { status: 500 }
  }

  const subscriptionResponse = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .eq('user_id', user?.id)
    // .in('status', ['trialing', 'active'])
    .single();

  //@ts-ignore
  const hasProPlan = subscriptionResponse.data?.prices?.products?.metadata?.type === 'premium'

  if (hasProPlan && requestCount.data > 400 || !hasProPlan && requestCount.data > 40) {
    return NextResponse.json({ error: 'You have reached your monthly chat request limit' }), { status: 500 }
  }

  // log chat request
  await supabase.from('chat_requests').insert({
    user_id: user.id,
  }).select('*')

  const response = await openai.chat.completions.create({
    model: hasProPlan ? 'gpt-4' : 'gpt-3.5-turbo',
    // model: 'gpt-4',
    stream: true,
    messages
  })
  const stream = OpenAIStream(response)
  return new StreamingTextResponse(stream)
}
