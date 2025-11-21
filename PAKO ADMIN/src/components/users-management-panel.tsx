import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, UserPlus, Search, TrendingUp, ShoppingBag, Briefcase } from 'lucide-react'

export function UsersManagementPanel() {
  const clients = [
    { id: "USR-001", name: "Marie Diallo", email: "marie.diallo@email.com", phone: "+225 07 12 34 56 78", status: "Actif", joined: "2024-01-10", orders: 12 },
    { id: "USR-003", name: "Jean Kouassi", email: "jean.kouassi@email.com", phone: "+225 07 45 67 89 01", status: "Actif", joined: "2024-01-12", orders: 8 },
    { id: "USR-007", name: "Fatou Keita", email: "fatou.keita@email.com", phone: "+225 07 88 99 00 11", status: "Actif", joined: "2024-01-15", orders: 15 },
    { id: "USR-008", name: "Amadou Traoré", email: "amadou.traore@email.com", phone: "+225 05 11 22 33 44", status: "Inactif", joined: "2024-01-08", orders: 3 },
  ]

  const travailleurs = [
    { id: "USR-002", name: "Kouadio Pascal", email: "kouadio.pascal@email.com", phone: "+225 05 98 76 54 32", type: "Livreur", status: "Actif", joined: "2024-01-08", deliveries: 45 },
    { id: "USR-004", name: "Bakayoko Ismaël", email: "bakayoko.ismael@email.com", phone: "+225 05 23 45 67 89", type: "Livreur", status: "Inactif", joined: "2024-01-05", deliveries: 38 },
    { id: "USR-005", name: "Koné Aïcha", email: "aicha.kone@email.com", phone: "+225 07 55 22 33 11", type: "Agent de gare", status: "Actif", joined: "2024-01-03", packages: 3421 },
    { id: "USR-006", name: "Ouattara Bruno", email: "bruno.ouattara@email.com", phone: "+225 05 66 44 55 22", type: "Agent de gare", status: "Actif", joined: "2024-01-02", packages: 2890 },
    { id: "USR-009", name: "Koné Moussa", email: "moussa.kone@email.com", phone: "+225 05 77 88 99 00", type: "Livreur", status: "Actif", joined: "2024-01-10", deliveries: 52 },
    { id: "USR-010", name: "Traoré Amadou", email: "amadou.traore@email.com", phone: "+225 05 44 55 66 77", type: "Livreur", status: "Actif", joined: "2024-01-11", deliveries: 29 },
  ]

  const [searchClient, setSearchClient] = useState("")
  const [searchTravailleur, setSearchTravailleur] = useState("")

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchClient.toLowerCase()) ||
    client.email.toLowerCase().includes(searchClient.toLowerCase()) ||
    client.phone.includes(searchClient)
  )

  const filteredTravailleurs = travailleurs.filter(travailleur =>
    travailleur.name.toLowerCase().includes(searchTravailleur.toLowerCase()) ||
    travailleur.email.toLowerCase().includes(searchTravailleur.toLowerCase()) ||
    travailleur.phone.includes(searchTravailleur)
  )

  return (
    <div className="space-y-8">
      {/* En-tête amélioré */}
      <div className="space-y-3">
        <h2 className="text-4xl font-extrabold text-foreground tracking-tight">Gestion des comptes utilisateurs</h2>
        <p className="text-base text-muted-foreground">
          Administration des utilisateurs Pako Client et Pako Pro
        </p>
      </div>

      {/* Cartes KPIs améliorées */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Total utilisateurs
              </CardTitle>
              <div className="text-4xl font-extrabold text-foreground pt-2">3,878</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <UserPlus className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-semibold">+210</span>
              <span className="text-muted-foreground">ce mois</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-secondary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Pako Client
              </CardTitle>
              <div className="text-4xl font-extrabold text-foreground pt-2">2,134</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Clients actifs</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-1 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Pako Pro · Livreurs
              </CardTitle>
              <div className="text-4xl font-extrabold text-foreground pt-2">890</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-chart-1" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Livreurs actifs</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-2 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Pako Pro · Agents
              </CardTitle>
              <div className="text-4xl font-extrabold text-foreground pt-2">854</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-chart-2" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Agents de gare actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Section Clients */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <CardTitle>Clients (Pako Client)</CardTitle>
              <CardDescription>Gestion des comptes clients particuliers - Les clients créent eux-mêmes leur compte</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un client..." 
                className="pl-8" 
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
              />
            </div>
          </div>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">ID</th>
                    <th className="p-3 text-left text-sm font-medium">Nom</th>
                    <th className="p-3 text-left text-sm font-medium">Email</th>
                    <th className="p-3 text-left text-sm font-medium">Téléphone</th>
                    <th className="p-3 text-left text-sm font-medium">Commandes</th>
                    <th className="p-3 text-left text-sm font-medium">Statut</th>
                    <th className="p-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-sm font-mono text-muted-foreground">{client.id}</td>
                      <td className="p-3 text-sm font-medium">{client.name}</td>
                      <td className="p-3 text-sm">{client.email}</td>
                      <td className="p-3 text-sm">{client.phone}</td>
                      <td className="p-3 text-sm">
                        <Badge variant="outline">{client.orders} commandes</Badge>
                      </td>
                      <td className="p-3 text-sm">
                        <Badge variant={client.status === "Actif" ? "secondary" : "outline"}>
                          {client.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">Modifier</Button>
                          <Button variant="ghost" size="sm">Voir</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Travailleurs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Travailleurs (Pako Pro)</CardTitle>
                <CardDescription>Gestion des livreurs et agents de gare</CardDescription>
              </div>
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter travailleur
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un travailleur..." 
                className="pl-8" 
                value={searchTravailleur}
                onChange={(e) => setSearchTravailleur(e.target.value)}
              />
            </div>
          </div>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">ID</th>
                    <th className="p-3 text-left text-sm font-medium">Nom</th>
                    <th className="p-3 text-left text-sm font-medium">Email</th>
                    <th className="p-3 text-left text-sm font-medium">Téléphone</th>
                    <th className="p-3 text-left text-sm font-medium">Rôle</th>
                    <th className="p-3 text-left text-sm font-medium">Performance</th>
                    <th className="p-3 text-left text-sm font-medium">Statut</th>
                    <th className="p-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTravailleurs.map((travailleur) => (
                    <tr key={travailleur.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-sm font-mono text-muted-foreground">{travailleur.id}</td>
                      <td className="p-3 text-sm font-medium">{travailleur.name}</td>
                      <td className="p-3 text-sm">{travailleur.email}</td>
                      <td className="p-3 text-sm">{travailleur.phone}</td>
                      <td className="p-3 text-sm">
                        <Badge
                          variant={
                            travailleur.type === "Livreur"
                              ? "secondary"
                              : "default"
                          }
                        >
                          {travailleur.type}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        {travailleur.type === "Livreur" ? (
                          <Badge variant="outline">{travailleur.deliveries} livraisons</Badge>
                        ) : (
                          <Badge variant="outline">{travailleur.packages} colis vérifiés</Badge>
                        )}
                      </td>
                      <td className="p-3 text-sm">
                        <Badge variant={travailleur.status === "Actif" ? "secondary" : "outline"}>
                          {travailleur.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">Modifier</Button>
                          <Button variant="ghost" size="sm">Voir</Button>
                        </div>
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
