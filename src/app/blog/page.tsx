'use client';

import { useState, useRef, useEffect } from "react";
import remark from 'remark';
import remarkToSlate from 'remark-slate';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import { useChat } from "ai/react";
import { createPlateEditor, useReplaceEditor } from '@udecode/plate-common';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Plate, createPlugins } from '@udecode/plate-common';
import { createDeserializeMdPlugin, deserializeMd } from '@udecode/plate-serializer-md';
import { Editor } from '@/components/plate-ui/editor';
import {
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { createBlockquotePlugin } from '@udecode/plate-block-quote';
import { createCodeBlockPlugin } from '@udecode/plate-code-block';
import { PlatePlugin, Value } from '@udecode/plate-common';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { createListPlugin } from "@udecode/plate-list";
import { createPlateUI } from "@/lib/create-plate-ui";


const plugins = createPlugins(
  [
    // Pick your plugins in https://platejs.org/?builder=true
    createParagraphPlugin(),
    createBlockquotePlugin(),
    createCodeBlockPlugin(),
    createHeadingPlugin(),
    createListPlugin(),
    createBoldPlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createStrikethroughPlugin(),
    createCodePlugin(),
    createDeserializeMdPlugin(),
  ],
  {
    // Pick your components in https://platejs.org/?builder=true
    components: createPlateUI(),
  }
);

const initalMessages: { id: string; role: "function" | "system" | "user" | "assistant"; content: string; }[] = [
  {
    id: '1',
    role: 'system',
    content: 'You are an blog content expert AI that is helping the user create a blog post',
  },
  {
    id: '2',
    role: 'system',
    content: `
          1. Be concise
          2. Create the blog post by slightly extending the bullet points provided and sewing them together so there is flow in the blog post
          3. Speak in a modern tone
          4. Write it in markdown
          5. You can use all the markdown features
          6. Avoid using too many words like furthermore
          7. Be objective, but not neutral.
          8. Result should only be the markdown without any other text.
          9. Write it in a modern tone. Use transition words. Use active voice. 
            Write over 1000 words. Use very creative titles for the blog post. Add a title for each section. 
            Ensure there are a minimum of 9 sections. Each section should have a minimum of two paragraphs.
            Create a good slug for this post and a meta description with a maximum of 100 words and add it to the end of the blog post.
          `
  },
]

const editor = createPlateEditor({ plugins });


function RichTextBlogGenerator() {
  const [debugValue, setDebugValue] = useState<Value>();
  const { messages, isLoading, setMessages, append, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: initalMessages,
  })
  const [key, setKey] = useState(1);
  const [currentValidValue, setCurrentValidValue] = useState<any>([]);
  const [finishedLoadingMessages, setFinishedLoadingMessages] = useState<any[]>([]);

  useEffect(() => {
    console.log('messages', messages);
    setKey(key + 1);
  }, [messages])

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role == 'assistant') {
        setFinishedLoadingMessages((prev) => [...prev, lastMessage.id]);
      }
    }
  }, [messages, isLoading])

  function getContent(content: string) {
    // console.log('ref.current', editor);
    // editor.onChange = (newValue) => {
    //   console.log('newValue', newValue);
    //   setCurrentValidValue(newValue);
    // }
    try {
      const value = deserializeMd(editor, content)
      console.log('value', value);
      if (value[value.length - 1].length == 0) {
        value[value.length - 1] = [{
          type: 'p',
          children: [{
            text: ''
          }]
        }]
      } else if (value[value.length - 1].children.length == 0) {
        value[value.length - 1].children = [{
          text: ''
        }]
      }

      if (value.length > 1) {
        value.pop();
      }
      // setDebugValue(value);
      return value
      // return value
    } catch (e) {
      console.log('e', e);
      return [{
        type: 'p',
        children: [{
          text: content
        }]
      }]
    }
  }

  console.log('currentValidValue', messages, currentValidValue);

  return (
    <div className="flex 
      flex-col
      items-center
      justify-center
      w-full">
      <div
        className="
        w-full
        mt-12
        max-w-screen-lg
        md:max-w-screen-sm
        "
      >
        <form onSubmit={handleSubmit}>
          <label>
            Some words about what you want to write about
          </label>
          <Textarea
            className="w-full mb-4 mt-4"
            value={input}
            onChange={handleInputChange}
            rows={10}
            placeholder={
              `Write a short sentence about what you want to write about. You can also include a list of key points, for example:
- ChatGPT is a chatbot that knows everything
- It's the faster growing platform in the world
- It's now one of the most popular chatbots in the world
            `
            }
          >
          </Textarea>
          <Button
            className="mb-4"
            type="submit"
          >
            Create Blog Post
          </Button>
        </form>

        {messages.filter(m => m.role != 'system').length > 0 && (
          <>
            {messages.filter(m => m.role != 'system').map((m, i) => {
              return (
                <>
                  {m.role == 'assistant' ? (
                    <>
                      <Plate
                        key={finishedLoadingMessages.includes(m.id) ? m.id : key}
                        initialValue={
                          getContent(m.content)
                        }
                        value={
                          getContent(m.content)
                        }
                        // normalizeInitialValue
                        plugins={plugins}
                        onChange={(newValue) => {
                          setDebugValue(newValue);
                          console.log(debugValue)
                          // save newValue...
                        }}
                      >
                        <Editor
                          placeholder="Click generate to generate a blog post"
                        />
                        {/* <Accordion type="single" collapsible>
                          <AccordionItem value="manual-installation">
                            <AccordionTrigger>Debug Value</AccordionTrigger>
                            <AccordionContent>{JSON.stringify(debugValue)}</AccordionContent>
                          </AccordionItem>
                        </Accordion> */}
                      </Plate>
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
                      </form>

                    </>
                  ) : m.role == 'user' ? (
                    // <Textarea value={m.content} placeholder="" className="min-h-[50px]" />
                    <div key={m.id} className={`mt-${i == 0 ? '0' : '4'} bg-slate-${m.role == 'user' ? '200' : '100'} p-3 bg-secondary rounded text-sm whitespace-break-spaces`}>
                      {m.content}
                    </div>
                  ) : null}
                  {i != messages.filter(m => m.role != 'system').length - 1 && <Separator className="mt-3" />}
                </>
              )
            })}
          </>
        )}
      </div>
    </div>

  )
}

export default RichTextBlogGenerator;
