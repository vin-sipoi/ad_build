'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  Settings,
  FileText,
  BarChart3,
  Menu,
  X,
  LogOut,
  User,
  ChevronRight
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AdminUserData {
  uid: string;
  email: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUserData | null>(null);
  const pathname = usePathname();

  // Fetch admin user data
  React.useEffect(() => {
    const fetchAdminUser = async () => {
      try {
        const response = await fetch('/api/admin/me');
        if (response.ok) {
          const data = await response.json();
          setAdminUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch admin user:', error);
      }
    };
    
    fetchAdminUser();
  }, []);

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 shadow-lg bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`group fixed md:sticky top-0 left-0 z-50 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-shrink-0 transform transition-all duration-300 ease-in-out shadow-xl md:shadow-none ${
          isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'
        } md:translate-x-0 md:w-20 md:hover:w-72 lg:w-72 flex flex-col`}
      >
        {/* Logo Section with Gradient */}
        <div className="relative p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex-shrink-0 p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0 transition-all duration-300 md:group-hover:opacity-100 md:group-hover:translate-x-0 lg:opacity-100 lg:translate-x-0 md:opacity-0 md:-translate-x-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Manage your platform
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            <NavItem icon={<LayoutDashboard className="h-5 w-5" />} href="/admin">
              Dashboard
            </NavItem>
            <NavItem icon={<BookOpen className="h-5 w-5" />} href="/admin/courses">
              Courses
            </NavItem>
            <NavItem icon={<FileText className="h-5 w-5" />} href="/admin/topics">
              Topics
            </NavItem>
            <NavItem icon={<GraduationCap className="h-5 w-5" />} href="/admin/lessons">
              Lessons
            </NavItem>
            <NavItem icon={<Users className="h-5 w-5" />} href="/admin/users">
              Users
            </NavItem>
            <NavItem icon={<ShieldCheck className="h-5 w-5" />} href="/admin/mentor-applications">
              Applications
            </NavItem>
            <NavItem icon={<BarChart3 className="h-5 w-5" />} href="/admin/analytics">
              Analytics
            </NavItem>
            <NavItem icon={<Settings className="h-5 w-5" />} href="/admin/settings">
              Settings
            </NavItem>
          </div>
        </nav>

        {/* User Profile Section at Bottom */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-blue-500/20">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminUser?.email || 'Admin')}&background=3b82f6&color=fff`} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs">
                    {adminUser?.email?.substring(0, 2).toUpperCase() || 'AD'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0 transition-all duration-300 md:group-hover:opacity-100 md:group-hover:translate-x-0 lg:opacity-100 lg:translate-x-0 md:opacity-0 md:-translate-x-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {adminUser?.email?.split('@')[0] || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {adminUser?.email || 'Loading...'}
                  </p>
                  {adminUser?.isSuperAdmin && (
                    <span className="inline-flex items-center px-1.5 py-0.5 mt-1 rounded text-[10px] font-medium bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30">
                      Super Admin
                    </span>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 transition-all duration-300 md:group-hover:opacity-100 lg:opacity-100 md:opacity-0" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{adminUser?.email?.split('@')[0] || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground font-normal truncate">
                    {adminUser?.email || 'Loading...'}
                  </p>
                  {adminUser?.isSuperAdmin && (
                    <span className="inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-medium bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30">
                      Super Admin
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={async () => {
                  try {
                    await fetch('/api/admin/auth/logout', { method: 'POST' });
                    window.location.href = '/sign-in';
                  } catch (error) {
                    console.error('Logout failed:', error);
                  }
                }}
                className="cursor-pointer text-red-600 dark:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Only on Mobile */}
        <header className="md:hidden sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between ml-14">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Welcome, {adminUser?.email?.split('@')[0] || 'Admin'}!
              </p>
            </div>
            <Avatar className="h-9 w-9 ring-2 ring-blue-500/20">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminUser?.email || 'Admin')}&background=3b82f6&color=fff`} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-sm">
                {adminUser?.email?.substring(0, 2).toUpperCase() || 'AD'}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ icon, href, children }: { icon: React.ReactNode, href: string, children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href} 
      className={`group/item relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <span className={`flex-shrink-0 transition-transform duration-200 ${
        isActive ? 'scale-110' : 'group-hover/item:scale-110'
      }`}>
        {icon}
      </span>
      <span className={`font-medium text-sm transition-all duration-300 md:group-hover:opacity-100 md:group-hover:translate-x-0 lg:opacity-100 lg:translate-x-0 md:opacity-0 md:-translate-x-2 ${
        isActive ? 'font-semibold' : ''
      }`}>
        {children}
      </span>
      
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute right-2 transition-all duration-300 md:group-hover:opacity-100 lg:opacity-100 md:opacity-0">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        </div>
      )}
      
      {/* Tooltip for collapsed state on desktop */}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-xl opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible pointer-events-none z-50 whitespace-nowrap transition-all duration-200 hidden md:block lg:hidden group-hover:hidden">
        {children}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
      </div>
    </Link>
  );
}

export default AdminLayout;
