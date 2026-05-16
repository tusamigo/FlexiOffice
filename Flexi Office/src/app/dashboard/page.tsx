
'use client';

import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { AIAdvisor } from '@/components/dashboard/ai-advisor';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { LiveMap } from '@/components/floorplan/live-map';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useUser();
  const db = useFirestore();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user?.uid, db]);

  const { data: profile } = useDoc(userRef);

  const presenceQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'presence'), where('date', '==', today));
  }, [db, today]);

  const { data: presences, loading: presencesLoading } = useCollection(presenceQuery);

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
              Morning, {profile?.name || user?.displayName?.split(' ')[0] || 'Friend'}
            </h1>
            <p className="text-muted-foreground font-medium">Here's your hybrid workspace summary for today.</p>
          </div>
          <div className="flex items-center gap-3">
            {profile?.isAdmin && (
              <Button asChild variant="outline" size="sm" className="hidden md:flex border-primary/20 bg-primary/5 text-primary gap-2">
                <Link href="/admin/analytics">
                  <ShieldCheck className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              </Button>
            )}
            <Badge variant="secondary" className="px-3 py-1.5 border border-border bg-secondary/30 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(), 'EEEE, MMM do')}</span>
            </Badge>
          </div>
        </div>

        <StatsGrid />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <AIAdvisor />
            <LiveMap />
          </div>

          <div className="space-y-8">
            <Card className="border-border bg-card shadow-lg h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-headline">Team Presence</CardTitle>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Who's active today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {presencesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary/30" />
                    </div>
                  ) : presences?.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/40 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage src={`https://picsum.photos/seed/${member.userId}/40/40`} />
                          <AvatarFallback>{member.userName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-foreground">{member.userName}</p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{member.status}</p>
                        </div>
                      </div>
                      <Badge variant={member.status === 'InOffice' ? 'default' : 'secondary'} className="text-[10px]">
                        {member.status === 'InOffice' ? 'On-site' : 'Remote'}
                      </Badge>
                    </div>
                  ))}
                  {presences?.length === 0 && !presencesLoading && (
                    <div className="text-center py-8 text-sm text-muted-foreground italic">
                      No team activity recorded yet.
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t border-border">
                  <Link href="/team" className="w-full flex items-center justify-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all">
                    View Full Planner
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-gradient-to-br from-secondary/50 to-background shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-accent/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                   <h3 className="text-lg font-headline font-bold">Planned Anchor Day</h3>
                   <p className="text-sm text-muted-foreground leading-relaxed">
                     Intentional collaboration days are highlighted in your planner to help you coordinate.
                   </p>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border border-border">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-xs font-semibold text-muted-foreground">Team Readiness</span>
                     <span className="text-xs font-bold text-accent">72%</span>
                   </div>
                   <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: '72%' }} />
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
