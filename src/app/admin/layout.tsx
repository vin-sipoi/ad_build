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
  X
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-1 relative">
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`group fixed md:relative top-0 left-0 z-50 h-screen md:h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 transform transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
          } md:translate-x-0 md:hover:w-64 md:w-20 lg:w-64 flex flex-col`}
        >
          <div className="p-3 md:p-4">
            <Link href="/admin" className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 md:h-8 md:w-8 text-blue-600 flex-shrink-0" />
              <span className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white transition-opacity duration-300 md:group-hover:opacity-100 lg:opacity-100 md:opacity-0 whitespace-nowrap overflow-hidden">
                Admin Panel
              </span>
            </Link>
          </div>
          <nav className="mt-4 md:mt-6 flex-1 overflow-y-auto">
            <ul className="space-y-1">
              <NavItem icon={<LayoutDashboard />} href="/admin">Dashboard</NavItem>
              <NavItem icon={<BookOpen />} href="/admin/courses">Courses</NavItem>
              <NavItem icon={<FileText />} href="/admin/topics">Topics</NavItem>
              <NavItem icon={<GraduationCap />} href="/admin/lessons">Lessons</NavItem>
              <NavItem icon={<Users />} href="/admin/users">Users</NavItem>
              <NavItem icon={<ShieldCheck />} href="/admin/mentor-applications">Mentor Applications</NavItem>
              <NavItem icon={<BarChart3 />} href="/admin/analytics">Analytics</NavItem>
              <NavItem icon={<Settings />} href="/admin/settings">Settings</NavItem>
            </ul>
          </nav>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 md:p-4 flex justify-between items-center">
            <div className="ml-12 md:ml-0">
              <h1 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">Welcome, Admin!</h1>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="h-8 w-8 md:h-10 md:w-10">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
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
                    className="cursor-pointer"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-3 md:p-6 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, href, children }: { icon: React.ReactNode, href: string, children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <li className="relative">
      <Link 
        href={href} 
        className={`flex items-center space-x-3 px-3 md:px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 touch-manipulation min-h-[48px] ${
          isActive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
        }`}
      >
        <span className="flex-shrink-0">{icon}</span>
        <span className="font-medium text-sm md:text-base transition-opacity duration-300 md:group-hover:opacity-100 lg:opacity-100 md:opacity-0 whitespace-nowrap overflow-hidden">
          {children}
        </span>
      </Link>
      
      {/* Tooltip for collapsed state on desktop */}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded shadow-lg opacity-0 hover:opacity-100 pointer-events-none z-50 whitespace-nowrap transition-opacity duration-200 hidden md:block lg:hidden group-hover:hidden">
        {children}
      </div>
    </li>
  );
}

export default AdminLayout;
