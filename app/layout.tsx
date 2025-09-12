import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { SandboxState } from '@/components/modals/sandbox-state'
import { Toaster } from '@/components/ui/sonner'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import './globals.css'
import AppShell from '@/components/shell/app-shell'

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

        <NuqsAdapter><AppShell>{children}</AppShell></NuqsAdapter>
        <Toaster />
        <SandboxState />
      </body>
    </html>
  )
}
