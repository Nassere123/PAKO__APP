import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FaDollarSign, FaSave } from 'react-icons/fa'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export function PricingPanel() {
  const { toast } = useToast()
  const [currentPrice, setCurrentPrice] = useState(400) // Prix unique par km
  const [newPrice, setNewPrice] = useState<string>(String(400))
  const [isSaving, setIsSaving] = useState(false)
  const [priceHistory, setPriceHistory] = useState([
    { date: "2024-01-15", price: 400, changedBy: "Admin" },
    { date: "2024-01-10", price: 450, changedBy: "Admin" },
    { date: "2024-01-05", price: 450, changedBy: "Admin" },
  ])

  const previousPrice = priceHistory.length > 0 ? priceHistory[0].price : currentPrice
  const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100

  const examplePrice = useMemo(() => {
    const distance = 10
    return distance * currentPrice
  }, [currentPrice])

  const handleSavePrice = () => {
    const value = Number(newPrice)
    if (isNaN(value) || value <= 0) {
      toast({
        title: "Valeur invalide",
        description: "Veuillez entrer un prix par kilomètre supérieur à 0.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    setTimeout(() => {
      setCurrentPrice(value)
      setPriceHistory(prev => [
        {
          date: new Date().toLocaleDateString("fr-FR"),
          price: value,
          changedBy: "Admin",
        },
        ...prev,
      ])
      setIsSaving(false)
      toast({
        title: "Prix mis à jour",
        description: "Le prix du kilométrage a été modifié avec succès.",
      })
    }, 300)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="text-4xl font-extrabold text-foreground tracking-tight">Gestion de la tarification</h2>
        <p className="text-base text-muted-foreground">
          Configurez le prix unique par kilomètre appliqué à toutes les livraisons
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Prix actuel / km
              </CardTitle>
              <div className="text-4xl font-extrabold text-primary pt-2">{currentPrice.toLocaleString()} FCFA</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FaDollarSign className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm">
              {priceChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-destructive" />
              ) : (
                <TrendingDown className="h-4 w-4 text-secondary" />
              )}
              <span className="text-muted-foreground">
                {priceChange >= 0 ? "+" : ""}
                {priceChange.toFixed(1)}% vs dernier prix
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-1 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Distance de référence
              </CardTitle>
              <div className="text-4xl font-extrabold text-foreground pt-2">10 km</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-chart-1" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Utilisée pour l'exemple de calcul</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-2 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Exemple (10 km)
              </CardTitle>
              <div className="text-4xl font-extrabold text-foreground pt-2">{examplePrice.toLocaleString()} FCFA</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <FaDollarSign className="h-6 w-6 text-chart-2" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Prix facturé à titre d'illustration</p>
          </CardContent>
        </Card>
      </div>

      {/* Configuration du prix unique */}
      <Card className="shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-card-foreground">Prix unique du kilomètre</CardTitle>
          <CardDescription>
            Définissez ici le prix appliqué par kilomètre pour toutes les livraisons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="unique-price" className="text-sm font-semibold uppercase tracking-wide">
                Prix par kilomètre (FCFA)
              </Label>
              <Input
                id="unique-price"
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                min="0"
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Ce prix sera appliqué à toutes les livraisons, peu importe la distance.
              </p>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold uppercase tracking-wide">Simulateur rapide</Label>
              <div className="p-4 border rounded-xl bg-muted/40 space-y-2">
                <p className="text-xs text-muted-foreground">Livraison de 10 km</p>
                <p className="text-2xl font-bold text-foreground">
                  10 km × {currentPrice.toLocaleString()} FCFA =&nbsp;
                  <span className="text-primary">{examplePrice.toLocaleString()} FCFA</span>
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              className="w-full md:w-auto"
              onClick={handleSavePrice}
              disabled={isSaving}
            >
              <FaSave className="h-3 w-3 mr-2" />
              {isSaving ? "Enregistrement..." : "Mettre à jour le prix"}
            </Button>
            <Badge variant="outline" className="text-xs">
              Dernière mise à jour : {priceHistory[0]?.date ?? "-"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Historique des modifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-card-foreground">Historique des modifications</CardTitle>
          <CardDescription>Suivi chronologique des ajustements de prix</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {priceHistory.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {entry.price.toLocaleString()} FCFA/km
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.date} • {entry.changedBy}
                  </p>
                </div>
                <Badge variant="outline">{entry.price} FCFA</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

