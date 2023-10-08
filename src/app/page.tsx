'use client';
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation';
import { ArrowRightIcon, TwitterIcon, MailIcon, MailsIcon, TextIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardTitle, CardFooter, CardDescription, CardHeader } from '@/components/ui/card';
import { NavBar } from '@/components/navbar'
import Pricing from '@/components/pricing';
import { Inter } from 'next/font/google'

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function Home() {
  const router = useRouter();
  return (
    <main>
      <div className="w-full flex justify-center">
        <div className="flex flex-col w-full items-center">
          <div className="w-full flex justify-between absolute top-0 left-0 p-4 h-20">
            <span>SENEC</span>
            <Button size="sm"
              onClick={() => {
                router.push('/signin')
              }}
            >Login</Button>
          </div>

          <div className="max-w-screen-xl text-center mt-36 sm:mt-48">
            <Badge variant="secondary" className="rounded-lg mb-6 cursor-pointer"
              onClick={() => {
                // mail
                window.open('mailto:jim@senec.ai?subject=Senec AI Application&body=Hi Jim, I would like to apply for a personal AI tool.')
              }}
            >
              Need a personal AI tool? Apply here <ArrowRightIcon className="ml-1" size={16} />
            </Badge>
            <h1 className="leading-tight sm:leading-none font-extrabold text-7xl tracking-tighter">
              All your AI tools<br />Under a single subscription.
            </h1>
          </div>
          <h3 className="text-xl text-center max-w-xl my-8 text-muted-foreground">
            Writing emails, tweeting, writing blog posts, and more. All under a single subscription.
          </h3>
          <div className="flex max-w-7xl justify-center items-center w-full">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 my-20">
              <Card className="w-[380px]">
                <CardHeader>
                  <CardTitle className="flex">
                    <TwitterIcon className="mr-2" />
                    Tweet Generator
                  </CardTitle>
                  <CardDescription>
                    Create natural sounding tweets that match your tone.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <ol className="list-disc ml-2">
                    <li>Enter what you want to tweet about</li>
                    <li>Enter some example tweets</li>
                    <li>Click generate</li>
                  </ol>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => {
                    router.push('/tweet')
                  }}>
                    Try it out
                  </Button>
                </CardFooter>
              </Card>
              <Card className="w-[380px]">
                <CardHeader>
                  <CardTitle className="flex">
                    <MailIcon className="mr-2" />
                    Email Generator
                  </CardTitle>
                  <CardDescription>
                    Create a reply for your next email.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <ol className="list-disc ml-2">
                    <li>Enter the email you are replying to</li>
                    <li>Enter some bullet points that you want to include in your email</li>
                    <li>Click generate</li>
                  </ol>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => {
                    router.push('/email')
                  }}>
                    Try it out
                  </Button>
                </CardFooter>
              </Card>
              <Card className="w-[380px]">
                <CardHeader>
                  <CardTitle className="flex">
                    <MailsIcon className="mr-2" />
                    Cold Email Generator
                  </CardTitle>
                  <CardDescription>
                    Import your contacts and generate cold emails for your tech / marketing agency.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <ol className="list-disc ml-2">
                    <li>Import your contacts</li>
                    <li>Click on a contact</li>
                    <li>Enter some context about your company</li>
                    <li>Click generate</li>
                  </ol>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => {
                    router.push('/contacts')
                  }}>
                    Try it out
                  </Button>
                </CardFooter>
              </Card>
              <Card className="w-[380px]">
                <CardHeader>
                  <CardTitle className="flex">
                    <TextIcon className="mr-2" />
                    Blog Generator
                  </CardTitle>
                  <CardDescription>
                    Create a blog post for your next blog post.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <ol className="list-disc ml-2">
                    <li>Write what you want to talk about</li>
                    <li>Click generate</li>
                  </ol>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => {
                    router.push('/blog')
                  }}>
                    Try it out
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
          <div className="max-w-6xl w-full my-4">
            <h1
              className="leading-tight sm:leading-none font-extrabold text-center text-6xl tracking-tighter mb-12"
            >
              Pricing
            </h1>
            <Pricing />
          </div>

          {/* <div className="flex w-full justify-center">
            <Button size="lg" onClick={() => {
              router.push('/signin')
            }}
            >Get started</Button>
            <Button size="lg" variant="outline" className="ml-2"
              onClick={() => {
                window.open('https://www.youtube.com/watch?v=6zz5_tBCg0A', '_blank')
              }}
            >Watch video</Button>
          </div>
          <div className="w-full my-12 flex justify-center">
            <ReactPlayer url="https://www.youtube.com/watch?v=6zz5_tBCg0A" />
          </div> */}
        </div>
      </div>
      {/* <NavBar /> */}
    </main>
  )
}
