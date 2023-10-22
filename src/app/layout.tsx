import './globals.css'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
// import { MyUserContextProvider } from '@/lib/useUser'
import AuthProvider from '@/lib/useUser';

const inter = Inter({ subsets: ['latin'] })

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Senec AI - All your AI tools under a single subscription.',
  description: 'Writing emails, tweeting, writing blog posts, and more. All under a single subscription.',
}

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
      <head>
        <meta property="og:image" content="<generated>" />
        <meta property="og:image:type" content="<generated>" />
        <meta property="og:image:width" content="<generated>" />
        <meta property="og:image:height" content="<generated>" />
        <meta name="twitter:image" content="<generated>" />
        <meta name="twitter:image:type" content="<generated>" />
        <meta name="twitter:image:width" content="<generated>" />
        <meta name="twitter:image:height" content="<generated>" />
      </head>
      <body className={inter.className}>
        <AuthProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            {children}
            <Analytics />
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html >
  )
}
