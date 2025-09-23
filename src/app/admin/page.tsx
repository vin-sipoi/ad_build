import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  ShieldCheck, 
  BarChart3,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

const AdminDashboard = () => {
  const stats = [
    { title: 'Total Users', value: '1,250', icon: <Users />, color: 'text-blue-500' },
    { title: 'Total Courses', value: '48', icon: <BookOpen />, color: 'text-green-500' },
    { title: 'Lessons Created', value: '560', icon: <GraduationCap />, color: 'text-purple-500' },
    { title: 'Pending Applications', value: '12', icon: <ShieldCheck />, color: 'text-yellow-500' },
  ];

  const quickLinks = [
    { title: 'Manage Courses', href: '/admin/courses', icon: <BookOpen /> },
    { title: 'Manage Users', href: '/admin/users', icon: <Users /> },
    { title: 'View Analytics', href: '/admin/analytics', icon: <BarChart3 /> },
    { title: 'Mentor Applications', href: '/admin/mentor-applications', icon: <ShieldCheck /> },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium leading-tight">{stat.title}</CardTitle>
              <div className={`${stat.color} flex-shrink-0`}>{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                +2.5% from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {quickLinks.map((link, index) => (
              <Link 
                key={index} 
                href={link.href} 
                className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
              >
                <span className="flex-shrink-0">{link.icon}</span>
                <span className="font-medium text-sm md:text-base">{link.title}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex items-start space-x-3">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium">New user &apos;John Doe&apos; registered.</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium">Course &apos;Next.js Advanced&apos; updated.</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium">New mentor application from &apos;Jane Smith&apos;.</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
