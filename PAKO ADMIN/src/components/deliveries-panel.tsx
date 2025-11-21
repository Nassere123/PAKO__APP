import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Clock, CheckCircle2, AlertTriangle, Filter, Search } from "lucide-react"

interface Delivery {
  id: string
  client: string
  driver: string
  origin: string
  destination: string
  status: "En cours" | "Livrée" | "En attente"
  eta: string
  updatedAt: string
}

const mockDeliveries: Delivery[] = [
  { id: "PKO-2024-091", client: "Kouassi Mireille", driver: "Kouadio Pascal", origin: "Gare Cocody", destination: "Marcory", status: "En cours", eta: "15 min", updatedAt: "Il y a 2 min" },
  { id: "PKO-2024-090", client: "Bakayoko Ismaël", driver: "Koné Moussa", origin: "Gare Yopougon", destination: "Cocody", status: "Livrée", eta: "-", updatedAt: "Il y a 5 min" },
  { id: "PKO-2024-089", client: "N'dri Prisca", driver: "Traoré Amadou", origin: "Gare Plateau", destination: "Riviera 3", status: "En attente", eta: "—", updatedAt: "Il y a 8 min" },
  { id: "PKO-2024-088", client: "Koné Aïcha", driver: "Ouattara Salif", origin: "Gare Marcory", destination: "Zone 4", status: "En cours", eta: "30 min", updatedAt: "Il y a 3 min" },
  { id: "PKO-2024-087", client: "Yeo Mamadou", driver: "Koffi Sébastien", origin: "Gare Bouaké", destination: "Yamoussoukro", status: "Livrée", eta: "-", updatedAt: "Il y a 15 min" },
]

export function DeliveriesPanel() {
  const [statusFilter, setStatusFilter] = useState<"all" | Delivery["status"]>("all")

  const { inProgress, delivered, pending } = useMemo(() => {
    return {
      inProgress: mockDeliveries.filter(d => d.status === "En cours").length,
      delivered: mockDeliveries.filter(d => d.status === "Livrée").length,
      pending: mockDeliveries.filter(d => d.status === "En attente").length,
    }
  }, [])

  const filteredDeliveries =
    statusFilter === "all"
      ? mockDeliveries
      : mockDeliveries.filter((delivery) => delivery.status === statusFilter)

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="space-y-3">
        <h2 className="text-4xl font-extrabold text-foreground tracking-tight">Gestion des livraisons</h2>
        <p className="text-base text-muted-foreground">
          Suivi des livraisons en temps réel et état des commandes
        </p>
      </div>

      {/* Cartes KPI */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Livraisons en cours
              </CardTitle>
              <div className="text-4xl font-extrabold text-primary pt-2">{inProgress}</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Suivies en temps réel</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Livraisons livrées
              </CardTitle>
              <div className="text-4xl font-extrabold text-foreground pt-2">{delivered}</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Aujourd&apos;hui</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                En attente
              </CardTitle>
              <div className="text-4xl font-extrabold text-destructive pt-2">{pending}</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Prêtes à être affectées</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Suivi des livraisons</CardTitle>
              <CardDescription>Liste des livraisons en temps réel</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex rounded-md border bg-muted/30 p-1">
                {["all", "En cours", "Livrée", "En attente"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "ghost"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setStatusFilter(status as typeof statusFilter)}
                  >
                    {status === "all" ? "Toutes" : status}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtres avancés
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher une livraison..." className="pl-8" />
            </div>
          </div>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">ID</th>
                    <th className="p-3 text-left text-sm font-medium">Client</th>
                    <th className="p-3 text-left text-sm font-medium">Livreur</th>
                    <th className="p-3 text-left text-sm font-medium">Trajet</th>
                    <th className="p-3 text-left text-sm font-medium">Statut</th>
                    <th className="p-3 text-left text-sm font-medium">ETA</th>
                    <th className="p-3 text-left text-sm font-medium">Mise à jour</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeliveries.map((delivery) => (
                    <tr key={delivery.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 text-sm font-mono text-muted-foreground">{delivery.id}</td>
                      <td className="p-3 text-sm font-medium">{delivery.client}</td>
                      <td className="p-3 text-sm">{delivery.driver}</td>
                      <td className="p-3 text-sm">
                        <div className="flex flex-col text-xs text-muted-foreground">
                          <span>Départ: {delivery.origin}</span>
                          <span>Arrivée: {delivery.destination}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <Badge
                          variant={
                            delivery.status === "Livrée"
                              ? "secondary"
                              : delivery.status === "En cours"
                              ? "default"
                              : "outline"
                          }
                        >
                          {delivery.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm font-semibold">{delivery.eta}</td>
                      <td className="p-3 text-sm text-muted-foreground">{delivery.updatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

