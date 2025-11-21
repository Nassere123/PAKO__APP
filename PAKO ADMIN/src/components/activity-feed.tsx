"use client"

import { Badge } from "@/components/ui/badge"
import { UserPlus, Package, CheckCircle2, TrendingUp, Clock, DollarSign, Truck } from 'lucide-react'
import { cn } from "@/lib/utils"

interface Activity {
  id: number
  type: string
  message: string
  user: string
  time: string
  icon: any
  color: string
  bgColor: string
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
}

const activities: Activity[] = [
  {
    id: 1,
    type: "new_user",
    message: "Nouvel utilisateur Pako Client inscrit",
    user: "Touré Aminata",
    time: "Il y a 2 min",
    icon: UserPlus,
    color: "text-[#F4A261]",
    bgColor: "bg-[#F4A261]/10",
    badge: "Client",
    badgeVariant: "secondary"
  },
  {
    id: 2,
    type: "delivery_completed",
    message: "Livraison terminée avec succès",
    user: "PKO-2024-087",
    time: "Il y a 5 min",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    badge: "Livré",
    badgeVariant: "default"
  },
  {
    id: 3,
    type: "new_order",
    message: "Nouvelle commande reçue",
    user: "Ouattara Karim",
    time: "Il y a 12 min",
    icon: Package,
    color: "text-[#FF6B35]",
    bgColor: "bg-[#FF6B35]/10",
    badge: "Nouveau",
    badgeVariant: "default"
  },
  {
    id: 4,
    type: "pro_signup",
    message: "Nouveau livreur Pako Pro inscrit",
    user: "Sylla Mohamed",
    time: "Il y a 18 min",
    icon: Truck,
    color: "text-[#FF6B35]",
    bgColor: "bg-[#FF6B35]/10",
    badge: "Livreur",
    badgeVariant: "secondary"
  },
  {
    id: 5,
    type: "delivery_completed",
    message: "Livraison terminée avec succès",
    user: "PKO-2024-086",
    time: "Il y a 24 min",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    badge: "Livré",
    badgeVariant: "default"
  },
  {
    id: 6,
    type: "milestone",
    message: "100 livraisons aujourd'hui atteint!",
    user: "Système",
    time: "Il y a 32 min",
    icon: TrendingUp,
    color: "text-[#FF6B35]",
    bgColor: "bg-[#FF6B35]/10",
    badge: "Succès",
    badgeVariant: "default"
  },
  {
    id: 7,
    type: "transaction",
    message: "Transaction effectuée",
    user: "Bakayoko Salif",
    time: "Il y a 45 min",
    icon: DollarSign,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    badge: "15,000 FCFA",
    badgeVariant: "outline"
  },
  {
    id: 8,
    type: "new_order",
    message: "Nouvelle commande reçue",
    user: "Koné Fatou",
    time: "Il y a 1h",
    icon: Package,
    color: "text-[#FF6B35]",
    bgColor: "bg-[#FF6B35]/10",
    badge: "Nouveau",
    badgeVariant: "default"
  }
]

const getInitials = (name: string) => {
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

export function ActivityFeed() {
  return (
    <div className="relative">
      {/* Ligne de timeline verticale */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#FF6B35] via-[#F4A261] to-muted opacity-20"></div>
      
      <div className="space-y-0 max-h-[500px] overflow-y-auto pr-2 activity-scrollbar">
        {activities.map((activity) => {
          const Icon = activity.icon
          const initials = getInitials(activity.user)
          
          // Déterminer la couleur du badge selon le type
          const getBadgeColor = () => {
            if (activity.type === "delivery_completed") return "bg-green-500 text-white"
            if (activity.type === "new_order") return "bg-[#FF6B35] text-white"
            if (activity.type === "transaction") return "bg-blue-500 text-white"
            return "bg-muted text-muted-foreground"
          }
          
          return (
            <div
              key={activity.id}
              className={cn(
                "relative flex items-start gap-4 p-4 rounded-lg transition-all duration-200",
                "hover:bg-accent/50 hover:shadow-md",
                "bg-card/50 border border-border/50"
              )}
            >
              {/* Point de connexion sur la ligne de timeline */}
              <div className={cn(
                "absolute left-6 top-8 w-4 h-4 rounded-full border-2 border-background z-10",
                activity.bgColor,
                "shadow-sm"
              )}>
                <div className={cn(
                  "w-full h-full rounded-full",
                  activity.bgColor
                )}></div>
              </div>

              {/* Icône dans un cercle */}
              <div className={cn(
                "relative z-20 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ml-2",
                activity.bgColor,
                "border-2 border-background shadow-md"
              )}>
                <Icon className={cn("h-5 w-5", activity.color)} />
              </div>

              {/* Contenu de l'événement */}
              <div className="flex-1 min-w-0 space-y-2 pt-0.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground leading-snug mb-1">
                      {activity.message}
                    </p>
                    {/* Informations supplémentaires structurées */}
                    <div className="flex items-center gap-3 flex-wrap mt-2">
                      {/* Avatar avec initiales ou identifiant */}
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold",
                          activity.bgColor,
                          activity.color
                        )}>
                          {activity.type !== "delivery_completed" && 
                           activity.type !== "milestone" && 
                           activity.type !== "transaction" ? initials : null}
                        </div>
                        <span className="text-xs font-medium text-foreground">
                          {activity.user}
                        </span>
                      </div>
                      
                      {/* Heure/Date */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{activity.time}</span>
                      </div>
                      
                      {/* Badge de statut élégant */}
                      {activity.badge && (
                        <Badge 
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            getBadgeColor()
                          )}
                        >
                          {activity.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
