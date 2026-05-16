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
import { User, Car, Shield, Mail, Save, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user } = useUser();
  const db = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user?.uid, db]);

  const { data: profile, loading: profileLoading } = useDoc(userProfileRef);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    isAdmin: false,
    commuteDistanceKm: 0,
    vehicle: {
      licensePlate: '',
      make: '',
      model: '',
      isEV: false
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || user?.displayName || '',
        role: profile.role || '',
        email: profile.email || user?.email || '',
        isAdmin: !!profile.isAdmin,
        commuteDistanceKm: profile.commuteDistanceKm || 0,
        vehicle: {
          licensePlate: profile.vehicle?.licensePlate || '',
          make: profile.vehicle?.make || '',
          model: profile.vehicle?.model || '',
          isEV: profile.vehicle?.isEV || false
        }
      });
    }
  }, [profile, user]);

  const handleSave = () => {
    if (!userProfileRef) return;
    
    setDoc(userProfileRef, formData, { merge: true })
      .then(() => {
        toast({ title: "Profile saved successfully" });
      })
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 border-2 border-primary shadow-xl">
             <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/100/100`} />
             <AvatarFallback className="text-2xl">{formData.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-headline font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your personal details and vehicle information.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Personal Details</CardTitle>
                </div>
                <CardDescription>Basic information used for collaboration.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Job Role</Label>
                  <Input 
                    value={formData.role} 
                    onChange={(e) => setFormData({...formData, role: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Work Email</Label>
                  <Input 
                    disabled
                    value={formData.email} 
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>One-way Commute (km)</Label>
                  <Input 
                    type="number"
                    value={isNaN(formData.commuteDistanceKm) ? '' : formData.commuteDistanceKm} 
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFormData({...formData, commuteDistanceKm: isNaN(val) ? 0 : val});
                    }} 
                  />
                  <p className="text-[10px] text-muted-foreground">Used for CO₂ impact calculations.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-primary/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <ShieldAlert className="h-5 w-5" />
                  <CardTitle>System Roles</CardTitle>
                </div>
                <CardDescription>Administrative access control.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">Admin Status</Label>
                    <p className="text-[10px] text-muted-foreground">Enables Floorplan Editor and management tools.</p>
                  </div>
                  <Switch 
                    checked={formData.isAdmin}
                    onCheckedChange={(checked) => setFormData({...formData, isAdmin: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border h-fit">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-accent" />
                <CardTitle>Vehicle Details</CardTitle>
              </div>
              <CardDescription>Required for parking and EV charging reservations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>License Plate</Label>
                <Input 
                  placeholder="e.g. ABC-1234"
                  value={formData.vehicle.licensePlate} 
                  onChange={(e) => setFormData({...formData, vehicle: {...formData.vehicle, licensePlate: e.target.value.toUpperCase()}})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Make</Label>
                  <Input 
                    placeholder="e.g. Tesla"
                    value={formData.vehicle.make} 
                    onChange={(e) => setFormData({...formData, vehicle: {...formData.vehicle, make: e.target.value}})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input 
                    placeholder="e.g. Model 3"
                    value={formData.vehicle.model} 
                    onChange={(e) => setFormData({...formData, vehicle: {...formData.vehicle, model: e.target.value}})} 
                  />
                </div>
              </div>
              <div className="pt-4 flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Electric Vehicle</Label>
                  <p className="text-[10px] text-muted-foreground">Enables EV Charging station booking.</p>
                </div>
                <Switch 
                  checked={formData.vehicle.isEV}
                  onCheckedChange={(checked) => setFormData({...formData, vehicle: {...formData.vehicle, isEV: checked}})}
                />
              </div>
            </CardContent>
            <CardFooter className="pt-6">
              <Button className="w-full bg-primary font-bold shadow-lg shadow-primary/20" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save All Changes
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
