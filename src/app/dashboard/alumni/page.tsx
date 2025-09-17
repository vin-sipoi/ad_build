// Alumni stage page
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Trophy, Network, Gift, Star } from 'lucide-react';

export default function AlumniPage() {
  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Alumni Network</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join the exclusive alumni network with advanced labs, referral bonuses, and continuous perks.
        </p>
        <Badge variant="secondary" className="text-lg px-6 py-2">
          Complete Launchpad to Unlock
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Alumni Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Connect with successful founders and industry experts.
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Referral Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Earn bonuses for referring new founders to the program.
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Advanced Labs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access to cutting-edge workshops and exclusive content.
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Exclusive Perks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Continuous credits, tools, and platform benefits.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
