"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react'

export function ReportsPanel() {
  const reports = [
    { name: "Rapport mensuel Janvier 2024", type: "Mensuel", date: "2024-01-31", size: "2.4 MB", status: "Disponible" },
    { name: "Rapport hebdomadaire S3", type: "Hebdomadaire", date: "2024-01-21", size: "856 KB", status: "Disponible" },
    { name: "Rapport de performance livreurs", type: "Personnalisé", date: "2024-01-15", size: "1.2 MB", status: "Disponible" },
    { name: "Analyse transactions Q1 2024", type: "Trimestriel", date: "En cours", size: "-", status: "En génération" },
  ]

  return (
    <div className="space-y-8">
      {/* En-tête amélioré */}
      <div className="space-y-3">
        <h2 className="text-4xl font-extrabold text-foreground tracking-tight">Génération de rapports</h2>
        <p className="text-base text-muted-foreground">
          Créer et télécharger des rapports d'activité
        </p>
      </div>

      {/* Boutons de génération améliorés */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="group cursor-pointer border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 flex flex-col items-center justify-center gap-3 h-full">
            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <span className="font-semibold text-center">Rapport quotidien</span>
          </CardContent>
        </Card>
        <Card className="group cursor-pointer border-2 hover:border-secondary/50 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 flex flex-col items-center justify-center gap-3 h-full">
            <div className="h-16 w-16 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
              <Calendar className="h-8 w-8 text-secondary" />
            </div>
            <span className="font-semibold text-center">Rapport hebdomadaire</span>
          </CardContent>
        </Card>
        <Card className="group cursor-pointer border-2 hover:border-chart-1/50 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 flex flex-col items-center justify-center gap-3 h-full">
            <div className="h-16 w-16 rounded-xl bg-chart-1/10 flex items-center justify-center group-hover:bg-chart-1/20 transition-colors">
              <TrendingUp className="h-8 w-8 text-chart-1" />
            </div>
            <span className="font-semibold text-center">Rapport mensuel</span>
          </CardContent>
        </Card>
        <Card className="group cursor-pointer border-2 hover:border-chart-2/50 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 flex flex-col items-center justify-center gap-3 h-full">
            <div className="h-16 w-16 rounded-xl bg-chart-2/10 flex items-center justify-center group-hover:bg-chart-2/20 transition-colors">
              <FileText className="h-8 w-8 text-chart-2" />
            </div>
            <span className="font-semibold text-center">Rapport personnalisé</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-card-foreground">Rapports récents</CardTitle>
          <CardDescription>Historique des rapports générés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Nom du rapport</th>
                    <th className="p-3 text-left text-sm font-medium">Type</th>
                    <th className="p-3 text-left text-sm font-medium">Date</th>
                    <th className="p-3 text-left text-sm font-medium">Taille</th>
                    <th className="p-3 text-left text-sm font-medium">Statut</th>
                    <th className="p-3 text-left text-sm font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-3 text-sm font-medium">{report.name}</td>
                      <td className="p-3 text-sm">{report.type}</td>
                      <td className="p-3 text-sm">{report.date}</td>
                      <td className="p-3 text-sm">{report.size}</td>
                      <td className="p-3 text-sm">{report.status}</td>
                      <td className="p-3 text-sm">
                        {report.status === "Disponible" && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </Button>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-card-foreground">Statistiques des rapports</CardTitle>
          <CardDescription>Aperçu de l'utilisation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Rapports ce mois</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Espace utilisé</p>
              <p className="text-2xl font-bold">45.2 MB</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Téléchargements</p>
              <p className="text-2xl font-bold">187</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
