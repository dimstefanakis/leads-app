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
import type { Database } from "../../../types_db";
import strategies from "@/content/strategies"

type Contact = Database['public']['Tables']['workspaces']['Row']['contacts']

function buildMessage(contact: Contact) {
  return `This is all the info we have about the contact.
${JSON.stringify(contact)}`
}

function ContactPopover({ contact }: { contact: Contact }) {
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
        content: 'Assume that the user is an software development agency that is looking for new clients and you are helping them to send cold emails to tech companies.',
      },
      {
        id: '5',
        role: 'system',
        content: buildMessage(contact),
      },
    ],
  })


  return (
    <DialogContent className="sm:max-w-[725px]">
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>
          Make changes to your profile here. Click save when youre done.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="col-1">
          <Textarea placeholder="" className="min-h-[150px]" />
        </div>
        <div className="col-2 max-h-[500px] overflow-y-auto break-words">
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
              Ask Senec
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
