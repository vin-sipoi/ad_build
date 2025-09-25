'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  ArrowRight, 
  TrendingUp, 
  GraduationCap,
  Wrench,
  Rocket
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const quickStats = [
  {
    icon: BookOpen,
    label: 'My Journey',
    description: 'Track your personalized learning progress',
    href: '/dashboard/my-journey',
    color: 'bg-blue-500'
  },
  {
    icon: GraduationCap,
    label: 'Academy',
    description: 'Explore all available courses and modules',
    href: '/dashboard/residency',
    color: 'bg-purple-500'
  },
  {
    icon: Wrench,
    label: 'Lab',
    description: 'Build prototypes and unlock mentors',
    href: '/dashboard/lab',
    color: 'bg-orange-500'
  },
  {
    icon: Rocket,
    label: 'Launchpad',
    description: 'Investor readiness and pitch coaching',
    href: '/dashboard/launchpad',
    color: 'bg-green-500'
  }
];

export function DashboardOverview() {
  const { userData } = useAuth();
  
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Welcome to Your Founder Journey</CardTitle>
              <p className="text-muted-foreground mt-1">
                Track your progress and continue building your startup skills
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {userData?.credits || 0} Credits
              </div>
              <p className="text-sm text-muted-foreground">Available to spend</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{stat.label}</h3>
                <p className="text-sm text-muted-foreground mb-4">{stat.description}</p>
                <div className="flex items-center justify-center text-primary group-hover:text-primary/80">
                  <span className="text-sm font-medium mr-1">Explore</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Featured Action */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Ready to dive deeper?</h3>
                <p className="text-muted-foreground">
                  Check your personalized learning progress and continue where you left off
                </p>
              </div>
            </div>
            <Link href="/dashboard/my-journey">
              <Button size="lg" className="hidden sm:inline-flex">
                View My Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {/* Mobile button */}
          <div className="sm:hidden mt-4">
            <Link href="/dashboard/my-journey">
              <Button className="w-full">
                View My Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}