import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  Settings,
  FileText,
  BarChart3
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
import { AdminHeader } from '@/components/admin/AdminHeader';

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  // Get user info from middleware headers
  let adminUser = null;
  try {
    const headersList = await headers();
    const adminUserHeader = headersList.get('x-admin-user');
    if (adminUserHeader) {
      adminUser = JSON.parse(adminUserHeader);
    }
  } catch (error) {
    console.error('Error parsing admin user from headers:', error);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminHeader user={adminUser} />
      <div className="flex flex-1">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="p-4">
          <Link href="/admin" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800 dark:text-white">Admin Panel</span>
          </Link>
        </div>
        <nav className="mt-6">
          <ul>
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
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Welcome, Admin!</h1>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
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
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
    </div>
  );
};

const NavItem = ({ icon, href, children }: { icon: React.ReactNode, href: string, children: React.ReactNode }) => {
  return (
    <li>
      <Link href={href} className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
        {icon}
        <span className="font-medium">{children}</span>
      </Link>
    </li>
  );
}

export default AdminLayout;
