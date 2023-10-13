import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { Database } from '../../../../types_db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false })
  }

  // @ts-ignore
  const { data, error } = await supabase.rpc('get_monthly_chat_request_count', {
    p_user_id: user.id,
  })

  if (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }), { status: 500 }
  }

  return NextResponse.json(data)
}