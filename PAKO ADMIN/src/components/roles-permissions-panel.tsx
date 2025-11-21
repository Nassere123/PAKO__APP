"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Plus } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"

export function RolesPermissionsPanel() {
  const roles = [
    { name: "Super Admin", users: 2, permissions: ["all"] },
    { name: "Admin", users: 5, permissions: ["dashboard", "transactions", "users", "reports"] },
  ]

  const permissions = [
    { id: "dashboard", label: "Accès tableau de bord", category: "Général" },
    { id: "transactions", label: "Gérer transactions", category: "Finances" },
    { id: "commissions", label: "Gérer commissions", category: "Finances" },
    { id: "incidents", label: "Gérer incidents", category: "Support" },
    { id: "users", label: "Gérer utilisateurs", category: "Administration" },
    { id: "roles", label: "Gérer rôles", category: "Administration" },
    { id: "reports", label: "Générer rapports", category: "Analyse" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Gestion des rôles et permissions</h2>
        <p className="text-muted-foreground">
          Configuration des accès et permissions administrateurs
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-card-foreground">Rôles existants</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau rôle
              </Button>
            </div>
            <CardDescription>Liste des rôles administrateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roles.map((role, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span className="font-semibold">{role.name}</span>
                      </div>
                      <Badge variant="outline">{role.users} utilisateurs</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {role.permissions.length} permissions assignées
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button variant="ghost" size="sm">Modifier</Button>
                      <Button variant="ghost" size="sm">Supprimer</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">Permissions disponibles</CardTitle>
            <CardDescription>Gérer les permissions système</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Général", "Finances", "Support", "Administration", "Analyse"].map((category) => (
                <div key={category}>
                  <h4 className="font-semibold text-sm mb-2">{category}</h4>
                  <div className="space-y-2 pl-4">
                    {permissions
                      .filter((p) => p.category === category)
                      .map((perm) => (
                        <div key={perm.id} className="flex items-center space-x-2">
                          <Checkbox id={perm.id} />
                          <label
                            htmlFor={perm.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {perm.label}
                          </label>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
