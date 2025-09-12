'use client';

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import ThemeToggle from '@/components/ThemeToggle'

interface AppShellProps {
  children: React.ReactNode
}

const nav = [
  { href: '/', label: 'Chat' },
  { href: '/#files', label: 'Files' },
  { href: '/#preview', label: 'Preview' },
]

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-dvh grid grid-cols-1 lg:grid-cols-[240px_1fr] bg-[radial-gradient(40%_50%_at_50%_0%,oklch(0.98_0.02_250)_0%,transparent_60%),linear-gradient(to_bottom,oklch(0.1_0.03_250),oklch(0.15_0.02_250))] dark:bg-[radial-gradient(40%_50%_at_50%_0%,oklch(0.3_0.08_260)_0%,transparent_60%),linear-gradient(to_bottom,oklch(0.15_0.03_260),oklch(0.1_0.02_260))]">
      <aside className="hidden lg:flex flex-col gap-4 p-4 border-r border-white/10 bg-white/60 dark:bg-neutral-900/50 backdrop-blur-md">
        <Link href="/" className="font-semibold tracking-tight text-sm rounded-xl px-3 py-2 bg-black/5 dark:bg-white/5">
          SiteSmith
          <span className="ml-2 text-[10px] uppercase opacity-60">by you</span>
        </Link>
        <nav className="flex flex-col text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-lg px-3 py-2 transition-colors',
                pathname === item.href ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 hover:dark:bg-white/10'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <ThemeToggle />
        </div>
      </aside>
      <main className="flex flex-col">{children}</main>
    </div>
  )
}
