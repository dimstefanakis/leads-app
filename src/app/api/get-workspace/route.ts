import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { Database } from '../../../../types_db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  // get latest workspace
  const { data } = await supabase.from('workspaces').select('*').order('created_at', { ascending: false }).limit(1);
  if(!data){
    return NextResponse.json({ success: false })
  }
  return NextResponse.json(data[0])
}