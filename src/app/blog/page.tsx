'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import { useChat } from "ai/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Plate, createPlugins } from '@udecode/plate-common';
import { createDeserializeMdPlugin } from '@udecode/plate-serializer-md';
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
import { createPlateUI } from "@/lib/create-plate-ui";

// const plugins: PlatePlugin[] = [
//   createParagraphPlugin(),
//   createBlockquotePlugin(),
//   createCodeBlockPlugin(),
//   createHeadingPlugin(),

//   createBoldPlugin(),
//   createItalicPlugin(),
//   createUnderlinePlugin(),
//   createStrikethroughPlugin(),
//   createCodePlugin(),
// ];

const plugins = createPlugins(
  [
    // Pick your plugins in https://platejs.org/?builder=true
    createParagraphPlugin(),
    createBlockquotePlugin(),
    createCodeBlockPlugin(),
    createHeadingPlugin(),

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
          5. Use up to 100 characters per text block
          6. Don't use too many different types, keep it simple
          7. Avoid using too many words like furthermore
          8. Be objective, but not neutral.
          9. Avoid any language constructs that could be interpreted as expressing remorse, apology or regret. This includes any phrases containing words like “sorry”, “apologies”, “regret” etc.
          10. Avoid excessive details and explanations. Keep it short and to the point.
          11. Result should only be the markdown without any other text.
          `
  },
]

// 11. Result should be a valid array of objects in the format specified above. Please only give me the result without any other text.

// Use the following format:
// {
//   type: 'h1' / 'h2' / 'h3' / 'h4' / 'h5' / 'h6' / 'p' / 'blockquote' / 'code_block' / 'code_syntax' / 'code_line' / 'strong' / 'em' / 's' / 'sub' / 'sup' / 'u' / 'hr' / 'bold' / 'code' / 'italic' / 'strikethrough' / 'comment' / 'a' / 'table' / 'th' / 'tr' / 'td',
//     children: [
//       {
//         text: 'Your content here',
//                 (optional key)[bold / code / italic / underline / kbd]: boolean(true / false),
//               },
//             ],
// id: Incrementing number,
//           }

// export const initialValue = [
//   {
//     type: 'h1',
//     children: [
//       {
//         text: '🌳 Blocks',
//       },
//     ],
//     id: '1',
//   },
//   {
//     type: 'p',
//     children: [
//       {
//         text: 'Easily create headings of various levels, from H1 to H6, to structure your content and make it more organized.',
//       },
//     ],
//     id: '2',
//   },
//   {
//     type: 'blockquote',
//     children: [
//       {
//         text: 'Create blockquotes to emphasize important information or highlight quotes from external sources.',
//       },
//     ],
//     id: '3',
//   },
//   {
//     type: 'code_block',
//     lang: 'javascript',
//     children: [
//       {
//         type: 'code_line',
//         children: [
//           {
//             text: '// Use code blocks to showcase code snippets',
//           },
//         ],
//       },
//       {
//         type: 'code_line',
//         children: [
//           {
//             text: 'function greet() {',
//           },
//         ],
//       },
//       {
//         type: 'code_line',
//         children: [
//           {
//             text: "  console.info('Hello World!');",
//           },
//         ],
//       },
//       {
//         type: 'code_line',
//         children: [
//           {
//             text: '}',
//           },
//         ],
//       },
//     ],
//     id: '4',
//   },
//   {
//     type: 'h1',
//     children: [
//       {
//         text: '🌱 Marks',
//       },
//     ],
//     id: '1',
//   },
//   {
//     type: 'p',
//     children: [
//       {
//         text: 'Add style and emphasis to your text using the mark plugins, which offers a variety of formatting options.',
//       },
//     ],
//     id: '2',
//   },
//   {
//     type: 'p',
//     children: [
//       {
//         text: 'Make text ',
//       },
//       {
//         text: 'bold',
//         bold: true,
//       },
//       {
//         text: ', ',
//       },
//       {
//         text: 'italic',
//         italic: true,
//       },
//       {
//         text: ', ',
//       },
//       {
//         text: 'underlined',
//         underline: true,
//       },
//       {
//         text: ', or apply a ',
//       },
//       {
//         text: 'combination',
//         bold: true,
//         italic: true,
//         underline: true,
//       },
//       {
//         text: ' of these styles for a visually striking effect.',
//       },
//     ],
//     id: '3',
//   },
//   {
//     type: 'p',
//     children: [
//       {
//         text: 'Add ',
//       },
//       {
//         text: 'strikethrough',
//         strikethrough: true,
//       },
//       {
//         text: ' to indicate deleted or outdated content.',
//       },
//     ],
//     id: '4',
//   },
//   {
//     type: 'p',
//     children: [
//       {
//         text: 'Write code snippets with inline ',
//       },
//       {
//         text: 'code',
//         code: true,
//       },
//       {
//         text: ' formatting for easy readability.',
//       },
//     ],
//     id: '5',
//   },
//   {
//     type: 'p',
//     children: [
//       {
//         text: 'Press ',
//       },
//       {
//         text: '⌘+B',
//         kbd: true,
//       },
//       {
//         text: ' to apply bold mark or ',
//       },
//       {
//         text: '⌘+I',
//         kbd: true,
//       },
//       {
//         text: ' for italic mark.',
//       },
//     ],
//     id: '6',
//   },
// ];

const initialValue = [
  {
    "type": "h1",
    "children": [
      {
        "text": "GPT-4: The Latest Evolution in AI"
      }
    ],
    "id": 1
  },
  {
    "type": "h2",
    "children": [
      {
        "text": "The Basics"
      }
    ],
    "id": 2
  },
  {
    "type": "p",
    "children": [
      {
        "text": "OpenAI's GPT-4 is the newest star in the AI universe."
      }
    ],
    "id": 3
  },
  {
    "type": "h3",
    "children": [
      {
        "text": "Key Features"
      }
    ],
    "id": 4
  },
  {
    "type": "blockquote",
    "children": [
      {
        "text": "GPT-4 is not just bigger, it's smarter."
      }
    ],
    "id": 5
  },
  {
    "type": "h4",
    "children": [
      {
        "text": "Under The Hood"
      }
    ],
    "id": 6
  },
  {
    "type": "code_block",
    "children": [
      {
        "text": "print('Hello, GPT-4!')"
      }
    ],
    "id": 7
  },
  {
    "type": "h5",
    "children": [
      {
        "text": "Applications"
      }
    ],
    "id": 8
  },
  {
    "type": "p",
    "children": [
      {
        "text": "From content creation to coding assistance, GPT-4 is a force multiplier."
      }
    ],
    "id": 9
  },
  {
    "type": "h6",
    "children": [
      {
        "text": "Final Thoughts"
      }
    ],
    "id": 10
  },
  {
    "type": "strong",
    "children": [
      {
        "text": "GPT-4 is a major leap in AI capabilities."
      }
    ],
    "id": 11
  },
  {
    "type": "em",
    "children": [
      {
        "text": "Don't miss out on exploring its potential."
      }
    ],
    "id": 12
  },
  {
    "type": "a",
    "children": [
      {
        "text": "Visit OpenAI for more details."
      }
    ],
    "id": 13
  },
  {
    "type": "hr",
    "children": [
      {
        "text": ""
      }
    ],
    "id": 14
  },
  {
    "type": "code_syntax",
    "children": [
      {
        "text": "import openai"
      }
    ],
    "id": 15
  },
  {
    "type": "code_line",
    "children": [
      {
        "text": "openai.api_key = 'YOUR_API_KEY'"
      }
    ],
    "id": 16
  },
  {
    "type": "s",
    "children": [
      {
        "text": "The future of language models is now."
      }
    ],
    "id": 17
  },
  {
    "type": "sub",
    "children": [
      {
        "text": "Note: Always ensure API limits."
      }
    ],
    "id": 18
  },
  {
    "type": "sup",
    "children": [
      {
        "text": "1"
      }
    ],
    "id": 19
  },
  {
    "type": "u",
    "children": [
      {
        "text": "Join the AI revolution with GPT-4!"
      }
    ],
    "id": 20
  },
  {
    "type": "table",
    "children": [
      {
        "text": "",
        "th": true
      },
      {
        "text": "Feature",
        "th": true
      },
      {
        "text": "Description",
        "th": true
      }
    ],
    "id": 21
  },
  {
    "type": "tr",
    "children": [
      {
        "text": "1",
        "td": true
      },
      {
        "text": "Versatility",
        "td": true
      },
      {
        "text": "Covers a wide array of tasks",
        "td": true
      }
    ],
    "id": 22
  },
  {
    "type": "tr",
    "children": [
      {
        "text": "2",
        "td": true
      },
      {
        "text": "Power",
        "td": true
      },
      {
        "text": "Handles complex requests",
        "td": true
      }
    ],
    "id": 23
  },
  {
    "type": "comment",
    "children": [
      {
        "text": "This post was generated with the help of GPT-4."
      }
    ],
    "id": 24
  }
]



function RichTextBlogGenerator() {
  const [debugValue, setDebugValue] = useState<Value>(initialValue);
  const { messages, setMessages, append, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: initalMessages,
  })
  const [currentValidValue, setCurrentValidValue] = useState<any>([]);

  function getCurrentValidValue(message: string) {
    try {
      // first check if we can close it early to display the message
      try {
        let tryingToCloseMessage = message;
        if (tryingToCloseMessage.charAt(tryingToCloseMessage.length - 1) === ',') {
          tryingToCloseMessage = tryingToCloseMessage.substring(0, tryingToCloseMessage.length - 1);
        }
        tryingToCloseMessage += ']';

        setCurrentValidValue(JSON.parse(tryingToCloseMessage));
        return JSON.parse(tryingToCloseMessage);
      } catch (e) {
        console.log('e', e);
      }
      // in this case just try to make it a valid array
      setCurrentValidValue(JSON.parse(message));
      return JSON.parse(message);
    } catch (e) {
      return currentValidValue;
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
                  <div key={m.id} className={`mt-${i == 0 ? '0' : '4'} bg-slate-${m.role == 'user' ? '200' : '100'} p-3 bg-secondary rounded text-sm whitespace-break-spaces`}>
                    {/* {m.role === 'user' ? 'User: ' : 'AI: '} */}
                    {m.role === 'assistant' ? (
                      // <Textarea value={m.content} placeholder="" className="min-h-[150px]" />
                      <Plate
                        // initialValue={getCurrentValidValue(m.content)}
                        // initialValue={m.content}
                        normalizeInitialValue
                        plugins={plugins}
                        onChange={(newValue) => {
                          setDebugValue(newValue);
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

                    ) : m.role == 'user' ? (
                      // <Textarea value={m.content} placeholder="" className="min-h-[50px]" />
                      m.content
                    ) : null}
                  </div>
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
