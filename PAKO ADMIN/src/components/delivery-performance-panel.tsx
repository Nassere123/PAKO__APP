import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, TrendingUp, Clock, MapPin } from "lucide-react"
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from "recharts"

const weeklyPerformance = [
  { day: "Lun", deliveries: 120, avgTime: 32 },
  { day: "Mar", deliveries: 138, avgTime: 30 },
  { day: "Mer", deliveries: 142, avgTime: 28 },
  { day: "Jeu", deliveries: 150, avgTime: 27 },
  { day: "Ven", deliveries: 162, avgTime: 26 },
  { day: "Sam", deliveries: 140, avgTime: 29 },
  { day: "Dim", deliveries: 95, avgTime: 31 },
]

const hotspotData = [
  { zone: "Cocody", deliveries: 58, avgTime: "24 min", trend: "+5%" },
  { zone: "Marcory", deliveries: 47, avgTime: "27 min", trend: "+3%" },
  { zone: "Yopougon", deliveries: 42, avgTime: "32 min", trend: "-2%" },
]

export function DeliveryPerformancePanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-card-foreground">Performance des livraisons</CardTitle>
        <CardDescription>Vue consolidée des livraisons de la semaine</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-xl bg-muted/40 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4 text-primary" />
              Livraisons aujourd&apos;hui
            </div>
            <p className="text-3xl font-extrabold text-foreground">156</p>
            <Badge variant="outline" className="text-xs text-green-600 border-green-200">
              +12 livraisons vs hier
            </Badge>
          </div>

          <div className="p-4 border rounded-xl bg-muted/40 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-secondary" />
              Taux de réussite
            </div>
            <p className="text-3xl font-extrabold text-secondary">96%</p>
            <span className="text-xs text-muted-foreground">Livraisons livrées dans les temps</span>
          </div>

          <div className="p-4 border rounded-xl bg-muted/40 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-chart-1" />
              Temps moyen
            </div>
            <p className="text-3xl font-extrabold text-chart-1">28 min</p>
            <span className="text-xs text-muted-foreground">Sur les 50 dernières livraisons</span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="p-4 border rounded-xl bg-card shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Livraisons par jour</p>
                <p className="text-lg font-semibold text-foreground">Tendance hebdomadaire</p>
              </div>
              <Badge variant="outline" className="text-xs">Semaine en cours</Badge>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyPerformance}>
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderRadius: "0.5rem",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--card-foreground))",
                    }}
                    formatter={(value) => [`${value} livraisons`, "Livraisons"]}
                  />
                  <Line type="monotone" dataKey="deliveries" stroke="#FF6B35" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 border rounded-xl bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zones chaudes</p>
                <p className="text-lg font-semibold text-foreground">Gares & zones à fort volume</p>
              </div>
              <Badge variant="secondary" className="text-xs">Top 3</Badge>
            </div>
            <div className="space-y-3">
              {hotspotData.map((spot) => (
                <div key={spot.zone} className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {spot.zone}
                    </p>
                    <p className="text-xs text-muted-foreground">{spot.deliveries} livraisons • {spot.avgTime}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{spot.trend}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

