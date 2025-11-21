"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'

export function IncidentsPanel() {
  const incidents = [
    { id: "INC-045", date: "2024-01-15 15:20", type: "Colis endommagé", user: "Marie Diallo", livreur: "Kouadio Pascal", priority: "Haute", status: "Ouvert" },
    { id: "INC-044", date: "2024-01-15 14:30", type: "Retard livraison", user: "Jean Kouassi", livreur: "Bakayoko Ismaël", priority: "Moyenne", status: "En cours" },
    { id: "INC-043", date: "2024-01-15 13:15", type: "Adresse incorrecte", user: "Amadou Traoré", livreur: "Koné Moussa", priority: "Basse", status: "Résolu" },
    { id: "INC-042", date: "2024-01-15 11:45", type: "Paiement échoué", user: "Fatou Keita", livreur: "-", priority: "Haute", status: "Résolu" },
  ]

  return (
    <div className="space-y-8">
      {/* En-tête amélioré */}
      <div className="space-y-3">
        <h2 className="text-4xl font-extrabold text-foreground tracking-tight">Gestion des incidents</h2>
        <p className="text-base text-muted-foreground">
          Suivi et résolution des problèmes sur la plateforme
        </p>
      </div>

      {/* Cartes KPIs améliorées */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-destructive shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Incidents actifs
              </CardTitle>
              <div className="text-4xl font-extrabold text-destructive pt-2">3</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Nécessitent action</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-1 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                En traitement
              </CardTitle>
              <div className="text-4xl font-extrabold text-foreground pt-2">7</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-chart-1" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">En cours de résolution</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-secondary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Résolus aujourd'hui
              </CardTitle>
              <div className="text-4xl font-extrabold text-foreground pt-2">12</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Temps moyen: 2.5h</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Liste des incidents</CardTitle>
              <CardDescription>Tous les incidents signalés</CardDescription>
            </div>
            <Button variant="outline">Filtrer par priorité</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">ID</th>
                    <th className="p-3 text-left text-sm font-medium">Date</th>
                    <th className="p-3 text-left text-sm font-medium">Type</th>
                    <th className="p-3 text-left text-sm font-medium">Client</th>
                    <th className="p-3 text-left text-sm font-medium">Livreur</th>
                    <th className="p-3 text-left text-sm font-medium">Priorité</th>
                    <th className="p-3 text-left text-sm font-medium">Statut</th>
                    <th className="p-3 text-left text-sm font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr key={incident.id} className="border-b">
                      <td className="p-3 text-sm font-mono">{incident.id}</td>
                      <td className="p-3 text-sm">{incident.date}</td>
                      <td className="p-3 text-sm">{incident.type}</td>
                      <td className="p-3 text-sm">{incident.user}</td>
                      <td className="p-3 text-sm">{incident.livreur}</td>
                      <td className="p-3 text-sm">
                        <Badge 
                          variant={
                            incident.priority === "Haute" ? "destructive" : 
                            incident.priority === "Moyenne" ? "default" : "outline"
                          }
                        >
                          {incident.priority}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        <Badge variant={incident.status === "Résolu" ? "secondary" : "outline"}>
                          {incident.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        {incident.status !== "Résolu" && (
                          <Button variant="ghost" size="sm">Traiter</Button>
                        )}
                      </td>
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
