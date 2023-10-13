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
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const requestUrl = new URL(request.url)
  requestUrl.pathname = '/contacts'
  const { email, password } = await request.json()
  // const supabase = createRouteHandlerClient<Database>({ cookies })

  try {
    let response = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (response.error) {
      return NextResponse.json({ error: response.error }, { status: 500 })
    }

    await supabase.from('workspaces').insert({
      contacts: [],
      columns: [],
      user_id: response.data.user.id,
    }).select('*')

    return NextResponse.json(response.data)

  } catch (err) {
    console.log(err)
    return NextResponse.redirect('/auth/sign-up', { status: 500 })
  }
}