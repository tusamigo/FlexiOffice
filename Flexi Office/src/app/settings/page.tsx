"use client"

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Settings, Bell, Monitor, Shield, Save, Loader2, Globe, Link2, Calendar, MessageSquare, Building, UserCheck } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const { user } = useUser();
  const db = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user?.uid, db]);

  const { data: profile, loading: profileLoading } = useDoc(userProfileRef);

  const [formData, setFormData] = useState({
    preferences: {
      defaultWorkMode: 'WFH',
      notifications: {
        meetingReminders: true,
        bookingConfirmations: true,
        impactReports: true
      },
      privacy: {
        showPresenceToTeam: true
      }
    },
    integrations: {
      calendarSynced: false,
      slackConnected: false,
      buildingAccessLinked: false,
      hrisSynced: false
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        preferences: {
          defaultWorkMode: profile.preferences?.defaultWorkMode || 'WFH',
          notifications: {
            meetingReminders: profile.preferences?.notifications?.meetingReminders ?? true,
            bookingConfirmations: profile.preferences?.notifications?.bookingConfirmations ?? true,
            impactReports: profile.preferences?.notifications?.impactReports ?? true
          },
          privacy: {
            showPresenceToTeam: profile.preferences?.privacy?.showPresenceToTeam ?? true
          }
        },
        integrations: {
          calendarSynced: profile.integrations?.calendarSynced ?? false,
          slackConnected: profile.integrations?.slackConnected ?? false,
          buildingAccessLinked: profile.integrations?.buildingAccessLinked ?? false,
          hrisSynced: profile.integrations?.hrisSynced ?? false
        }
      });
    }
  }, [profile]);

  const handleSave = () => {
    if (!userProfileRef) return;
    setDoc(userProfileRef, formData, { merge: true })
      .then(() => toast({ title: "Settings updated" }))
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userProfileRef.path,
          operation: 'update',
          requestResourceData: formData
        }));
      });
  };

  if (profileLoading) {
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
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-headline font-bold">System Settings</h1>
          <p className="text-muted-foreground">Customize your FlexiOffice experience and integrations.</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-secondary/50 border border-border">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-8">
                <Card className="border-border">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-primary" />
                      <CardTitle>Workspace Defaults</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Preferred Work Mode</Label>
                      <Select 
                        value={formData.preferences.defaultWorkMode} 
                        onValueChange={(v) => setFormData({
                          ...formData, 
                          preferences: { ...formData.preferences, defaultWorkMode: v }
                        })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WFH">Work From Home</SelectItem>
                          <SelectItem value="InOffice">In Office</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-accent">
                      <Bell className="h-5 w-5" />
                      <CardTitle>Notifications</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: "Meeting Reminders", key: "meetingReminders" },
                      { label: "Booking Confirmations", key: "bookingConfirmations" },
                      { label: "Weekly Impact Report", key: "impactReports" }
                    ].map((n) => (
                      <div key={n.key} className="flex items-center justify-between">
                        <Label>{n.label}</Label>
                        <Switch 
                          checked={(formData.preferences.notifications as any)[n.key]}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            preferences: {
                              ...formData.preferences,
                              notifications: { ...formData.preferences.notifications, [n.key]: checked }
                            }
                          })}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                <Card className="border-border">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-primary">
                      <Shield className="h-5 w-5" />
                      <CardTitle>Privacy</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border">
                      <Label>Share Presence</Label>
                      <Switch 
                        checked={formData.preferences.privacy.showPresenceToTeam}
                        onCheckedChange={(checked) => setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            privacy: { ...formData.preferences.privacy, showPresenceToTeam: checked }
                          }
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Button className="w-full bg-primary font-bold shadow-lg" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" /> Save General Settings
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { 
                  title: "Google / Outlook Calendar", 
                  desc: "Sync bookings and inform AI nudges.", 
                  icon: Calendar, 
                  key: "calendarSynced",
                  color: "text-blue-400"
                },
                { 
                  title: "Slack / MS Teams", 
                  desc: "Push updates and status notifications.", 
                  icon: MessageSquare, 
                  key: "slackConnected",
                  color: "text-purple-400"
                },
                { 
                  title: "HRIS (Workday/SAP)", 
                  desc: "Sync leave and organizational data.", 
                  icon: UserCheck, 
                  key: "hrisSynced",
                  color: "text-emerald-400"
                },
                { 
                  title: "Building Access (Lenel/HID)", 
                  desc: "Auto-validate check-ins via badges.", 
                  icon: Building, 
                  key: "buildingAccessLinked",
                  color: "text-orange-400"
                }
              ].map((integration) => (
                <Card key={integration.key} className="border-border hover:bg-secondary/20 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className={`p-3 rounded-xl bg-secondary ${integration.color}`}>
                          <integration.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{integration.title}</p>
                          <p className="text-sm text-muted-foreground">{integration.desc}</p>
                        </div>
                      </div>
                      <Switch 
                        checked={(formData.integrations as any)[integration.key]}
                        onCheckedChange={(checked) => {
                          const newIntegrations = { ...formData.integrations, [integration.key]: checked };
                          setFormData({ ...formData, integrations: newIntegrations });
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end">
              <Button className="bg-primary font-bold shadow-lg" onClick={handleSave}>
                <Link2 className="mr-2 h-4 w-4" /> Finalize Connections
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
