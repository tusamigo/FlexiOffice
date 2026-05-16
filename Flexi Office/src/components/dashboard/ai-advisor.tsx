"use client"

import React, { useState, useEffect } from 'react'
import { Sparkles, BrainCircuit, Loader2, MapPin, Wind, Zap, Link2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { workspaceAdvisorRecommendation, type WorkspaceAdvisorOutput } from '@/ai/flows/workspace-advisor-recommendation'
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase'
import { doc, collection, query, where } from 'firebase/firestore'
import { format } from 'date-fns'
import { Badge } from "@/components/ui/badge"

export function AIAdvisor() {
  const { user } = useUser()
  const db = useFirestore()
  
  const [today, setToday] = useState('');
  const [displayDay, setDisplayDay] = useState('');

  useEffect(() => {
    const now = new Date();
    setToday(format(now, 'yyyy-MM-dd'));
    setDisplayDay(format(now, 'EEEE'));
  }, []);
  
  const userProfileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user?.uid, db]);

  const { data: profile } = useDoc(userProfileRef)

  const presenceQuery = useMemoFirebase(() => {
    if (!db || !today) return null
    return query(collection(db, 'presence'), where('date', '==', today))
  }, [db, today])

  const meetingsQuery = useMemoFirebase(() => {
    if (!db || !today) return null
    return query(collection(db, 'meetings'), where('date', '==', today))
  }, [db, today])

  const { data: presences, loading: presencesLoading } = useCollection(presenceQuery)
  const { data: meetings, loading: meetingsLoading } = useCollection(meetingsQuery)

  const [aiLoading, setAiLoading] = useState(false)
  const [recommendation, setRecommendation] = useState<WorkspaceAdvisorOutput | null>(null)

  const fetchRecommendation = async () => {
    if (!user || !profile || !presences || !today) return
    
    setAiLoading(true)
    try {
      const result = await workspaceAdvisorRecommendation({
        employeeId: user.uid,
        recommendationDate: today,
        teamMeetings: meetings?.map((m: any) => ({
          date: m.date,
          time: m.time,
          title: m.title,
          attendees: m.attendees || [],
          locationType: m.locationType as 'Office' | 'Remote' | 'Hybrid',
          purpose: m.purpose || ''
        })) || [],
        teamOfficePresence: presences?.map((p: any) => ({
          employeeId: p.userId,
          date: p.date,
          status: p.status as 'InOffice' | 'WFH'
        })) || [],
        employeeCommuteDistanceKm: profile.commuteDistanceKm || 10
      })
      setRecommendation(result)
    } catch (error) {
      console.error("AI Advisor error:", error)
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    if (profile && presences && meetings !== null && today) {
      fetchRecommendation()
    }
  }, [profile, presences, meetings, today])

  const isLoading = !today || presencesLoading || meetingsLoading || aiLoading
  const isIntegrated = profile?.integrations?.calendarSynced || profile?.integrations?.hrisSynced;

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-secondary/30 shadow-xl">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <BrainCircuit className="h-24 w-24 text-primary" />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-xl font-headline tracking-tight">AI Workspace Advisor</CardTitle>
          </div>
          {isIntegrated && (
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1 px-2 py-1">
              <Link2 className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Integrated Data</span>
            </Badge>
          )}
        </div>
        <CardDescription>
          Personalized recommendation for {displayDay || '...'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 min-h-[250px] flex flex-col justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground animate-pulse italic">Scanning integrated systems...</p>
          </div>
        ) : recommendation ? (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl border h-fit ${recommendation.recommendation === 'WFH' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                 <div className="text-2xl font-bold font-headline">{recommendation.recommendation}</div>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-relaxed">{recommendation.reasoning}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendation.collaborationImpact && recommendation.collaborationImpact.potentialCollaborationGain && (
                <div className="p-4 rounded-xl bg-secondary/40 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Collaboration</span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-tight">
                    {recommendation.collaborationImpact.potentialCollaborationGain}
                  </p>
                </div>
              )}
              {recommendation.sustainabilityImpact && (
                <div className="p-4 rounded-xl bg-secondary/40 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="h-4 w-4 text-accent" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Eco Savings</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-accent">{recommendation.sustainabilityImpact.co2SavedKg}kg</span>
                      <span className="text-[10px] text-muted-foreground">CO₂ Reduced</span>
                    </div>
                    <div className="h-8 w-[1px] bg-border" />
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-accent">{recommendation.sustainabilityImpact.commuteTimeSavedMinutes}m</span>
                      <span className="text-[10px] text-muted-foreground">Time Saved</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm font-bold text-primary italic leading-tight">
                  "{recommendation.smartNudge}"
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground italic">
            Connect your calendar in Settings to get deep AI insights.
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button 
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20" 
          disabled={isLoading}
          onClick={fetchRecommendation}
        >
          Refresh Suggestion
        </Button>
      </CardFooter>
    </Card>
  )
}
