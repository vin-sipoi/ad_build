// Journey progress component
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { GraduationCap, Wrench, Rocket, Trophy, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const journeyStages = [
  {
    id: 'residency',
    title: 'Residency',
    subtitle: 'Academy',
    description: 'Learn bite-sized modules, earn credits & admission NFT',
    icon: GraduationCap,
    color: 'bg-blue-500',
    status: 'current',
    progress: 25,
  },
  {
    id: 'lab',
    title: 'Lab',
    subtitle: 'Build',
    description: 'Build prototypes with team, unlock mentors, hit milestones',
    icon: Wrench,
    color: 'bg-orange-500',
    status: 'locked',
    progress: 0,
  },
  {
    id: 'launchpad',
    title: 'Launchpad',
    subtitle: 'Pitch',
    description: 'Investor readiness, pitch coaching, Demo Day',
    icon: Rocket,
    color: 'bg-purple-500',
    status: 'locked',
    progress: 0,
  },
  {
    id: 'alumni',
    title: 'Alumni',
    subtitle: 'Network',
    description: 'Network, referrals, advanced labs, continuous perks',
    icon: Trophy,
    color: 'bg-green-500',
    status: 'locked',
    progress: 0,
  },
];

export function JourneyProgress() {
  const { userData } = useAuth();
  
  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Your Founder Journey</CardTitle>
            <p className="text-muted-foreground mt-1">
              Progress through our accelerator program to become a funded founder
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
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {journeyStages.map((stage, index) => (
            <div key={stage.id} className="relative">
              <Card className={`${
                stage.status === 'current' ? 'ring-2 ring-primary bg-primary/5' : 
                stage.status === 'completed' ? 'bg-green-500/10' : 'opacity-60'
              }`}>
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-full ${stage.color} flex items-center justify-center mx-auto mb-3`}>
                    <stage.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold">{stage.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{stage.subtitle}</p>
                  <p className="text-xs text-muted-foreground mb-3">{stage.description}</p>
                  
                  {stage.status === 'current' && (
                    <div className="space-y-2">
                      <Progress value={stage.progress} className="h-2" />
                      <p className="text-xs">{stage.progress}% Complete</p>
                      <Button size="sm" className="w-full">Continue</Button>
                    </div>
                  )}
                  
                  {stage.status === 'locked' && (
                    <Badge variant="secondary" className="text-xs">
                      Locked
                    </Badge>
                  )}
                  
                  {stage.status === 'completed' && (
                    <Badge variant="default" className="text-xs bg-green-500">
                      Complete
                    </Badge>
                  )}
                </CardContent>
              </Card>
              
              {index < journeyStages.length - 1 && (
                <ArrowRight className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
