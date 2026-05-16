
"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Monitor, Users, Car, BatteryCharging, Loader2 } from 'lucide-react'
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection } from 'firebase/firestore'

const statusColors: Record<string, string> = {
  Available: 'bg-primary',
  Limited: 'bg-amber-400',
  Full: 'bg-destructive',
  Maintenance: 'bg-neutral-500'
}

const ResourceIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'Desk': return <Monitor className="h-3 w-3" />
    case 'MeetingRoom': return <Users className="h-3 w-3" />
    case 'Parking': return <Car className="h-3 w-3" />
    case 'EVCharger': return <BatteryCharging className="h-3 w-3" />
    default: return null
  }
}

export function LiveMap() {
  const db = useFirestore();
  
  const resourcesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'resources');
  }, [db]);

  const { data: resources, loading } = useCollection(resourcesQuery);
  const [selected, setSelected] = useState<string | null>(null)

  if (loading) {
    return (
      <Card className="border-border bg-card shadow-lg flex items-center justify-center aspect-video">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl font-headline">Live Floorplan</CardTitle>
          <CardDescription>Real-time office and parking status</CardDescription>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary rounded-md border border-border">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-[10px] font-medium">Free</span>
           </div>
           <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary rounded-md border border-border">
              <div className="h-2 w-2 rounded-full bg-destructive" />
              <span className="text-[10px] font-medium">Booked</span>
           </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-video w-full bg-[#1c2422] rounded-b-lg border-t border-border overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 100 60">
            <rect x="5" y="5" width="90" height="50" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>

          <TooltipProvider delayDuration={0}>
            {resources?.map((res: any) => (
              <Tooltip key={res.id}>
                <TooltipTrigger asChild>
                  <button
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-lg shadow-md transition-all hover:scale-125 focus:ring-2 focus:ring-primary ${statusColors[res.status] || 'bg-neutral-500'} flex items-center justify-center text-primary-foreground ${selected === res.id ? 'ring-2 ring-white scale-125 z-10' : ''}`}
                    style={{ left: `${res.location.x}%`, top: `${res.location.y}%` }}
                    onClick={() => setSelected(res.id)}
                  >
                    <ResourceIcon type={res.type} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="p-3 bg-popover border-border shadow-xl">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-bold text-sm">{res.name}</span>
                      <Badge variant={res.status === 'Available' ? 'default' : 'destructive'} className="text-[10px] h-4">
                        {res.status}
                      </Badge>
                    </div>
                    {res.capacity && <p className="text-[10px] text-muted-foreground font-medium">Capacity: {res.capacity} people</p>}
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>

          <div className="absolute bottom-4 left-4 right-4 flex gap-4 pointer-events-none">
            {selected && (
              <div className="bg-popover/90 backdrop-blur-md p-4 rounded-xl border border-primary/20 shadow-2xl pointer-events-auto flex items-center justify-between w-full max-w-sm ml-auto animate-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-0.5">
                   <p className="text-xs text-muted-foreground font-medium">Selected Resource</p>
                   <p className="font-bold font-headline">{resources.find((r: any) => r.id === selected)?.name}</p>
                </div>
                <button className="bg-primary px-4 py-2 rounded-lg text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                  Book Now
                </button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
