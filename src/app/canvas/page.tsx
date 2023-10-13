'use client'
import { useState, useEffect, useRef } from "react";
import { Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import { useChat } from "ai/react";
import Navbar from "@/components/navbar";

const initalMessages: { id: string; role: "function" | "system" | "user" | "assistant"; content: string; }[] = [
  {
    id: '1',
    role: 'system',
    content: 'You are a lean model canvas expert AI that is helping the user create a lean model canvas',
  },
  {
    id: '2',
    role: 'system',
    content: `
          1. Create a lean model canvas by using the information you get from the user
          2. Speak in a modern tone
          3. Avoid using too many words like furthermore
          4. Be objective, but not neutral.
          5. Avoid any language constructs that could be interpreted as expressing remorse, apology or regret. This includes any phrases containing words like “sorry”, “apologies”, “regret” etc.
          6. Ensure that the user has a clear understanding of the problem they are trying to solve
          7. Only include the canvas in the response and no other text
          8. Don't use any formatting, just pure text
        `
  },
]

function Canvas() {
  const [prompt, setPrompt] = useState<string>('')

  const { messages, setMessages, append, input, handleInputChange, isLoading, handleSubmit } = useChat({
    initialMessages: initalMessages,
  })

  function onGenerateCanvas() {
    setMessages(initalMessages);
    append({
      id: (messages.length + 1).toString(),
      role: 'system',
      content: `
        Business idea: ${prompt}
      `
    })
  }

  return (
    <>
      <Navbar />
      <div className="flex 
      flex-col
      items-center
      justify-center
      w-full">
        {/* <h1 className="text-3xl font-bold mb-4
        w-full
        mt-12
        max-w-screen-lg
        md:max-w-screen-sm">
        Lean Model Canvas
      </h1> */}

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
              Business Idea
            </label>
            <Textarea
              placeholder="Talk a bit about your business idea, feel free to include advantages you may have over competitors, etc"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-4"
              rows={10}
            />
            <Button onClick={onGenerateCanvas} className="mt-4" disabled={isLoading}>
              Generate Canvas
              {isLoading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
            </Button>
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
                  value="Your canvas will appear here..."
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
                    Ask SENEC
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
    </>
  )
}

export default Canvas;