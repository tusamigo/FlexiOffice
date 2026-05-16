import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MOCK_USER } from '@/lib/mock-data'
import { Leaf, Trophy, Gift, ShoppingBag, Zap, ArrowUpRight } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export default function Rewards() {
  const achievements = [
    { title: "Eco Warrior", desc: "Save 50kg of CO₂ emissions", progress: 85, icon: Leaf },
    { title: "WFH Guru", desc: "Maintain a 10-day streak", progress: 80, icon: Zap },
    { title: "Early Bird", desc: "Check in before 9 AM on site", progress: 100, icon: Trophy, unlocked: true },
  ]

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">Rewards Hub</h1>
            <p className="text-muted-foreground font-medium">Your contribution to a sustainable future, rewarded.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-border bg-gradient-to-br from-card to-secondary/30 shadow-xl overflow-hidden relative">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Impact Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Leaf className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold font-headline">{MOCK_USER.co2SavedKg} kg</p>
                      <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">CO₂ Emissions Saved</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "That's equivalent to planting approximately 1.5 trees this month. You're making a real difference!"
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold font-headline">{MOCK_USER.flexPoints}</p>
                      <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">Redeemable FlexPoints</p>
                    </div>
                  </div>
                  <Button className="w-full bg-accent text-accent-foreground font-bold shadow-lg shadow-accent/20">
                    Visit Reward Store
                  </Button>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-border">
                <h3 className="font-headline font-bold text-lg">Your Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-secondary/40 border border-border group hover:border-primary/50 transition-all cursor-pointer">
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${item.unlocked ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'}`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                           <p className="font-bold text-sm">{item.title}</p>
                           <p className="text-[10px] text-muted-foreground font-medium">{item.desc}</p>
                        </div>
                        {item.unlocked && <Badge className="ml-auto bg-primary text-[10px]">Unlocked</Badge>}
                      </div>
                      {!item.unlocked && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-primary">{item.progress}%</span>
                          </div>
                          <Progress value={item.progress} className="h-1.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="border-border bg-card shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg font-headline">Popular Rewards</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Tree Planting", cost: 500, type: "Charity" },
                  { name: "$25 Coffee Card", cost: 1200, type: "Gift Card" },
                  { name: "Extra Leave Day", cost: 5000, type: "Wellness" },
                ].map((reward, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50 group hover:bg-secondary/50 transition-all cursor-pointer">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold">{reward.name}</p>
                      <Badge variant="outline" className="text-[8px] h-3 px-1.5">{reward.type}</Badge>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-xs font-bold text-accent">{reward.cost} pts</span>
                       <ArrowUpRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-xs font-bold text-muted-foreground mt-2">
                  View All Rewards
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border bg-accent/5 border-accent/20">
              <CardContent className="p-6 text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-accent/10 mb-2">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-headline font-bold">FlexiOffice Premium</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Upgrade your office experience with priority booking and smart charging alerts.
                </p>
                <Button className="w-full bg-accent text-accent-foreground font-bold">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
