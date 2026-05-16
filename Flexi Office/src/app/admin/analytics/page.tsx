
'use client';

import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, limit, orderBy, doc } from 'firebase/firestore';
import { ShieldAlert, Loader2, Leaf, TrendingUp, Users, Zap, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function AdminAnalytics() {
  const { user } = useUser();
  const db = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user?.uid, db]);

  const { data: profile, loading: profileLoading } = useDoc(userProfileRef);

  const analyticsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'analytics'), orderBy('date', 'desc'), limit(30));
  }, [db]);

  const { data: rawAnalytics, loading: analyticsLoading } = useCollection(analyticsQuery);

  // Mock data for initial charts if none exists
  const analyticsData = rawAnalytics?.length ? [...rawAnalytics].reverse() : [
    { date: '2024-05-01', totalCo2Saved: 120, avgOccupancy: 45, flexPointsDistributed: 4500 },
    { date: '2024-05-08', totalCo2Saved: 280, avgOccupancy: 62, flexPointsDistributed: 8200 },
    { date: '2024-05-15', totalCo2Saved: 450, avgOccupancy: 58, flexPointsDistributed: 12500 },
    { date: '2024-05-22', totalCo2Saved: 680, avgOccupancy: 74, flexPointsDistributed: 18000 },
  ];

  if (profileLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!profile?.isAdmin) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto mt-20 text-center space-y-6">
          <ShieldAlert className="h-20 w-20 text-destructive mx-auto" />
          <h1 className="text-3xl font-headline font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You do not have administrative privileges to access the Analytics Suite.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold">Executive Analytics</h1>
            <p className="text-muted-foreground font-medium">Organization-wide sustainability and workspace performance reports.</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total CO₂ Saved", value: "2,480 kg", icon: Leaf, color: "text-primary" },
            { label: "Avg. Occupancy", value: "68%", icon: Users, color: "text-blue-400" },
            { label: "Points Distributed", value: "142k", icon: Zap, color: "text-accent" },
            { label: "Active Users", value: "482", icon: TrendingUp, color: "text-emerald-400" }
          ].map((stat, i) => (
            <Card key={i} className="border-border bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold font-headline">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Sustainability Impact</CardTitle>
              <CardDescription>Cumulative CO₂ savings over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData}>
                  <defs>
                    <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--primary))' }}
                  />
                  <Area type="monotone" dataKey="totalCo2Saved" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCo2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Workspace Occupancy</CardTitle>
              <CardDescription>Average desk and meeting room usage percentage</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="avgOccupancy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
