// Residency (Academy) page
'use client';

import { CourseList } from '@/components/academy/CourseList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Trophy, 
  BookOpen, 
  Users, 
  Clock,
  Target,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function ResidencyPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Academy Residency</h1>
          <p className="text-muted-foreground mt-2">
            Master startup fundamentals through comprehensive modules and earn your way to the Lab
          </p>
        </div>
        <Link href="/dashboard/my-journey">
          <Button variant="outline">
            View My Progress
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Program Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6+</div>
            <p className="text-xs text-muted-foreground">
              Comprehensive learning paths
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Available</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">500+</div>
            <p className="text-xs text-muted-foreground">
              Earn credits by completing modules
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">50+ hrs</div>
            <p className="text-xs text-muted-foreground">
              Self-paced learning content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1000+</div>
            <p className="text-xs text-muted-foreground">
              Fellow entrepreneurs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Program Goals */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Program Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Learn Fundamentals</h3>
              <p className="text-sm text-muted-foreground">
                Master essential startup and business building skills through structured modules
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Earn Credits</h3>
              <p className="text-sm text-muted-foreground">
                Complete modules to earn credits and unlock advanced features
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Advance to Lab</h3>
              <p className="text-sm text-muted-foreground">
                Graduate to the Lab stage and start building with mentorship
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Modules */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Available Learning Modules</h2>
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            Start Learning Today
          </Badge>
        </div>
        <CourseList />
      </div>
    </div>
  );
}
