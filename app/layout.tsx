import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { SandboxState } from '@/components/modals/sandbox-state'
import { Toaster } from '@/components/ui/sonner'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import './globals.css'

import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: 'Vercel Vibe Coding Agent',
  description: '',
}

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
<header className=\"navbar\"><div className=\"container inner\" style={{display:'flex',alignItems:'center',gap:'1rem',padding:'.8rem 0'}}><div className=\"brand\" style={{fontWeight:700}}>Vibe</div><nav style={{marginLeft:'auto',display:'flex',gap:'.5rem',alignItems:'center'}}><a href=\"/\" aria-current=\"page\">Home</a><a href=\"/projects\">Projects</a><a href=\"/about\">About</a><ThemeToggle/></nav></div></header>
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster />
        <SandboxState />
      </body>
    </html>
  )
}
