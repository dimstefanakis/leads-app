'use client'
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import { useChat } from "ai/react";

const initalMessages: { id: string; role: "function" | "system" | "user" | "assistant"; content: string; }[] = [
  {
    id: '1',
    role: 'system',
    content: 'You are an email communication expert AI that is helping the user send emails',
  },
  {
    id: '2',
    role: 'system',
    content: `
          1. Be concise
          2. Create the email by slightly extending the bullet points provided and sewing them together so there is flow in the email
          3. Speak in a modern tone
          4. If a reply is included, match the replies tone
          5. Avoid using too many words like furthermore
          6. Be objective, but not neutral.
          7. Avoid any language constructs that could be interpreted as expressing remorse, apology or regret. This includes any phrases containing words like “sorry”, “apologies”, “regret” etc.
        `
  },
]

function Johnny() {
  const inputRefs = useRef<
    HTMLInputElement[] | []
  >([]);
  const [replyingTo, setReplyingTo] = useState<string>('')
  const [bulletPoints, setBulletPoints] = useState<string[]>([])

  const { messages, setMessages, append, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: initalMessages,
  })

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && index === bulletPoints.length - 1) {
      setBulletPoints([...bulletPoints, '']);
    }
  }

  const handleBulletInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newBulletPoints = [...bulletPoints];
    newBulletPoints[index] = e.target.value;
    setBulletPoints(newBulletPoints);
  }

  function onGenerateEmail() {
    setMessages(initalMessages);
    const email = `
      Replying to: ${replyingTo}
      Reply bullet points: ${bulletPoints.map((bulletPoint) => (
      `${bulletPoint}`
    ))}
    `
    append({
      id: (messages.length + 1).toString(),
      role: 'system',
      content: email
    })
  }

  useEffect(() => {
    if (bulletPoints.length > 0) {
      inputRefs.current[bulletPoints.length - 1].focus();
    }
  }, [bulletPoints]);

  useEffect(() => {
    if (bulletPoints.length === 0) {
      setBulletPoints(['']);
    }
  }, []);


  return (
    <div className="flex 
      flex-col
      items-center
      justify-center
      w-full">
      <h1 className="text-3xl font-bold mb-4
        w-full
        mt-12
        max-w-screen-lg
        md:max-w-screen-sm">
        Johnny
      </h1>

      <div className="
        w-full
        mt-12
        max-w-screen-lg
        md:max-w-screen-sm
        grid
        grid-cols-2
        gap-4
        ">
        <div
          className="col-span-1"
        >
          <label>
            Replying to
          </label>
          <Textarea
            placeholder="Paste the email you are replying to here..."
            value={replyingTo}
            onChange={(e) => setReplyingTo(e.target.value)}
            className="mt-4 mb-8"
            rows={10}
          />
          <label>
            Email bullet points
          </label>
          {bulletPoints.map((bulletPoint, index) => (
            <Input
              key={index}
              ref={el => {
                if (el) {
                  inputRefs.current[index] = el;
                }
              }}
              placeholder="Enter bullet point here..."
              value={bulletPoint}
              onChange={(e) => handleBulletInputChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={index === 0 ? 'mt-4' : 'mt-2'}
            />
          ))}
          <Button onClick={onGenerateEmail} className="mt-4">Generate email</Button>
        </div>
        <div
          className="col-span-1"
        >
          {messages.filter(m => m.role != 'system').length == 0 ? (
            <>
              <label>
                Response
              </label>
              <Textarea
                disabled
                value="Johnny is an email communication expert AI that is helping the user send emails"
                className="min-h-[150px] mt-4"
                rows={10}
              >
              </Textarea>
            </>
          ) : (
            <>
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
              <form onSubmit={handleSubmit} className="mt-4">
                <label>
                  Ask KAME
                </label>
                <Input
                  placeholder="Chat with AI here..."
                  value={input}
                  onChange={handleInputChange}
                  className="my-4"
                />
                <Button type="submit">Ask</Button>
              </form></>
          )}
        </div>
      </div>
    </div>
  )
}

export default Johnny;