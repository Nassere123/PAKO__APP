"use client"

import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, User, Package } from 'lucide-react'

const deliveries = [
  {
    id: "PKO-2024-001",
    client: "Kouassi Jean",
    livreur: "Yao Michel",
    depart: "Cocody",
    destination: "Yopougon",
    statut: "en_cours",
    temps: "15 min"
  },
  {
    id: "PKO-2024-002",
    client: "Diallo Fatou",
    livreur: "Koné Ibrahim",
    depart: "Plateau",
    destination: "Marcory",
    statut: "livree",
    temps: "Terminé"
  },
  {
    id: "PKO-2024-003",
    client: "N'Guessan Marie",
    livreur: "Traoré Sekou",
    depart: "Abobo",
    destination: "Adjamé",
    statut: "en_cours",
    temps: "8 min"
  },
  {
    id: "PKO-2024-004",
    client: "Bamba Ange",
    livreur: "Coulibaly Amadou",
    depart: "Treichville",
    destination: "Cocody",
    statut: "en_attente",
    temps: "Assigné"
  },
  {
    id: "PKO-2024-005",
    client: "Koné Aya",
    livreur: "Diabaté Ali",
    depart: "Marcory",
    destination: "Port-Bouët",
    statut: "livree",
    temps: "Terminé"
  }
]

const statutBadge = (statut: string) => {
  switch (statut) {
    case "livree":
      return <Badge className="bg-chart-3 text-chart-3-foreground">Livrée</Badge>
    case "en_cours":
      return <Badge className="bg-primary text-primary-foreground">En cours</Badge>
    case "en_attente":
      return <Badge variant="secondary">En attente</Badge>
    default:
      return <Badge variant="outline">{statut}</Badge>
  }
}

export function DeliveryTable() {
  return (
    <div className="space-y-4">
      {deliveries.map((delivery) => (
        <div
          key={delivery.id}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">{delivery.id}</span>
              {statutBadge(delivery.statut)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-3 w-3" />
                <span>Client: {delivery.client}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-3 w-3" />
                <span>Livreur: {delivery.livreur}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{delivery.depart}</span>
              </div>
              <span>→</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{delivery.destination}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{delivery.temps}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
