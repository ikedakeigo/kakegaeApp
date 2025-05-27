"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  Calendar, 
  Plus, 
  BarChart2, 
  Bell, 
  User,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function Navigation() {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [open, setOpen] = useState(false)

  if (pathname === '/login' || pathname === '/signup' || loading) {
    return null
  }

  const routes = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      active: pathname === '/'
    },
    {
      href: '/calendar',
      label: 'Calendar',
      icon: Calendar,
      active: pathname === '/calendar'
    },
    {
      href: '/stats',
      label: 'Stats',
      icon: BarChart2,
      active: pathname === '/stats'
    },
    {
      href: '/notifications',
      label: 'Notifications',
      icon: Bell,
      active: pathname === '/notifications'
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: User,
      active: pathname === '/profile'
    }
  ]

  // Only show if user is logged in
  if (!user) {
    return null
  }

  return (
    <>
      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t sm:hidden">
        <div className="flex items-center justify-around h-16">
          {routes.slice(0, 3).map((route) => (
            <Link 
              key={route.href} 
              href={route.href} 
              className={cn(
                "flex flex-col items-center justify-center w-full h-full text-muted-foreground transition-colors",
                route.active && "text-primary"
              )}
            >
              <route.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{route.label}</span>
            </Link>
          ))}
          <Link 
            href="/new" 
            className="flex flex-col items-center justify-center w-full h-full text-primary"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full">
              <Plus className="w-5 h-5" />
            </div>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="w-full h-full rounded-none">
                <Menu className="w-5 h-5" />
                <span className="text-xs mt-1">More</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[50vh]">
              <div className="flex flex-col space-y-4 mt-8">
                {routes.slice(3).map((route) => (
                  <Link 
                    key={route.href} 
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center p-3 rounded-md hover:bg-accent",
                      route.active && "bg-accent"
                    )}
                  >
                    <route.icon className="w-5 h-5 mr-3" />
                    <span>{route.label}</span>
                  </Link>
                ))}
                <ThemeToggle />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden sm:flex h-16 border-b sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Link href="/" className="font-bold text-xl mr-8">GrowthSnap</Link>
            <nav className="flex items-center space-x-1">
              {routes.map((route) => (
                <Link 
                  key={route.href} 
                  href={route.href} 
                  className={cn(
                    "px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors",
                    route.active && "bg-accent text-foreground"
                  )}
                >
                  <route.icon className="w-5 h-5 inline-block mr-2" />
                  {route.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button asChild>
              <Link href="/new">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}