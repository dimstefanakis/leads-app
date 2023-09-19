import './globals.css'
import type { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
// import { MyUserContextProvider } from '@/lib/useUser'
import AuthProvider from '@/lib/useUser';

const inter = Inter({ subsets: ['latin'] })

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html >
  )
}
