"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DollarSign, Search, Download, Filter, TrendingUp, CreditCard, Wallet, Smartphone } from 'lucide-react'

interface PaymentMethod {
  type: "cash" | "mobile_money" | "card" | "bank_transfer"
  label: string
  icon: any
  color: string
}

const paymentMethods: PaymentMethod[] = [
  { type: "cash", label: "Espèces", icon: DollarSign, color: "text-green-600" },
  { type: "mobile_money", label: "Mobile Money", icon: Smartphone, color: "text-blue-600" },
  { type: "card", label: "Carte bancaire", icon: CreditCard, color: "text-purple-600" },
  { type: "bank_transfer", label: "Virement", icon: Wallet, color: "text-orange-600" },
]

export function TransactionsPanel() {
  const transactions = [
    { 
      id: "TXN-001", 
      date: "2024-01-15 14:30", 
      client: "Jean Kouassi", 
      livreur: "Kouadio Pascal",
      delivery: "PKO-2024-087",
      amount: 5000, 
      paymentMethod: "cash" as const,
      status: "Payé" 
    },
    { 
      id: "TXN-002", 
      date: "2024-01-15 14:25", 
      client: "Marie Diallo", 
      livreur: "Bakayoko Ismaël",
      delivery: "PKO-2024-086",
      amount: 8500, 
      paymentMethod: "mobile_money" as const,
      status: "Payé" 
    },
    { 
      id: "TXN-003", 
      date: "2024-01-15 14:20", 
      client: "Amadou Traoré", 
      livreur: "Koné Moussa",
      delivery: "PKO-2024-085",
      amount: 12000, 
      paymentMethod: "card" as const,
      status: "Payé" 
    },
    { 
      id: "TXN-004", 
      date: "2024-01-15 14:15", 
      client: "Fatou Keita", 
      livreur: "Ouattara Salif",
      delivery: "PKO-2024-084",
      amount: 6500, 
      paymentMethod: "mobile_money" as const,
      status: "Payé" 
    },
    { 
      id: "TXN-005", 
      date: "2024-01-15 14:10", 
      client: "Yao N'Guessan", 
      livreur: "Traoré Amadou",
      delivery: "PKO-2024-083",
      amount: 9500, 
      paymentMethod: "cash" as const,
      status: "En attente" 
    },
    { 
      id: "TXN-006", 
      date: "2024-01-15 14:05", 
      client: "Koné Fatou", 
      livreur: "Kouadio Pascal",
      delivery: "PKO-2024-082",
      amount: 11000, 
      paymentMethod: "bank_transfer" as const,
      status: "Payé" 
    },
  ]

  const formatCurrency = (amount: number) => `${Intl.NumberFormat("fr-FR").format(amount)} FCFA`
  
  const getPaymentMethod = (type: string) => {
    return paymentMethods.find(m => m.type === type) || paymentMethods[0]
  }

  const totalToday = transactions.reduce((sum, t) => sum + t.amount, 0)
  const paidToday = transactions.filter(t => t.status === "Payé").length
  const pendingToday = transactions.filter(t => t.status === "En attente").length

  return (
    <div className="space-y-8">
      {/* En-tête amélioré */}
      <div className="space-y-3">
        <h2 className="text-4xl font-extrabold text-foreground tracking-tight">Paiements Clients</h2>
        <p className="text-base text-muted-foreground">
          Suivi des paiements effectués par les clients aux livreurs après livraison
        </p>
      </div>

      {/* Cartes KPIs améliorées */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Paiements du jour
              </CardTitle>
              <div className="text-4xl font-extrabold text-foreground pt-2">{transactions.length}</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-semibold">+{paidToday}</span>
              <span className="text-muted-foreground">paiements validés</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-secondary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Montant total
              </CardTitle>
              <div className="text-3xl font-extrabold text-foreground pt-2">
                {formatCurrency(totalToday).split(' ')[0]}
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">FCFA collectés aujourd'hui</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                En attente
              </CardTitle>
              <div className="text-4xl font-extrabold text-foreground pt-2">{pendingToday}</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Paiements non validés</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Historique des paiements</CardTitle>
              <CardDescription>Paiements clients → livreurs après livraison</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un paiement..." className="pl-8" />
            </div>
          </div>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">ID Transaction</th>
                    <th className="p-3 text-left text-sm font-medium">Date & Heure</th>
                    <th className="p-3 text-left text-sm font-medium">Client</th>
                    <th className="p-3 text-left text-sm font-medium">Livreur</th>
                    <th className="p-3 text-left text-sm font-medium">Livraison</th>
                    <th className="p-3 text-left text-sm font-medium">Montant</th>
                    <th className="p-3 text-left text-sm font-medium">Moyen de paiement</th>
                    <th className="p-3 text-left text-sm font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => {
                    const paymentMethod = getPaymentMethod(transaction.paymentMethod)
                    const PaymentIcon = paymentMethod.icon
                    return (
                      <tr key={transaction.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 text-sm font-mono text-muted-foreground">{transaction.id}</td>
                        <td className="p-3 text-sm">{transaction.date}</td>
                        <td className="p-3 text-sm font-medium">{transaction.client}</td>
                        <td className="p-3 text-sm">{transaction.livreur}</td>
                        <td className="p-3 text-sm font-mono text-primary">{transaction.delivery}</td>
                        <td className="p-3 text-sm font-semibold">{formatCurrency(transaction.amount)}</td>
                        <td className="p-3 text-sm">
                          <div className="flex items-center gap-2">
                            <PaymentIcon className={`h-4 w-4 ${paymentMethod.color}`} />
                            <span className="text-muted-foreground">{paymentMethod.label}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          <Badge variant={transaction.status === "Payé" ? "secondary" : "outline"}>
                            {transaction.status}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
