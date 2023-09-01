import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { Database } from '../../../../types_db'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(request: Request) {
  // get file id from request
  const { fileId } = await request.json()
  console.log(fileId, 'fileId');

  const supabase = createRouteHandlerClient<Database>({ cookies })
  const contacts = await supabase.storage.from('contacts').download(fileId)

  if (!contacts) {
    return NextResponse.json({ success: false })
  }

  const contactData = await contacts.data?.text();
  console.log(contactData, contacts, 'contactData');
  const contactColumns = contactData?.split('\n')[0].split(',')
  const contactRows = contactData?.split('\n').slice(1)

  const data = contactRows?.map((row) => {
    const contact = row.split(',')
    return contactColumns?.reduce((acc, column, index) => {
      return {
        ...acc,
        [column]: contact[index]
      }
    }, {})
  })

  // const { data: { user } } = await supabase.auth.getUser()

  const insertedContacts = {
    contacts: data,
  }

  if(data){
    await supabase.from('contacts').insert({
      data: JSON.parse(JSON.stringify(insertedContacts)),
      columns: contactColumns,
    })
  }

  console.log('data');

  return NextResponse.json(data)
}