
"use client"

import React from 'react'
import { 
  Home, 
  Map as MapIcon, 
  Users, 
  Trophy, 
  Settings, 
  LogOut,
  Leaf,
  User,
  ShieldCheck,
  BarChart,
  Globe,
  LayoutDashboard
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase'
import { doc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Resource Map", url: "/bookings", icon: MapIcon },
  { title: "Team Presence", url: "/team", icon: Users },
  { title: "Rewards Hub", url: "/rewards", icon: Trophy },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useUser()
  const db = useFirestore()
  const auth = useAuth()

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user?.uid, db]);

  const { data: profile } = useDoc(userProfileRef)

  const isAdmin = !!profile?.isAdmin;

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      window.location.href = '/';
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="border-b border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="font-headline text-xl font-bold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
              FlexiOffice
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin/analytics'} tooltip="Analytics">
                      <Link href="/admin/analytics">
                        <BarChart className="h-4 w-4" />
                        <span>Analytics</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin/floorplan'} tooltip="Floorplan Editor">
                      <Link href="/admin/floorplan">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Floorplan Editor</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin/users'} tooltip="User Management">
                      <Link href="/admin/users">
                        <Users className="h-4 w-4" />
                        <span>User Management</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin/settings'} tooltip="Org Settings">
                      <Link href="/admin/settings">
                        <Globe className="h-4 w-4" />
                        <span>Org Policies</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
          
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/settings/profile'} tooltip="Profile Settings">
                    <Link href="/settings/profile">
                      <User className="h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/settings'} tooltip="System Settings">
                    <Link href="/settings">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-border/50 p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                size="lg" 
                className="w-full justify-start p-2 hover:bg-secondary/50 rounded-lg"
                onClick={handleLogout}
              >
                <Avatar className="h-8 w-8 rounded-full border border-border">
                  <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/40/40`} />
                  <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm group-data-[collapsible=icon]:hidden ml-3 overflow-hidden">
                  <span className="font-medium text-foreground truncate w-full">{profile?.name || user?.displayName || 'User'}</span>
                  <span className="text-xs text-muted-foreground truncate w-full">{profile?.role || 'Member'}</span>
                </div>
                <LogOut className="ml-auto h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border/50 bg-background/80 backdrop-blur-md px-6">
          <SidebarTrigger />
          <div className="ml-auto flex items-center gap-4">
             <Badge variant="outline" className="flex items-center gap-1.5 py-1.5 px-3 border-border bg-secondary/30">
               <Leaf className="h-3.5 w-3.5 text-primary" />
               <span className="text-xs font-medium">{profile?.co2SavedKg || 0}kg CO₂ Saved</span>
             </Badge>
             <div className="h-8 w-[1px] bg-border/50 mx-2 hidden sm:block" />
             <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-foreground">
                <Trophy className="h-4 w-4 text-accent" />
                <span>{profile?.flexPoints || 0} FlexPoints</span>
             </div>
          </div>
        </header>
        <main className="p-4 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
