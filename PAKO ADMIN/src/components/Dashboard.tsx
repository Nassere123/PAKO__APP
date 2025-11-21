import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Users, TrendingUp, FileText, AlertCircle, Shield, DollarSign, BarChart3, LogOut, MapPin } from 'lucide-react'
import { FaShoppingBag, FaTruck, FaBuilding, FaWarehouse, FaDollarSign } from 'react-icons/fa'
import { StatsChart } from "@/components/stats-chart"
import { TransactionsPanel } from "@/components/transactions-panel"
import { SalariesPanel } from "@/components/salaries-panel"
import { IncidentsPanel } from "@/components/incidents-panel"
import { UsersManagementPanel } from "@/components/users-management-panel"
import { RolesPermissionsPanel } from "@/components/roles-permissions-panel"
import { ReportsPanel } from "@/components/reports-panel"
import { GaresPanel } from "@/components/gares-panel"
import { TrafficPanel } from "@/components/traffic-panel"
import { PricingPanel } from "@/components/pricing-panel"
import { DeliveriesPanel } from "@/components/deliveries-panel"
import { DeliveryPerformancePanel } from "@/components/delivery-performance-panel"
import { CustomerRatingsPanel } from "@/components/customer-ratings-panel"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const { user, logout } = useAuth()

  const stats = {
    totalDeliveries: 1248,
    activeUsers: 3878,
    pakoClientUsers: 2134,
    pakoProDrivers: 890,
    pakoProAgents: 854,
    completedToday: 87,
    pendingDeliveries: 23,
    revenue: "12,450,000 FCFA",
    todayTransactions: 156,
    activeIncidents: 3,
    commissionsTotal: "2,340,000 FCFA"
  }

  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: BarChart3 },
    { id: "transactions", label: "Paiements", icon: DollarSign },
    { id: "salaries", label: "Salaires", icon: TrendingUp },
    { id: "incidents", label: "Incidents", icon: AlertCircle },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "gares", label: "Gares", icon: FaWarehouse },
    { id: "traffic", label: "Trafic", icon: MapPin },
    { id: "deliveries", label: "Livraisons", icon: FaTruck },
    { id: "pricing", label: "Tarification", icon: FaDollarSign },
    { id: "roles", label: "Rôles & Permissions", icon: Shield },
    { id: "reports", label: "Rapports", icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r flex-shrink-0">
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-extrabold text-[#FF6B35] tracking-tight">PAKO ADMIN</h1>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            <h2 className="text-xl font-semibold text-foreground">
              {navItems.find(item => item.id === activeTab)?.label}
            </h2>
            
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground hidden sm:block">
                {user?.name || "Administrateur PAKO"}
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
                <div className="relative">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <div className="absolute inset-0 h-2 w-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">En ligne</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* En-tête amélioré avec plus d'espace */}
              <div className="space-y-3">
                <h2 className="text-4xl font-extrabold text-foreground tracking-tight">Tableau de bord</h2>
                <p className="text-base text-muted-foreground">
                  Vue d'ensemble de votre plateforme Pako
                </p>
              </div>

              {/* Statistiques principales - Améliorées */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Total Livraisons
                      </CardTitle>
                      <div className="text-4xl font-extrabold text-foreground pt-2">
                        {stats.totalDeliveries.toLocaleString()}
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-semibold">+12.5%</span>
                      <span className="text-muted-foreground">depuis le mois dernier</span>
                    </div>
                    {/* Mini graphique sparkline */}
                    <div className="h-12 w-full flex items-end gap-1">
                      {[45, 52, 48, 61, 55, 58, 67, 72, 68, 75, 78, 82].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-primary/20 rounded-t"
                          style={{ height: `${(height / 100) * 100}%` }}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-secondary shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Utilisateurs Actifs
                      </CardTitle>
                      <div className="text-4xl font-extrabold text-foreground pt-2">
                        {stats.activeUsers.toLocaleString()}
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-secondary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Client</div>
                        <div className="text-lg font-bold text-foreground">{stats.pakoClientUsers}</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Livreur</div>
                        <div className="text-lg font-bold text-foreground">{stats.pakoProDrivers}</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Agent</div>
                        <div className="text-lg font-bold text-foreground">{stats.pakoProAgents}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-chart-1 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Transactions Aujourd'hui
                      </CardTitle>
                      <div className="text-4xl font-extrabold text-foreground pt-2">
                        {stats.todayTransactions}
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-chart-1" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Revenu total</div>
                      <div className="text-xl font-bold text-foreground">{stats.revenue}</div>
                    </div>
                    {/* Mini graphique sparkline */}
                    <div className="h-12 w-full flex items-end gap-1">
                      {[32, 38, 35, 42, 40, 45, 48, 52, 50, 55, 58, 62].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-chart-1/20 rounded-t"
                          style={{ height: `${(height / 100) * 100}%` }}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-destructive shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Incidents Actifs
                      </CardTitle>
                      <div className="text-4xl font-extrabold text-foreground pt-2">
                        {stats.activeIncidents}
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-muted-foreground">Nécessitent attention immédiate</span>
                    </div>
                    <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                      <div className="text-xs text-destructive font-medium">Action requise</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Section Raccourcis Applications - Compacte */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Gestion des Applications</h3>
                  <p className="text-sm text-muted-foreground">Accès rapide aux dashboards spécifiques</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="group cursor-pointer border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <FaShoppingBag className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold text-foreground mb-1">Pako Client</CardTitle>
                          <CardDescription className="text-xs mb-3">Application clients particuliers</CardDescription>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <div className="text-xs text-muted-foreground">Utilisateurs</div>
                              <div className="text-lg font-bold text-foreground">{stats.pakoClientUsers}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Satisfaction</div>
                              <Badge className="bg-[#FF6B35] text-white text-xs px-2 py-0.5">94.5%</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group cursor-pointer border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <FaTruck className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold text-foreground mb-1">Pako Pro - Livreurs</CardTitle>
                          <CardDescription className="text-xs mb-3">Application livreurs professionnels</CardDescription>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <div className="text-xs text-muted-foreground">Livreurs</div>
                              <div className="text-lg font-bold text-foreground">{stats.pakoProDrivers}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Temps moyen</div>
                              <Badge className="bg-[#FF6B35] text-white text-xs px-2 py-0.5">28 min</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group cursor-pointer border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <FaBuilding className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold text-foreground mb-1">Pako Pro - Agents</CardTitle>
                          <CardDescription className="text-xs mb-3">Application agents de gare</CardDescription>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <div className="text-xs text-muted-foreground">Agents</div>
                              <div className="text-lg font-bold text-foreground">{stats.pakoProAgents}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Vérification</div>
                              <Badge className="bg-[#FF6B35] text-white text-xs px-2 py-0.5">98.2%</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Graphique des statistiques */}
              <StatsChart />

              {/* Performance livraisons et Évaluations clients */}
              <div className="grid gap-6 md:grid-cols-2">
                <DeliveryPerformancePanel />
                <CustomerRatingsPanel />
              </div>
            </div>
          )}

          {activeTab === "transactions" && <TransactionsPanel />}
          {activeTab === "salaries" && <SalariesPanel />}
          {activeTab === "incidents" && <IncidentsPanel />}
          {activeTab === "users" && <UsersManagementPanel />}
          {activeTab === "gares" && <GaresPanel />}
          {activeTab === "traffic" && <TrafficPanel />}
          {activeTab === "deliveries" && <DeliveriesPanel />}
          {activeTab === "pricing" && <PricingPanel />}
          {activeTab === "roles" && <RolesPermissionsPanel />}
          {activeTab === "reports" && <ReportsPanel />}
        </main>
      </div>
    </div>
  )
}

