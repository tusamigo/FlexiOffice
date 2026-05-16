
'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TreeDeciduous, Zap, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export function StatsGrid() {
  const { user } = useUser();
  const db = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user?.uid, db]);

  const { data: profile, loading } = useDoc(userRef);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border bg-card/50 aspect-[4/3] flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary/30" />
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "CO₂ Saved",
      value: `${profile?.co2SavedKg || 0} kg`,
      description: `Equiv. to ${((profile?.co2SavedKg || 0) / 25).toFixed(1)} trees`,
      icon: TreeDeciduous,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      label: "FlexPoints",
      value: profile?.flexPoints || 0,
      description: "Available for rewards",
      icon: Zap,
      color: "text-accent",
      bg: "bg-accent/10"
    },
    {
      label: "One-Way Commute",
      value: `${profile?.commuteDistanceKm || 0} km`,
      description: "Standard distance",
      icon: Clock,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      label: "WFH Streak",
      value: `${profile?.wfhStreak || 0} days`,
      description: "Consecutive remote",
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="border-border bg-card/50 shadow-sm transition-all hover:shadow-md hover:border-primary/30 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold font-headline tracking-tight">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground leading-tight uppercase tracking-wider">{stat.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
