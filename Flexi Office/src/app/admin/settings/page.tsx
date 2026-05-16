'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ShieldAlert, Loader2, Save, Globe, Lock, Bell, Zap } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminSettings() {
  const { user } = useUser();
  const db = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user?.uid, db]);

  const { data: profile, loading: profileLoading } = useDoc(userProfileRef);

  const orgSettingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'orgSettings', 'global');
  }, [db]);

  const { data: orgSettings, loading: orgLoading } = useDoc(orgSettingsRef);

  const [formData, setFormData] = useState({
    maxInOfficeDays: 3,
    anchorDays: ['Tuesday', 'Thursday'],
    autoReleaseUnusedBookings: true,
    requireCheckIn: true
  });

  useEffect(() => {
    if (orgSettings) {
      setFormData({
        maxInOfficeDays: orgSettings.maxInOfficeDays || 3,
        anchorDays: orgSettings.anchorDays || [],
        autoReleaseUnusedBookings: orgSettings.autoReleaseUnusedBookings ?? true,
        requireCheckIn: orgSettings.requireCheckIn ?? true
      });
    }
  }, [orgSettings]);

  const handleSave = () => {
    if (!orgSettingsRef) return;
    setDoc(orgSettingsRef, formData, { merge: true })
      .then(() => toast({ title: "Policies updated" }))
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: orgSettingsRef.path,
          operation: 'write',
          requestResourceData: formData
        }));
      });
  };

  if (profileLoading || orgLoading) {
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
          <p className="text-muted-foreground">Administrative credentials required.</p>
        </div>
      </AppShell>
    );
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-headline font-bold">Organization Policies</h1>
          <p className="text-muted-foreground font-medium">Define the rules for your hybrid workspace ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <CardTitle>WFH Policies</CardTitle>
                </div>
                <CardDescription>Balance focus and collaboration.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Max In-Office Days Per Week</Label>
                  <Input 
                    type="number"
                    value={isNaN(formData.maxInOfficeDays) ? '' : formData.maxInOfficeDays}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setFormData({...formData, maxInOfficeDays: isNaN(val) ? 0 : val});
                    }}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Standard Anchor Days</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {days.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox 
                          id={day} 
                          checked={formData.anchorDays.includes(day)}
                          onCheckedChange={(checked) => {
                            const newDays = checked 
                              ? [...formData.anchorDays, day]
                              : formData.anchorDays.filter(d => d !== day);
                            setFormData({...formData, anchorDays: newDays});
                          }}
                        />
                        <label htmlFor={day} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-2 text-accent">
                  <Lock className="h-5 w-5" />
                  <CardTitle>Security & Access</CardTitle>
                </div>
                <CardDescription>Building systems integration rules.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="space-y-0.5">
                     <Label>Auto-Release Unused Bookings</Label>
                     <p className="text-[10px] text-muted-foreground">Release if no check-in after 30 mins.</p>
                   </div>
                   <Switch 
                     checked={formData.autoReleaseUnusedBookings}
                     onCheckedChange={(v) => setFormData({...formData, autoReleaseUnusedBookings: v})}
                   />
                </div>
                <div className="flex items-center justify-between">
                   <div className="space-y-0.5">
                     <Label>Physical Badge Required</Label>
                     <p className="text-[10px] text-muted-foreground">Require badge-in for desk validation.</p>
                   </div>
                   <Switch 
                     checked={formData.requireCheckIn}
                     onCheckedChange={(v) => setFormData({...formData, requireCheckIn: v})}
                   />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-border bg-gradient-to-br from-primary/5 to-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle>Incentive Rules</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-background/50 border border-border">
                  <p className="text-xs font-bold mb-2">FlexPoint Distribution</p>
                  <ul className="text-[10px] space-y-1.5 text-muted-foreground">
                    <li>• 10 pts per carpool check-in</li>
                    <li>• 50 pts per 5-day WFH streak</li>
                    <li>• 100 pts per sustainable commute week</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                 <Button className="w-full bg-primary font-bold shadow-lg" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Deploy Policy Updates
                 </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
