import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import type { Database } from '../../../../types_db'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const { email, password } = await request.json()
  // const supabase = createRouteHandlerClient<Database>({ cookies })

  await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  return NextResponse.redirect(requestUrl.origin, {
    status: 301,
  })
}