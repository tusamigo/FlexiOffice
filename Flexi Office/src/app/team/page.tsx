
'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, query, where } from 'firebase/firestore';
import { Users, MapPin, Home, Calendar, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from "@/hooks/use-toast";

export default function TeamPresence() {
  const { user } = useUser();
  const db = useFirestore();
  const [targetDate, setTargetDate] = useState<Date | null>(null);

  // Avoid hydration mismatch by setting initial date in useEffect
  useEffect(() => {
    setTargetDate(new Date());
  }, []);

  const dateString = targetDate ? format(targetDate, 'yyyy-MM-dd') : '';

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'users');
  }, [db]);

  const presenceQuery = useMemoFirebase(() => {
    if (!db || !dateString) return null;
    return query(collection(db, 'presence'), where('date', '==', dateString));
  }, [db, dateString]);

  const { data: users, loading: usersLoading } = useCollection(usersQuery);
  const { data: presences, loading: presencesLoading } = useCollection(presenceQuery);

  const currentUserPresenceRef = useMemoFirebase(() => {
    if (!db || !user || !dateString) return null;
    return doc(db, 'presence', `${user.uid}_${dateString}`);
  }, [db, user?.uid, dateString]);

  const { data: myPresence } = useDoc(currentUserPresenceRef);

  const handleUpdateStatus = (status: 'InOffice' | 'WFH') => {
    if (!db || !user || !dateString || !currentUserPresenceRef) return;

    const data = {
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      date: dateString,
      status: status
    };

    setDoc(currentUserPresenceRef, data, { merge: true })
      .then(() => {
        toast({ title: `Status updated to ${status}` });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: currentUserPresenceRef.path,
          operation: 'write',
          requestResourceData: data
        }));
      });
  };

  const getStatusForUser = (userId: string) => {
    return presences?.find(p => p.userId === userId)?.status || 'Not Set';
  };

  if (!targetDate || usersLoading || presencesLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-headline font-bold">Team Presence</h1>
            <p className="text-muted-foreground font-medium">Coordinate with your colleagues and plan your hybrid week.</p>
          </div>

          <Card className="bg-secondary/30 border-border h-fit">
            <CardContent className="p-4 flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setTargetDate(subDays(targetDate, 1))}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 min-w-[140px] justify-center">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold">{format(targetDate, 'EEE, MMM d')}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setTargetDate(addDays(targetDate, 1))}>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setTargetDate(new Date())} className="ml-2 text-[10px] h-7 px-2">
                Today
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Card className="lg:col-span-1 border-primary/20 bg-primary/5 shadow-lg h-fit">
            <CardHeader>
              <CardTitle className="text-lg font-headline">Your Status</CardTitle>
              <CardDescription>Update your plan for {format(targetDate, 'MMM d')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button 
                  variant={myPresence?.status === 'InOffice' ? 'default' : 'outline'} 
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => handleUpdateStatus('InOffice')}
                >
                  <MapPin className="h-4 w-4" />
                  <span>Working in Office</span>
                  {myPresence?.status === 'InOffice' && <Badge className="ml-auto bg-white/20">Active</Badge>}
                </Button>
                <Button 
                  variant={myPresence?.status === 'WFH' ? 'default' : 'outline'} 
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => handleUpdateStatus('WFH')}
                >
                  <Home className="h-4 w-4" />
                  <span>Working from Home</span>
                  {myPresence?.status === 'WFH' && <Badge className="ml-auto bg-white/20">Active</Badge>}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground italic text-center">
                Your presence helps the AI Advisor give better team recommendations.
              </p>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {users?.map((userItem: any) => {
                const status = getStatusForUser(userItem.id);
                return (
                  <Card key={userItem.id} className="border-border hover:border-primary/30 transition-all group overflow-hidden">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border border-border group-hover:border-primary/50 transition-colors">
                          <AvatarImage src={`https://picsum.photos/seed/${userItem.id}/60/60`} />
                          <AvatarFallback>{userItem.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold truncate max-w-[120px]">{userItem.name || 'Anonymous'}</p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{userItem.role || 'Member'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge variant={status === 'InOffice' ? 'default' : status === 'WFH' ? 'secondary' : 'outline'} className="text-[9px] h-5 px-1.5">
                          {status === 'InOffice' ? 'Office' : status === 'WFH' ? 'Remote' : 'Unknown'}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {status === 'InOffice' ? <MapPin className="h-3 w-3 text-primary" /> : status === 'WFH' ? <Home className="h-3 w-3 text-accent" /> : <Users className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {(!users || users.length === 0) && !usersLoading && (
              <div className="flex flex-col items-center justify-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-border">
                <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">No team members found yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
