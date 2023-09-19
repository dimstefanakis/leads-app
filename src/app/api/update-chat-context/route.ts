import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import Papa from 'papaparse';

import { Database } from '../../../../types_db'

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { email, expertise, name, cold_email_example } = await request.json()

  const supabase = createRouteHandlerClient<Database>({ cookies })
  const user = await supabase.auth.getUser()

  if (!user.data.user?.id) {
    return NextResponse.json({ success: false })
  }

  const userContext = await supabase.from('chat_contexts').select('*').eq('user_id', user.data.user?.id).limit(1)


  if (userContext?.data && userContext?.data?.length > 0) {
    const response = await supabase.from('chat_contexts').update({
      email,
      area_of_expertise: expertise,
      name,
      cold_email_example
    }).eq('user_id', user.data.user?.id)

    if(response.error){
      console.log(response.error)
      return NextResponse.json({ success: false, message: response.error.message })
    }
  }else{
    const response = await supabase.from('chat_contexts').insert({
      email,
      area_of_expertise: expertise,
      name,
      cold_email_example,
      user_id: user.data.user?.id
    })

    if(response.error){
      console.log(response.error)
      return NextResponse.json({ success: false, message: response.error.message })
    }

  }

  return NextResponse.json({ success: true })
}
