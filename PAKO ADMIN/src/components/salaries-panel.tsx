"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Calendar, DollarSign, Clock } from 'lucide-react'

export function SalariesPanel() {
  const salaries = [
    { nom: "Kouadio Pascal", type: "Livreur", baseSalary: 150000, bonus: 67500, total: 217500, status: "Payé", month: "Janvier 2024" },
    { nom: "Bakayoko Ismaël", type: "Livreur", baseSalary: 150000, bonus: 57000, total: 207000, status: "Payé", month: "Janvier 2024" },
    { nom: "Koné Moussa", type: "Livreur", baseSalary: 150000, bonus: 78000, total: 228000, status: "En attente", month: "Janvier 2024" },
    { nom: "Ouattara Salif", type: "Livreur", baseSalary: 150000, bonus: 43500, total: 193500, status: "En attente", month: "Janvier 2024" },
    { nom: "Koné Aïcha", type: "Agent de gare", baseSalary: 120000, bonus: 91500, total: 211500, status: "Payé", month: "Janvier 2024" },
    { nom: "Ouattara Bruno", type: "Agent de gare", baseSalary: 120000, bonus: 81000, total: 201000, status: "En attente", month: "Janvier 2024" },
    { nom: "N'dri Prisca", type: "Agent de gare", baseSalary: 120000, bonus: 72000, total: 192000, status: "Payé", month: "Janvier 2024" },
  ]

  const [roleFilter, setRoleFilter] = useState<"all" | "Livreur" | "Agent de gare">("all")

  const { totalMontant, livreurTotal, agentTotal, pendingCount, pendingAmount, paidCount, paidAmount } = useMemo(() => {
    const total = salaries.reduce((sum, item) => sum + item.total, 0)
    const drivers = salaries.filter((item) => item.type === "Livreur").reduce((sum, item) => sum + item.total, 0)
    const agents = salaries.filter((item) => item.type === "Agent de gare").reduce((sum, item) => sum + item.total, 0)
    const pendingItems = salaries.filter((item) => item.status !== "Payé")
    const pendingSum = pendingItems.reduce((sum, item) => sum + item.total, 0)
    const paidItems = salaries.filter((item) => item.status === "Payé")
    const paidSum = paidItems.reduce((sum, item) => sum + item.total, 0)

    return {
      totalMontant: total,
      livreurTotal: drivers,
      agentTotal: agents,
      pendingCount: pendingItems.length,
      pendingAmount: pendingSum,
      paidCount: paidItems.length,
      paidAmount: paidSum,
    }
  }, [salaries])

  const filteredSalaries =
    roleFilter === "all" ? salaries : salaries.filter((item) => item.type === roleFilter)

  const formatCurrency = (amount: number) =>
    `${Intl.NumberFormat("fr-FR").format(amount)} FCFA`

  // Calculer la date de paiement (dernier jour du mois)
  const getCurrentMonth = () => {
    const now = new Date()
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
                       "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
    return `${monthNames[now.getMonth()]} ${now.getFullYear()}`
  }

  const getPaymentDate = () => {
    const now = new Date()
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return lastDay.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
  }

  return (
    <div className="space-y-8">
      {/* En-tête amélioré */}
      <div className="space-y-3">
        <h2 className="text-4xl font-extrabold text-foreground tracking-tight">Gestion des Salaires</h2>
        <p className="text-base text-muted-foreground">
          Paiement mensuel des salaires des livreurs et agents de gare Pako Pro (fin de mois)
        </p>
      </div>

      {/* Informations sur le paiement mensuel */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Période de paie</p>
                <p className="text-xs text-muted-foreground">
                  {getCurrentMonth()} • Date de paiement: {getPaymentDate()}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              <Clock className="h-4 w-4 mr-1" />
              Fin de mois
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cartes KPIs améliorées */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Total du mois
              </CardTitle>
              <div className="text-3xl font-extrabold text-foreground pt-2">
                {formatCurrency(totalMontant).split(' ')[0]}
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{getCurrentMonth()}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-secondary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Salaires payés
              </CardTitle>
              <div className="text-3xl font-extrabold text-foreground pt-2">
                {formatCurrency(paidAmount).split(' ')[0]}
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{paidCount} employés payés</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                En attente
              </CardTitle>
              <div className="text-3xl font-extrabold text-foreground pt-2">
                {formatCurrency(pendingAmount).split(' ')[0]}
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{pendingCount} employés en attente</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-1 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Répartition Pako Pro
              </CardTitle>
            </div>
            <div className="h-12 w-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-chart-1" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Livreurs</span>
              <span className="text-lg font-bold text-foreground">{formatCurrency(livreurTotal)}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Agents de gare</span>
              <span className="text-lg font-bold text-foreground">{formatCurrency(agentTotal)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Salaires Pako Pro</CardTitle>
              <CardDescription>Détail des salaires mensuels par livreur et agent de gare</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex rounded-md border bg-muted/30 p-1">
                {["all", "Livreur", "Agent de gare"].map((role) => (
                  <Button
                    key={role}
                    variant={roleFilter === role ? "default" : "ghost"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setRoleFilter(role as typeof roleFilter)}
                  >
                    {role === "all" ? "Tous" : role}
                  </Button>
                ))}
              </div>
              <Button>
                <DollarSign className="h-4 w-4 mr-2" />
                Effectuer paiements
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Employé</th>
                    <th className="p-3 text-left text-sm font-medium">Rôle</th>
                    <th className="p-3 text-left text-sm font-medium">Salaire de base</th>
                    <th className="p-3 text-left text-sm font-medium">Bonus</th>
                    <th className="p-3 text-left text-sm font-medium">Total</th>
                    <th className="p-3 text-left text-sm font-medium">Mois</th>
                    <th className="p-3 text-left text-sm font-medium">Statut</th>
                    <th className="p-3 text-left text-sm font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalaries.map((salary, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-3 text-sm font-medium">{salary.nom}</td>
                      <td className="p-3 text-sm">
                        <Badge variant={salary.type === "Livreur" ? "secondary" : "outline"}>
                          {salary.type}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">{formatCurrency(salary.baseSalary)}</td>
                      <td className="p-3 text-sm text-green-600 font-medium">+{formatCurrency(salary.bonus)}</td>
                      <td className="p-3 text-sm font-semibold">{formatCurrency(salary.total)}</td>
                      <td className="p-3 text-sm text-muted-foreground">{salary.month}</td>
                      <td className="p-3 text-sm">
                        <Badge variant={salary.status === "Payé" ? "secondary" : "outline"}>
                          {salary.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        {salary.status === "En attente" && (
                          <Button variant="ghost" size="sm">Payer</Button>
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

