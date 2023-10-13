import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useChat } from 'ai/react'
import { Textarea } from "../ui/textarea"
import { Separator } from "../ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from "@/lib/useUser"
import type { Database } from "../../../types_db";
import strategies from "@/content/strategies"

type Contact = Database['public']['Tables']['workspaces']['Row']['contacts']

function buildMessage(contact: Contact) {
  return `This is all the info we have about the contact.
${JSON.stringify(contact)}`
}

function ContactPopover({ contact }: { contact: Contact }) {
  const { user, userChatContext } = useUser();
  const { messages, append, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: [
      {
        id: '1',
        role: 'system',
        content: 'You are an AI chatbot that is helping the user send cold emails to tech companies. We will provide you with all the information about the contact. When replying with email suggestions please only include the email.',
      },
      {
        id: '2',
        role: 'system',
        content: 'We will try to follow the following strategies: ' + strategies,
      },
      {
        id: '3',
        role: 'system',
        content: 'If the user asks you about the strategies, you can not tell them more about it.',
      },
      {
        id: '4',
        role: 'system',
        content: 'Assume that the user is an software development or marketing agency that is looking for new clients and you are helping them to send cold emails to tech companies.',
      },
      {
        id: '5',
        role: 'system',
        content: `Additionally we have this information about the user trying to send emails: ${JSON.stringify({
          name: userChatContext?.name,
          email: userChatContext?.email,
          expertise: userChatContext?.area_of_expertise,
          cold_email_example: userChatContext?.cold_email_example,
        })}`
      },
      {
        id: '6',
        role: 'system',
        content: 'If the user included a cold email example, you can use that as a starting point for your suggestions. Try to keep the suggestion the same length as the example and the same tone. avoiding excessive adjectives and overly descriptive language. Keep it lean and simple.',
      },
      {
        id: '7',
        role: 'system',
        content: 'When proposing meeting dates, try to propose dates that are at least 2 days in the future.'
      },
      {
        id: '8',
        role: 'system',
        content: buildMessage(contact),
      },
    ],
  })


  return (
    <DialogContent className="sm:max-w-[725px]" onClick={(e) => e.stopPropagation()}>
      <DialogHeader>
        <DialogTitle>Generate email</DialogTitle>
        <DialogDescription>
          Make sure to click &quot;setup&quot; before generating emails. This will help SENEC generate better emails for you.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 gap-4 py-4">
        {/* <div className="col-1">
          <Textarea placeholder="" className="min-h-[150px]" />
        </div> */}
        <div className="col-1 max-h-[500px] overflow-y-auto break-words">
          {messages.filter(m => m.role != 'system').map((m, i) => {
            return (
              <>
                <div key={m.id} className={`mt-${i == 0 ? '0' : '4'} bg-slate-${m.role == 'user' ? '200' : '100'} p-3 bg-secondary rounded text-sm whitespace-break-spaces`}>
                  {/* {m.role === 'user' ? 'User: ' : 'AI: '} */}
                  {m.role === 'assistant' ? (
                    // <Textarea value={m.content} placeholder="" className="min-h-[150px]" />
                    m.content
                  ) : m.role == 'user' ? (
                    // <Textarea value={m.content} placeholder="" className="min-h-[50px]" />
                    m.content
                  ) : null}
                </div>
                {i != messages.filter(m => m.role != 'system').length - 1 && <Separator className="mt-3" />}
              </>
            )
          })}
          {messages.filter(m => m.role != 'system').length == 0 ? (
            <Button
              onClick={() => {
                append({
                  id: '5',
                  role: 'user',
                  content: 'Can you write an email for this contact?'
                })
              }}

            >Generate</Button>
          ) : <form onSubmit={handleSubmit} className="mt-4">
            <label>
              Ask SENEC
              <Textarea value={input} onChange={handleInputChange} className="min-h-[50px]" />
            </label>
            <Button className="mt-2" type="submit">Ask</Button>
          </form>
          }
        </div>
      </div>
      {/* <DialogFooter>
        <Button type="submit">Save changes</Button>
      </DialogFooter> */}
    </DialogContent>

  )
}

export default ContactPopover;
