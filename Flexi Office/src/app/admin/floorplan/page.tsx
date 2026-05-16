'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Monitor, Users, Car, BatteryCharging, Plus, Trash2, MapPin, Save, ShieldAlert, Loader2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';

export default function AdminFloorplan() {
  const { user } = useUser();
  const db = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user?.uid, db]);

  const { data: profile, loading: profileLoading } = useDoc(userProfileRef);

  const resourcesCollection = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'resources');
  }, [db]);

  const { data: resources, loading: resourcesLoading } = useCollection(resourcesCollection);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Desk',
    status: 'Available',
    capacity: 1,
    location: { x: 50, y: 50 }
  });

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
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-headline font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You do not have administrative privileges to access the Floorplan Editor.</p>
          <Button asChild className="bg-primary">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const handleSave = () => {
    if (!db) return;
    const resourceRef = editingId ? doc(db, 'resources', editingId) : doc(collection(db, 'resources'));
    const data = { ...formData, id: resourceRef.id };
    
    setDoc(resourceRef, data, { merge: true })
      .then(() => {
        toast({ title: editingId ? "Resource Updated" : "Resource Created" });
        resetForm();
      })
      .catch(async (e) => {
        const error = new FirestorePermissionError({
          path: resourceRef.path,
          operation: editingId ? 'update' : 'create',
          requestResourceData: data
        });
        errorEmitter.emit('permission-error', error);
      });
  };

  const handleDelete = (id: string) => {
    if (!db) return;
    const ref = doc(db, 'resources', id);
    deleteDoc(ref).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ref.path, operation: 'delete' }));
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setIsPlacing(false);
    setFormData({
      name: '',
      type: 'Desk',
      status: 'Available',
      capacity: 1,
      location: { x: 50, y: 50 }
    });
  };

  const startEdit = (res: any) => {
    setEditingId(res.id);
    setFormData({
      name: res.name,
      type: res.type,
      status: res.status,
      capacity: res.capacity || 1,
      location: res.location
    });
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setFormData({ ...formData, location: { x, y } });
    setIsPlacing(false);
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-headline font-bold">Floorplan Management</h1>
          <p className="text-muted-foreground">Add, edit, and position office resources.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Resource' : 'Add New Resource'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Resource Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Desk 204"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Desk">Desk</SelectItem>
                    <SelectItem value="MeetingRoom">Meeting Room</SelectItem>
                    <SelectItem value="Parking">Parking Space</SelectItem>
                    <SelectItem value="EVCharger">EV Charger</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input 
                  type="number" 
                  value={isNaN(formData.capacity) ? '' : formData.capacity} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFormData({...formData, capacity: isNaN(val) ? 1 : val});
                  }} 
                />
              </div>
              <div className="pt-4 flex flex-col gap-2">
                <Button 
                  variant={isPlacing ? "destructive" : "outline"} 
                  className="w-full"
                  onClick={() => setIsPlacing(!isPlacing)}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {isPlacing ? "Click Map to Cancel" : "Set Map Position"}
                </Button>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  {editingId && (
                    <Button variant="ghost" onClick={resetForm}>Cancel</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardContent className="p-0">
                <div 
                  className={`relative aspect-video w-full bg-[#1c2422] rounded-lg border border-border overflow-hidden ${isPlacing ? 'cursor-crosshair ring-2 ring-primary ring-inset' : ''}`}
                  onClick={handleMapClick}
                >
                  <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 100 60">
                    <rect x="5" y="5" width="90" height="50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                  
                  {resources?.map((res: any) => (
                    <div
                      key={res.id}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center text-primary-foreground shadow-lg transition-all ${editingId === res.id ? 'ring-2 ring-white scale-125 z-10' : 'opacity-80'} ${
                        res.type === 'Desk' ? 'bg-primary' : 
                        res.type === 'MeetingRoom' ? 'bg-blue-500' : 
                        res.type === 'Parking' ? 'bg-orange-500' : 'bg-emerald-500'
                      }`}
                      style={{ left: `${res.location.x}%`, top: `${res.location.y}%` }}
                    >
                      {res.type === 'Desk' && <Monitor className="h-3 w-3" />}
                      {res.type === 'MeetingRoom' && <Users className="h-3 w-3" />}
                      {res.type === 'Parking' && <Car className="h-3 w-3" />}
                      {res.type === 'EVCharger' && <BatteryCharging className="h-3 w-3" />}
                    </div>
                  ))}

                  {isPlacing && (
                    <div className="absolute top-4 left-4 bg-primary/20 backdrop-blur-md px-3 py-1 rounded text-xs text-primary font-bold animate-pulse">
                      PLACEMENT MODE: Click anywhere on map
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resourcesLoading ? (
                <div className="col-span-2 flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : resources?.map((res: any) => (
                <Card key={res.id} className="border-border bg-card/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-secondary`}>
                        {res.type === 'Desk' && <Monitor className="h-4 w-4" />}
                        {res.type === 'MeetingRoom' && <Users className="h-4 w-4" />}
                        {res.type === 'Parking' && <Car className="h-4 w-4" />}
                        {res.type === 'EVCharger' && <BatteryCharging className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{res.name}</p>
                        <Badge variant="outline" className="text-[8px] h-3 px-1">{res.type}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(res)} className="h-8 w-8">
                        <MapPin className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(res.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
