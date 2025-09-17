// Sidebar component for dashboard navigation
'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  BookOpen,
  BarChart2,
  Globe,
  PlayCircle,
  MessageSquare,
  HelpCircle,
  UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/residency', icon: BookOpen, label: 'Residency' },
  { href: '/dashboard/lab', icon: BarChart2, label: 'Lab' },
  { href: '/dashboard/launchpad', icon: Globe, label: 'Launchpad' },
  { href: '/dashboard/alumni', icon: PlayCircle, label: 'Alumni' },
];

const bottomNavItems = [
  { href: '/dashboard/chat', icon: MessageSquare, label: 'Chat' },
  { href: '/dashboard/help', icon: HelpCircle, label: 'Help' },
  { href: '/dashboard/profile', icon: UserCircle, label: 'Profile' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside 
      className={cn(
        "flex flex-col py-6 bg-card border-r transition-all duration-300 ease-in-out group",
        isExpanded ? "w-64" : "w-20"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-center px-4 mb-8">
        <Link href="/dashboard" className="flex items-center">
          <Logo size="sm" showText={false} />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col items-center space-y-2 px-2">
        {navItems.map((item) => (
          <div key={item.href} className="relative w-full">
            <Button
              asChild
              variant="ghost"
              className={cn(
                "transition-all duration-200 flex items-center",
                isExpanded 
                  ? "w-full h-12 justify-start gap-3 px-4" 
                  : "w-12 h-12 justify-center p-0",
                pathname === item.href && 'bg-primary/10 text-primary'
              )}
            >
              <Link href={item.href} className="flex items-center gap-3">
                <item.icon className="h-5 w-5 shrink-0" />
                {isExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            </Button>
            
            {/* Tooltip for collapsed state */}
            {!isExpanded && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                {item.label}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="flex flex-col items-center space-y-2 px-2">
        {bottomNavItems.map((item) => (
          <div key={item.href} className="relative w-full">
            <Button
              asChild
              variant="ghost"
              className={cn(
                "transition-all duration-200 flex items-center",
                isExpanded 
                  ? "w-full h-12 justify-start gap-3 px-4" 
                  : "w-12 h-12 justify-center p-0",
                pathname === item.href && 'bg-primary/10 text-primary'
              )}
            >
              <Link href={item.href} className="flex items-center gap-3">
                <item.icon className="h-5 w-5 shrink-0" />
                {isExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            </Button>
            
            {/* Tooltip for collapsed state */}
            {!isExpanded && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                {item.label}
              </div>
            )}
          </div>
        ))}
        
        {/* User Avatar */}
        <div className={cn(
          "flex items-center pt-4 transition-all duration-200 w-full",
          isExpanded ? "gap-3 px-4 justify-start" : "justify-center"
        )}>
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {isExpanded && (
            <div className="flex flex-col opacity-100 animate-in fade-in slide-in-from-left-2 duration-200">
              <span className="text-sm font-medium">Founder</span>
              <span className="text-xs text-muted-foreground">Academy Member</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
