"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp, MessageSquare, Users } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'

const ratingsData = [
  { stars: 5, count: 1248, percentage: 65 },
  { stars: 4, count: 456, percentage: 24 },
  { stars: 3, count: 156, percentage: 8 },
  { stars: 2, count: 48, percentage: 3 },
  { stars: 1, count: 12, percentage: 0.6 },
]

const recentReviews = [
  {
    id: 1,
    customer: "Marie Diallo",
    rating: 5,
    comment: "Livraison très rapide et livreur très professionnel !",
    date: "Il y a 2h",
    delivery: "PKO-2024-087"
  },
  {
    id: 2,
    customer: "Jean Kouassi",
    rating: 5,
    comment: "Excellent service, colis bien emballé et livré à l'heure.",
    date: "Il y a 5h",
    delivery: "PKO-2024-086"
  },
  {
    id: 3,
    customer: "Fatou Keita",
    rating: 4,
    comment: "Bon service, juste un petit retard de 10 minutes.",
    date: "Il y a 8h",
    delivery: "PKO-2024-085"
  },
  {
    id: 4,
    customer: "Amadou Traoré",
    rating: 5,
    comment: "Parfait ! Je recommande vivement.",
    date: "Il y a 12h",
    delivery: "PKO-2024-084"
  },
]

const averageRating = 4.6
const totalReviews = 1920

const getStarColor = (rating: number) => {
  if (rating >= 4.5) return "text-green-600"
  if (rating >= 4.0) return "text-yellow-600"
  if (rating >= 3.0) return "text-orange-600"
  return "text-red-600"
}

const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
  const sizeClass = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-6 w-6" : "h-4 w-4"
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted-foreground"
          }`}
        />
      ))}
    </div>
  )
}

export function CustomerRatingsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-card-foreground">Évaluations Clients</CardTitle>
        <CardDescription>Niveau de satisfaction et avis des clients</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Note moyenne globale */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`text-4xl font-extrabold ${getStarColor(averageRating)}`}>
                {averageRating.toFixed(1)}
              </div>
              <div>
                {renderStars(averageRating, "lg")}
                <p className="text-xs text-muted-foreground mt-1">
                  {totalReviews.toLocaleString()} avis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-semibold">+0.3</span>
              <span className="text-muted-foreground">vs mois dernier</span>
            </div>
          </div>
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <Star className="h-8 w-8 text-primary fill-primary" />
          </div>
        </div>

        {/* Répartition des étoiles */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Répartition des notes</h4>
          <div className="space-y-2">
            {ratingsData.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{item.stars}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        item.stars === 5
                          ? "bg-green-500"
                          : item.stars === 4
                          ? "bg-blue-500"
                          : item.stars === 3
                          ? "bg-yellow-500"
                          : item.stars === 2
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground w-16 text-right">
                  {item.count} ({item.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Graphique en barres */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ratingsData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                dataKey="stars"
                type="category"
                tick={{ fontSize: 12 }}
                width={30}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {ratingsData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.stars === 5
                        ? "#22c55e"
                        : entry.stars === 4
                        ? "#3b82f6"
                        : entry.stars === 3
                        ? "#eab308"
                        : entry.stars === 2
                        ? "#f97316"
                        : "#ef4444"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Derniers avis */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Derniers avis</h4>
            <Badge variant="outline" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              {recentReviews.length}
            </Badge>
          </div>
          <div className="space-y-3 max-h-[200px] overflow-y-auto">
            {recentReviews.map((review) => (
              <div
                key={review.id}
                className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">
                        {review.customer}
                      </span>
                      {renderStars(review.rating, "sm")}
                    </div>
                    <p className="text-xs text-muted-foreground">{review.comment}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{review.delivery}</span>
                  <span>{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

