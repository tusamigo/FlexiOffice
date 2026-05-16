
import { AppShell } from '@/components/layout/app-shell'
import { LiveMap } from '@/components/floorplan/live-map'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Filter, Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function Bookings() {
  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">Resource Booking</h1>
            <p className="text-muted-foreground font-medium">Find and reserve your spot for intentional collaboration.</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-primary text-primary-foreground font-bold">
              Quick Book
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Card className="lg:col-span-1 border-border bg-card/50 shadow-sm h-fit">
            <CardHeader>
              <CardTitle className="text-lg font-headline">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Desk or Room name..." className="pl-9 bg-secondary/30 border-border" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Date</label>
                <Button variant="outline" className="w-full justify-start text-left font-normal border-border bg-secondary/30">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Today, May 20</span>
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="bg-secondary/50 border-primary/20 text-primary">All</Button>
                  <Button variant="outline" size="sm" className="border-border opacity-60">Desks</Button>
                  <Button variant="outline" size="sm" className="border-border opacity-60">Meeting</Button>
                  <Button variant="outline" size="sm" className="border-border opacity-60">EV Charge</Button>
                </div>
              </div>

              <Button className="w-full mt-4 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground font-bold">
                Apply Filters
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            <LiveMap />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
