// Residency (Academy) page
'use client';

import { CourseList } from '@/components/academy/CourseList';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, GraduationCap, Trophy, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ResidencyPage() {
  const { userData } = useAuth();
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Residency Program</h1>
          <p className="text-muted-foreground mt-2">
            Master the fundamentals through bite-sized modules and earn your way to the Lab
          </p>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search modules and lessons"
            className="pl-10 bg-card border-border"
          />
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25%</div>
            <div className="mt-2">
              <Progress value={25} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              2 of 6 modules completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {userData?.credits || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +250 available from remaining modules
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Invested</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14 hrs</div>
            <p className="text-xs text-muted-foreground">
              ~44 hours remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Next Milestone */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎯 Next Milestone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Complete Residency Program</h3>
              <p className="text-sm text-muted-foreground">
                Finish all 6 modules to unlock the Lab stage and earn your Admission NFT Badge
              </p>
            </div>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              4 modules left
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Course Modules */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Learning Modules</h2>
        <CourseList />
      </div>
    </div>
  );
}
