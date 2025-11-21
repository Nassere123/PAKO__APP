import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FaWarehouse, FaMapMarkerAlt, FaUsers, FaBox, FaTrash } from 'react-icons/fa'
import { Search, Plus, Trash2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Gare {
  id: string
  name: string
  address: string
  city: string
  agents: number
  colisToday: number
  status: string
  capacity: number
  occupancy: number
}

export function GaresPanel() {
  const { toast } = useToast()
  const [gares, setGares] = useState<Gare[]>([
    { 
      id: "GARE-001", 
      name: "Gare Centrale Abidjan", 
      address: "Boulevard de la République, Plateau", 
      city: "Abidjan", 
      agents: 12, 
      colisToday: 245, 
      status: "Actif",
      capacity: 5000,
      occupancy: 68
    },
    { 
      id: "GARE-002", 
      name: "Gare Cocody", 
      address: "Avenue Franchet d'Esperey, Cocody", 
      city: "Abidjan", 
      agents: 8, 
      colisToday: 189, 
      status: "Actif",
      capacity: 3500,
      occupancy: 54
    },
    { 
      id: "GARE-003", 
      name: "Gare Yopougon", 
      address: "Carrefour Sicogi, Yopougon", 
      city: "Abidjan", 
      agents: 10, 
      colisToday: 312, 
      status: "Actif",
      capacity: 4500,
      occupancy: 69
    },
    { 
      id: "GARE-004", 
      name: "Gare Marcory", 
      address: "Boulevard de la Paix, Marcory", 
      city: "Abidjan", 
      agents: 6, 
      colisToday: 156, 
      status: "Actif",
      capacity: 2800,
      occupancy: 56
    },
    { 
      id: "GARE-005", 
      name: "Gare Bouaké", 
      address: "Avenue de la République, Bouaké", 
      city: "Bouaké", 
      agents: 9, 
      colisToday: 201, 
      status: "Actif",
      capacity: 4000,
      occupancy: 50
    },
    { 
      id: "GARE-006", 
      name: "Gare San-Pédro", 
      address: "Zone Portuaire, San-Pédro", 
      city: "San-Pédro", 
      agents: 5, 
      colisToday: 98, 
      status: "Maintenance",
      capacity: 2000,
      occupancy: 49
    },
  ])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [gareToDelete, setGareToDelete] = useState<Gare | null>(null)

  const handleDeleteClick = (gare: Gare) => {
    setGareToDelete(gare)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (gareToDelete) {
      setGares(prev => prev.filter(g => g.id !== gareToDelete.id))
      toast({
        title: "Gare supprimée",
        description: `La gare "${gareToDelete.name}" a été supprimée avec succès.`,
      })
      setDeleteDialogOpen(false)
      setGareToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setGareToDelete(null)
  }

  const totalGares = gares.length
  const activeGares = gares.filter(g => g.status === "Actif").length
  const totalAgents = gares.reduce((sum, g) => sum + g.agents, 0)
  const totalColisToday = gares.reduce((sum, g) => sum + g.colisToday, 0)

  return (
    <div className="space-y-8">
      {/* En-tête amélioré */}
      <div className="space-y-3">
        <h2 className="text-4xl font-extrabold text-foreground tracking-tight">Gestion des Gares</h2>
        <p className="text-base text-muted-foreground">
          Administration des gares et points de collecte
        </p>
      </div>

      {/* Cartes KPIs améliorées */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Total Gares
              </CardTitle>
              <div className="text-4xl font-extrabold text-foreground pt-2">{totalGares}</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FaWarehouse className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Gares enregistrées</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-secondary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Gares Actives
              </CardTitle>
              <div className="text-4xl font-extrabold text-secondary pt-2">{activeGares}</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <FaMapMarkerAlt className="h-6 w-6 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">En fonctionnement</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-1 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Agents Total
              </CardTitle>
              <div className="text-4xl font-extrabold text-foreground pt-2">{totalAgents}</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
              <FaUsers className="h-6 w-6 text-chart-1" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Agents de gare</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-2 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Colis Aujourd'hui
              </CardTitle>
              <div className="text-4xl font-extrabold text-foreground pt-2">{totalColisToday}</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <FaBox className="h-6 w-6 text-chart-2" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Colis traités</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">Liste des Gares</CardTitle>
              <CardDescription>Gestion et suivi des gares</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une gare..."
                  className="pl-8 w-64"
                />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une gare
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left text-sm font-medium">ID</th>
                  <th className="p-3 text-left text-sm font-medium">Nom</th>
                  <th className="p-3 text-left text-sm font-medium">Adresse</th>
                  <th className="p-3 text-left text-sm font-medium">Ville</th>
                  <th className="p-3 text-left text-sm font-medium">Agents</th>
                  <th className="p-3 text-left text-sm font-medium">Colis Aujourd'hui</th>
                  <th className="p-3 text-left text-sm font-medium">Capacité</th>
                  <th className="p-3 text-left text-sm font-medium">Occupation</th>
                  <th className="p-3 text-left text-sm font-medium">Statut</th>
                  <th className="p-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {gares.map((gare) => (
                  <tr key={gare.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 text-sm font-mono text-muted-foreground">{gare.id}</td>
                    <td className="p-3 text-sm font-medium">{gare.name}</td>
                    <td className="p-3 text-sm text-muted-foreground">{gare.address}</td>
                    <td className="p-3 text-sm">{gare.city}</td>
                    <td className="p-3 text-sm">{gare.agents}</td>
                    <td className="p-3 text-sm font-semibold">{gare.colisToday}</td>
                    <td className="p-3 text-sm text-muted-foreground">{gare.capacity.toLocaleString()}</td>
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              gare.occupancy >= 80 ? 'bg-destructive' : 
                              gare.occupancy >= 60 ? 'bg-chart-1' : 
                              'bg-secondary'
                            }`}
                            style={{ width: `${gare.occupancy}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{gare.occupancy}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      <Badge variant={gare.status === "Actif" ? "default" : "secondary"}>
                        {gare.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">Modifier</Button>
                        <Button variant="ghost" size="sm">Détails</Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteClick(gare)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la gare <strong>"{gareToDelete?.name}"</strong> ?
              <br />
              <span className="text-destructive font-medium">Cette action est irréversible.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <FaTrash className="h-4 w-4 mr-2" />
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

