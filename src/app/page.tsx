'use client';
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { NavBar } from '@/components/navbar'
import { Inter } from 'next/font/google'

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function Home() {
  const router = useRouter();
  return (
    <main>
      <div className="w-full h-screen flex justify-center">
        <div className="flex flex-col w-full items-center">
          <div className="w-full flex justify-between absolute top-0 left-0 p-4 h-20">
            <span>KAMEMAIL</span>
            <Button size="sm"
              onClick={() => {
                router.push('/signin')
              }}
            >Login</Button>
          </div>

          <h1 className="leading-tight	sm:leading-none font-extrabold text-7xl max-w-screen-xl text-center tracking-tighter mt-36 sm:mt-48">
            Send <span className="text-white bg-black	pl-3 pr-5">10x</span> more emails in <span className="text-white bg-black	pl-3 pr-5">1/10th</span> of the time.
          </h1>
          <h3 className="text-xl text-center max-w-xl my-8 text-muted-foreground">
            Specifically designed for marketing and web development agencies.
          </h3>
          <div className="flex w-full justify-center">
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
          </div>
        </div>
      </div>
      {/* <NavBar /> */}
    </main>
  )
}
