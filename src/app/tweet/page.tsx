'use client'
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import { Loader2 } from "lucide-react";
import { useChat } from "ai/react";

function buildInitialMessages(exampleTweet1: string, exampleTweet2: string, exampleTweet3: string) {
  const initalMessages: { id: string; role: "function" | "system" | "user" | "assistant"; content: string; }[] = [
    {
      id: '1',
      role: 'system',
      content: 'You are an expert at creating short text content',
    },
    {
      id: '2',
      role: 'system',
      content: `
          1. Create a social media agnostic short post by using the information you get from the user
          2. Speak in a modern tone
          3. Response must be up to 260 characters
          4. Avoid using too many words like furthermore
          5. Be objective, but not neutral.
          6. Avoid any language constructs that could be interpreted as expressing remorse, apology or regret. This includes any phrases containing words like “sorry”, “apologies”, “regret” etc.
          7. Avoid excessive details and explanations. Keep it short and to the point.
          8. DONT use hashtags, for example #tag. DONT use emojis.
          9. Use new lines to separate sentences
          10. Match the tone of the example posts (if provided): ${exampleTweet1}, ${exampleTweet2}, ${exampleTweet3}
          `
    },
  ]

  return initalMessages;
}

function Tweet() {
  const [tweetingAbout, setTweetingAbout] = useState<string>('')
  const [exampleTweet1, setExampleTweet1] = useState<string>('')
  const [exampleTweet2, setExampleTweet2] = useState<string>('')
  const [exampleTweet3, setExampleTweet3] = useState<string>('')

  const { messages, setMessages, append, input, handleInputChange, handleSubmit, isLoading } = useChat({
    initialMessages: buildInitialMessages(exampleTweet1, exampleTweet2, exampleTweet3),
  })


  function onGenerateTweet() {
    setMessages(buildInitialMessages(exampleTweet1, exampleTweet2, exampleTweet3));
    append({
      id: (messages.length + 1).toString(),
      role: 'system',
      content: `Post about: ${tweetingAbout}`
    })
  }

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
        TweetBot
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
            Tweet
          </label>
          <Textarea
            placeholder="What do you want to tweet about?"
            value={tweetingAbout}
            onChange={(e) => setTweetingAbout(e.target.value)}
            className="mt-4 mb-8"
            rows={10}
          />
          <label>
            Examples
          </label>
          <p className="mt-2 text-sm text-gray-600">
            It's important to add some example tweets so that Senec can match the tone of your tweets.
          </p>
          <Textarea
            placeholder="Example tweet 1"
            value={exampleTweet1}
            onChange={(e) => setExampleTweet1(e.target.value)}
            className="mt-4"
            rows={5}
          />
          <Textarea
            placeholder="Example tweet 2"
            value={exampleTweet2}
            onChange={(e) => setExampleTweet2(e.target.value)}
            className="mt-4"
            rows={5}
          />
          <Textarea
            placeholder="Example tweet 3"
            value={exampleTweet3}
            onChange={(e) => setExampleTweet3(e.target.value)}
            className="mt-4"
            rows={5}
          />
          <Button onClick={onGenerateTweet} disabled={isLoading} className="mt-4 mb-8">
            Generate tweet
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
                value="Click generate and your tweet will appear here"
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

export default Tweet;