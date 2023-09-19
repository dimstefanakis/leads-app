import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import Papa from 'papaparse';

import { Database } from '../../../../types_db'

export async function POST(request: Request) {
  // get file id from request
  const { fileId, workspaceId } = await request.json()

  const supabase = createRouteHandlerClient<Database>({ cookies })
  const contacts = await supabase.storage.from('contacts').download(fileId)
  const workspace = await supabase.from('workspaces').select('*').eq('id', workspaceId).limit(1)
  const { data: { user } } = await supabase.auth.getUser()
  if (!contacts || !workspace || !user) {
    return NextResponse.json({ success: false })
  }

  const contactData = await contacts.data?.text() as any;
  const contactColumns = contactData?.split('\n')[0].split(',')
  // const contactRows = contactData?.split('\n').slice(1)

  const data = [] as any[];
  Papa.parse(contactData, {
    header: true,
    step: function(row) {
      data.push(row.data);
    }
  });

  // check if there are contacts in workspace
  const response = await supabase.from('workspaces').update({
    contacts: JSON.parse(JSON.stringify(data)),
    columns: contactColumns,
  }).eq('id', workspaceId).select('*')
  return NextResponse.json(response) 
  // return NextResponse.json({ success: false })
}