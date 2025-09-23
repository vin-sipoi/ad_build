// Sidebar component for dashboard navigation
'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading state or redirect to login if not authenticated
  if (loading) {
    return (
      <div className="w-16 md:w-64 bg-background border-r border-border p-4">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col py-6 bg-card border-r transition-all duration-300 ease-in-out group",
          // Desktop behavior
          "hidden md:flex md:h-screen md:sticky md:top-0",
          isExpanded ? "w-64" : "w-20",
          // Mobile behavior
          "fixed top-0 left-0 h-screen z-50",
          isMobileMenuOpen ? "flex w-64" : "hidden md:flex"
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Main Navigation */}
        <nav className="flex-1 flex flex-col items-center space-y-2 px-2">
          {navItems.map((item) => (
            <div key={item.href} className="relative w-full">
              <Button
                asChild
                variant="ghost"
                className={cn(
                  "transition-all duration-200 flex items-center",
                  (isExpanded || isMobileMenuOpen)
                    ? "w-full h-12 justify-start gap-3 px-4"
                    : "w-12 h-12 justify-center p-0",
                  pathname === item.href && 'bg-primary/10 text-primary'
                )}
              >
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 shrink-0" />
                  {(isExpanded || isMobileMenuOpen) && (
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </Link>
              </Button>

              {/* Tooltip for collapsed state */}
              {!isExpanded && !isMobileMenuOpen && (
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
                  (isExpanded || isMobileMenuOpen)
                    ? "w-full h-12 justify-start gap-3 px-4"
                    : "w-12 h-12 justify-center p-0",
                  pathname === item.href && 'bg-primary/10 text-primary'
                )}
              >
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 shrink-0" />
                  {(isExpanded || isMobileMenuOpen) && (
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </Link>
              </Button>

              {/* Tooltip for collapsed state */}
              {!isExpanded && !isMobileMenuOpen && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </div>
          ))}

          {/* User Avatar */}
          <div className={cn(
            "flex items-center pt-4 transition-all duration-200 w-full",
            (isExpanded || isMobileMenuOpen) ? "gap-3 px-4 justify-start" : "justify-center"
          )}>
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || user.email || 'User'} />
              <AvatarFallback>
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {(isExpanded || isMobileMenuOpen) && (
              <div className="flex flex-col opacity-100 animate-in fade-in slide-in-from-left-2 duration-200">
                <span className="text-sm font-medium">
                  {user.displayName || user.email?.split('@')[0] || 'User'}
                </span>
                <span className="text-xs text-muted-foreground">Academy Member</span>
              </div>
            )}
          </div>

          {/* Logout Button */}
          {(isExpanded || isMobileMenuOpen) && (
            <div className="w-full px-2 pt-2">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full h-10 justify-start gap-3 px-4 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="text-sm">Sign Out</span>
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
