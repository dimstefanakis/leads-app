import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { Database } from '../../../../types_db'

export const dynamic = 'force-dynamic'

export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  const { workspaceId, oldColName, newColName } = await request.json()

  if (!user || !oldColName || !newColName) {
    return NextResponse.json({ success: false })
  }
  const workspace = await supabase.from('workspaces').select('*').eq('id', workspaceId).eq('user_id', user.id)

  if (!workspace.data) {
    return NextResponse.json({ success: false })
  }

  const contacts = workspace?.data[0]?.contacts
  const columns = workspace?.data[0]?.columns

  const updatedContacts = contacts?.map((contact) => {
    const updatedContact = { ...JSON.parse(JSON.stringify(contact)) }
    updatedContact[newColName] = updatedContact[oldColName]
    delete updatedContact[oldColName]
    return updatedContact
  })

  const oldColIndex = columns?.indexOf(oldColName)

  const updatedColumns = columns?.map((col, index) => {
    if (index === oldColIndex) {
      return newColName
    }
    return col
  })

  const { data: response, error } = await supabase
    .from('workspaces')
    .update({
      contacts: updatedContacts,
      columns: updatedColumns,
    })
    .eq('id', workspaceId)
    .eq('user_id', user.id)
    .select('*')

  if (error) {
    return NextResponse.json({ success: false })
  }

  return NextResponse.json({
    success: true,
    data: response[0],
  })
}