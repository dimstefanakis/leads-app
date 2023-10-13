'use client'
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/useUser";
import { Button } from "../ui/button";

function Navbar({ noDash = false }: { noDash?: boolean }) {
  const router = useRouter();
  const { user } = useUser();

  return (
    <div className="w-full flex justify-between p-4 h-20">
      <Button variant="ghost"
        onClick={() => {
          router.push('/')
        }}
      >SENEC</Button>
      {!noDash && (
        <Button size="sm"
          onClick={() => {
            if (user) {
              router.push('/dashboard')
            } else {
              router.push('/signin')
            }
          }}
        >
          {user ? 'Dashboard' : 'Sign in'}
        </Button>

      )}
    </div>
  )
}

export default Navbar