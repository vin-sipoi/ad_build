// Lab stage page
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Wrench, Users, Target } from 'lucide-react';

export default function LabPage() {
  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="h-10 w-10 text-orange-500" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Lab Stage</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Build prototypes with your team, unlock mentors with credits, and hit milestones to earn funding.
        </p>
        <Badge variant="secondary" className="text-lg px-6 py-2">
          Complete Residency to Unlock
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Prototype Building
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Build your MVP with dedicated team resources and tools.
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mentor Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Unlock expert mentors using your earned credits for personalized guidance.
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Milestone Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set and achieve milestones to unlock smart contract funding.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
