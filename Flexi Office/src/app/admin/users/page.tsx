
'use client';

import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { ShieldAlert, Loader2, Search, UserCog, Mail, ShieldCheck, UserMinus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const { user: currentUser } = useUser();
  const db = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!currentUser || !db) return null;
    return doc(db, 'users', currentUser.uid);
  }, [currentUser?.uid, db]);

  const { data: profile, loading: profileLoading } = useDoc(userProfileRef);

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'users');
  }, [db]);

  const { data: users, loading: usersLoading } = useCollection(usersQuery);

  const toggleAdmin = (targetUser: any) => {
    if (!db) return;
    const ref = doc(db, 'users', targetUser.id);
    updateDoc(ref, { isAdmin: !targetUser.isAdmin })
      .then(() => toast({ title: "Role updated" }));
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

  if (!profile?.isAdmin) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto mt-20 text-center space-y-6">
          <ShieldAlert className="h-20 w-20 text-destructive mx-auto" />
          <h1 className="text-3xl font-headline font-bold">Access Denied</h1>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-headline font-bold">User Management</h1>
          <p className="text-muted-foreground font-medium">Control roles, provision SSO, and monitor team activity.</p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-6">
            <div className="space-y-1">
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>{users?.length || 0} users total in organization</CardDescription>
            </div>
            <div className="relative w-72">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input placeholder="Filter by name or email..." className="pl-9 bg-secondary/30" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[300px]">Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Integrations</TableHead>
                  <TableHead>System Access</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : users?.map((u: any) => (
                  <TableRow key={u.id} className="group transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={`https://picsum.photos/seed/${u.id}/40/40`} />
                          <AvatarFallback>{u.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{u.name}</span>
                          <span className="text-[10px] text-muted-foreground">{u.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <span className="text-xs font-medium">{u.role || 'Member'}</span>
                    </TableCell>
                    <TableCell>
                       <div className="flex gap-1">
                          {u.integrations?.calendarSynced && <Badge variant="secondary" className="text-[8px] h-3 px-1">CAL</Badge>}
                          {u.integrations?.slackConnected && <Badge variant="secondary" className="text-[8px] h-3 px-1">CHAT</Badge>}
                          {!u.integrations?.calendarSynced && !u.integrations?.slackConnected && <span className="text-[10px] text-muted-foreground italic">None</span>}
                       </div>
                    </TableCell>
                    <TableCell>
                       {u.isAdmin ? (
                         <Badge className="bg-primary/20 text-primary border-primary/20 gap-1 px-2">
                           <ShieldCheck className="h-3 w-3" />
                           Admin
                         </Badge>
                       ) : (
                         <Badge variant="outline" className="text-muted-foreground">Standard</Badge>
                       )}
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => toggleAdmin(u)}
                          >
                             <UserCog className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                             <UserMinus className="h-4 w-4" />
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
