import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { Database } from '../../../../types_db'


export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false })
  }
  
  const response = await supabase.from('workspaces').insert({
    contacts: [],
    columns: [],
    user_id: user.id,
  }).select('*')

  return NextResponse.json(response.data)
}