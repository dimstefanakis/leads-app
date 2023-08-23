import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { Database } from '../../../../types_db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase.from('contacts').select('*');
  return NextResponse.json(data)
}