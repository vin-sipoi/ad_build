// Launchpad stage page
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Rocket, FileText, Users, Trophy } from 'lucide-react';

export default function LaunchpadPage() {
  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="h-10 w-10 text-purple-500" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Launchpad Stage</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Get investor-ready with pitch coaching, investor matching, and Demo Day presentations.
        </p>
        <Badge variant="secondary" className="text-lg px-6 py-2">
          Complete Lab to Unlock
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pitch Decks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Upload and refine your pitch decks with AI assistance.
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              AI Pitch Coach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get real-time feedback and coaching for your presentations.
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Investor Matching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Connect with investors aligned to your startup&apos;s vision.
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Demo Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Present to investors using credit-based Demo Day slots.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
