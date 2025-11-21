import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

// Données pour le diagramme circulaire - Répartition des utilisateurs
// Couleurs améliorées : Orange pour Pako Client, Bleu/Violet pour les autres
const pieData = [
  { name: "Pako Client", value: 2134, color: "#FF6B35" },
  { name: "Pako Pro - Livreurs", value: 890, color: "#6366F1" }, // Bleu au lieu d'orange-pêche
  { name: "Pako Pro - Agents", value: 854, color: "#8B5CF6" }, // Violet au lieu de turquoise
]

// Données pour le diagramme circulaire - Répartition des livraisons par statut
const deliveryData = [
  { name: "Livrées", value: 1248, color: "#16A34A" },
  { name: "En cours", value: 87, color: "#EAB308" },
  { name: "En attente", value: 23, color: "#6366F1" },
]

const RADIAN = Math.PI / 180

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  const percentValue = (percent * 100).toFixed(0)

  // Afficher le nom et le pourcentage pour les grandes tranches (>10%)
  if (percent > 0.1) {
    return (
      <g>
        <text
          x={x}
          y={y - 6}
          fill="white"
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
          className="text-xs font-bold"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}
        >
          {`${percentValue}%`}
        </text>
        <text
          x={x}
          y={y + 8}
          fill="white"
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
          className="text-[10px] font-medium"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}
        >
          {name.length > 12 ? name.substring(0, 10) + "..." : name}
        </text>
      </g>
    )
  }

  // Pour les petites tranches, juste le pourcentage
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-semibold"
      style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}
    >
      {`${percentValue}%`}
    </text>
  )
}

export function StatsChart() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-card-foreground">Répartition des Utilisateurs</CardTitle>
          <CardDescription>Distribution par type d'application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => renderCustomLabel({ ...props, name: pieData.find(d => d.value === props.value)?.name })}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--card-foreground))",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  }}
                  formatter={(value: number) => `${value.toLocaleString()} utilisateurs`}
                  labelFormatter={(name) => name}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value) => {
                    const entry = pieData.find(d => d.name === value)
                    return (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry?.color }}
                        />
                        <span className="text-sm text-muted-foreground">{value}</span>
                      </div>
                    )
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-card-foreground">Statut des Livraisons</CardTitle>
          <CardDescription>Répartition par statut</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deliveryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => renderCustomLabel({ ...props, name: deliveryData.find(d => d.value === props.value)?.name })}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deliveryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--card-foreground))",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  }}
                  formatter={(value: number) => `${value.toLocaleString()} livraisons`}
                  labelFormatter={(name) => name}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value) => {
                    const entry = deliveryData.find(d => d.name === value)
                    return (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry?.color }}
                        />
                        <span className="text-sm text-muted-foreground">{value}</span>
                      </div>
                    )
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
