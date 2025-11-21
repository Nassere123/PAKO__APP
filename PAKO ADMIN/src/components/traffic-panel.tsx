import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FaMapMarkerAlt, FaTruck, FaUser, FaPhone } from 'react-icons/fa'
import { RefreshCw, Search, MapPin, Clock, Gauge, ZoomIn, ZoomOut, Navigation2, Filter, Layers } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix pour les icônes Leaflet par défaut (nécessaire pour Vite)
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'

if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: iconShadow,
  })
}

// Mock data pour les livreurs en temps réel
const mockDrivers = [
  {
    id: "DRV-001",
    name: "Kouadio Pascal",
    phone: "+225 05 98 76 54 32",
    vehicle: "Moto - AB-123-CD",
    status: "En livraison",
    latitude: 5.345317,
    longitude: -4.024429,
    destination: "Cocody, Abidjan",
    speed: 45,
    lastUpdate: "Il y a 2 min"
  },
  {
    id: "DRV-002",
    name: "Bakayoko Ismaël",
    phone: "+225 05 23 45 67 89",
    vehicle: "Moto - AB-456-EF",
    status: "En livraison",
    latitude: 5.360000,
    longitude: -4.010000,
    destination: "Yopougon, Abidjan",
    speed: 30,
    lastUpdate: "Il y a 1 min"
  },
  {
    id: "DRV-003",
    name: "Koné Moussa",
    phone: "+225 05 11 22 33 44",
    vehicle: "Moto - AB-789-GH",
    status: "Disponible",
    latitude: 5.330000,
    longitude: -4.030000,
    destination: "En attente",
    speed: 0,
    lastUpdate: "Il y a 5 min"
  },
  {
    id: "DRV-004",
    name: "Ouattara Salif",
    phone: "+225 05 44 55 66 77",
    vehicle: "Moto - AB-321-IJ",
    status: "En livraison",
    latitude: 5.350000,
    longitude: -4.015000,
    destination: "Marcory, Abidjan",
    speed: 35,
    lastUpdate: "Il y a 3 min"
  },
  {
    id: "DRV-005",
    name: "Traoré Amadou",
    phone: "+225 05 77 88 99 00",
    vehicle: "Moto - AB-654-KL",
    status: "Disponible",
    latitude: 5.340000,
    longitude: -4.020000,
    destination: "En attente",
    speed: 0,
    lastUpdate: "Il y a 8 min"
  },
]

// Composant pour forcer les limites de la carte
function MapBoundsEnforcer() {
  const map = useMap()
  
  useEffect(() => {
    const bounds = [[4.0, -9.0], [11.0, -2.0]] as [[number, number], [number, number]]
    
    const checkBounds = () => {
      const currentBounds = map.getBounds()
      const sw = currentBounds.getSouthWest()
      const ne = currentBounds.getNorthEast()
      
      // Vérifier si la carte sort des limites
      if (sw.lat < bounds[0][0] || ne.lat > bounds[1][0] || 
          sw.lng < bounds[0][1] || ne.lng > bounds[1][1]) {
        map.setMaxBounds(bounds)
        map.fitBounds(bounds)
      }
    }
    
    map.on('moveend', checkBounds)
    map.on('zoomend', checkBounds)
    
    // Initialiser les limites
    map.setMaxBounds(bounds)
    
    return () => {
      map.off('moveend', checkBounds)
      map.off('zoomend', checkBounds)
    }
  }, [map])
  
  return null
}

// Composant pour exposer les contrôles de la carte
function MapController({ onMapReady }: { onMapReady: (map: L.Map) => void }) {
  const map = useMap()
  
  useEffect(() => {
    onMapReady(map)
  }, [map, onMapReady])
  
  return null
}

// Composant pour les contrôles de la carte
function MapControls({ onZoomIn, onZoomOut, onRecenter, onRefresh, isRefreshing, filterStatus, onFilterChange }: {
  onZoomIn: () => void
  onZoomOut: () => void
  onRecenter: () => void
  onRefresh: () => void
  isRefreshing: boolean
  filterStatus: string
  onFilterChange: (status: string) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Navigation</h3>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomIn}
            className="w-full justify-start"
            title="Zoomer"
          >
            <ZoomIn className="h-4 w-4 mr-2" />
            Zoomer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomOut}
            className="w-full justify-start"
            title="Dézoomer"
          >
            <ZoomOut className="h-4 w-4 mr-2" />
            Dézoomer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRecenter}
            className="w-full justify-start"
            title="Recentrer"
          >
            <Navigation2 className="h-4 w-4 mr-2" />
            Recentrer
          </Button>
        </div>
      </div>
      
      <div className="border-t pt-3 space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Filtres</h3>
        <div className="flex flex-col gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange("all")}
            className="w-full justify-start"
          >
            <Layers className="h-4 w-4 mr-2" />
            Tous
          </Button>
          <Button
            variant={filterStatus === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange("active")}
            className="w-full justify-start"
          >
            <FaTruck className="h-4 w-4 mr-2" />
            En livraison
          </Button>
          <Button
            variant={filterStatus === "available" ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange("available")}
            className="w-full justify-start"
          >
            <FaUser className="h-4 w-4 mr-2" />
            Disponibles
          </Button>
        </div>
      </div>
      
      <div className="border-t pt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full justify-start"
          title="Actualiser"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>
    </div>
  )
}

// Composant Marker personnalisé avec ouverture de popup au survol
function HoverableMarker({ driver, isActive, isSelected, selectedDriver, onSelect }: {
  driver: typeof mockDrivers[0]
  isActive: boolean
  isSelected: boolean
  selectedDriver: string | null
  onSelect: (id: string | null) => void
}) {
  const markerRef = useRef<L.Marker>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [exactAddress, setExactAddress] = useState<string | null>(null)
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)

  useEffect(() => {
    let leafletMarker: L.Marker | null = null
    let iconElement: HTMLElement | null = null
    let handleMouseOver: (() => void) | null = null
    let handleMouseOut: (() => void) | null = null

    // Attendre que le marker soit monté
    const timer = setTimeout(() => {
      const markerElement = markerRef.current
      if (!markerElement) return

      // Dans react-leaflet, on accède à l'instance Leaflet via leafletElement
      leafletMarker = (markerElement as any).leafletElement as L.Marker
      if (!leafletMarker) return

      const loadExactAddress = () => {
        // Récupérer l'adresse exacte via reverse geocoding si pas déjà chargée
        if (!exactAddress && !isLoadingAddress) {
          setIsLoadingAddress(true)
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${driver.latitude}&lon=${driver.longitude}&addressdetails=1&zoom=18`,
            {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'PAKO-Admin/1.0'
              }
            }
          )
          .then(response => response.json())
          .then(data => {
            if (data && data.display_name) {
              setExactAddress(data.display_name)
            } else {
              setExactAddress(`${driver.latitude.toFixed(6)}, ${driver.longitude.toFixed(6)}`)
            }
            setIsLoadingAddress(false)
          })
          .catch(error => {
            console.error('Erreur reverse geocoding:', error)
            setExactAddress(`${driver.latitude.toFixed(6)}, ${driver.longitude.toFixed(6)}`)
            setIsLoadingAddress(false)
          })
        }
      }

      handleMouseOver = () => {
        setIsHovered(true)
        leafletMarker?.openPopup()
        loadExactAddress()
      }

      handleMouseOut = () => {
        setIsHovered(false)
        // Ne fermer la popup que si elle n'est pas sélectionnée par clic
        if (!isSelected && leafletMarker) {
          leafletMarker.closePopup()
        }
      }

      // Désactiver le drag du marqueur
      if (leafletMarker.dragging) {
        leafletMarker.dragging.disable()
      }

      // Ajouter les événements sur l'icône du marker
      iconElement = leafletMarker.getElement()
      if (iconElement && handleMouseOver && handleMouseOut) {
        iconElement.addEventListener('mouseenter', handleMouseOver)
        iconElement.addEventListener('mouseleave', handleMouseOut)
        // Empêcher le drag sur l'icône
        iconElement.style.cursor = 'default'
      }

      // Aussi sur le marker lui-même
      if (handleMouseOver && handleMouseOut) {
        leafletMarker.on('mouseover', handleMouseOver)
        leafletMarker.on('mouseout', handleMouseOut)
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      
      // Nettoyer les event listeners
      if (iconElement && handleMouseOver && handleMouseOut) {
        iconElement.removeEventListener('mouseenter', handleMouseOver)
        iconElement.removeEventListener('mouseleave', handleMouseOut)
      }
      
      if (leafletMarker && handleMouseOver && handleMouseOut) {
        leafletMarker.off('mouseover', handleMouseOver)
        leafletMarker.off('mouseout', handleMouseOut)
      }
    }
  }, [isSelected, exactAddress, isLoadingAddress])

  // S'assurer que le marqueur reste à sa position et n'est pas déplaçable
  useEffect(() => {
    const markerElement = markerRef.current
    if (!markerElement) return

    const leafletMarker = (markerElement as any).leafletElement as L.Marker
    if (!leafletMarker) return

    // Désactiver complètement le drag
    if (leafletMarker.dragging) {
      leafletMarker.dragging.disable()
    }
    
    // Empêcher le drag via les options
    leafletMarker.options.draggable = false
    
    // Forcer la position correcte
    const correctPos = L.latLng(driver.latitude, driver.longitude)
    const currentPos = leafletMarker.getLatLng()
    
    // Si la position a changé, la remettre à la bonne position
    if (Math.abs(currentPos.lat - correctPos.lat) > 0.000001 || 
        Math.abs(currentPos.lng - correctPos.lng) > 0.000001) {
      leafletMarker.setLatLng(correctPos)
    }

    // Écouter les événements de drag pour les empêcher
    const preventDrag = (e: L.DragEndEvent) => {
      leafletMarker.setLatLng(correctPos)
      e.target.setLatLng(correctPos)
    }

    leafletMarker.on('dragend', preventDrag)

    return () => {
      leafletMarker.off('dragend', preventDrag)
    }
  }, [driver.latitude, driver.longitude])

  // Mettre à jour l'icône quand isHovered change
  useEffect(() => {
    const markerElement = markerRef.current
    if (!markerElement) return

    const leafletMarker = (markerElement as any).leafletElement as L.Marker
    if (!leafletMarker) return

    // Recréer l'icône avec le nouvel état
    const updatedIcon = L.divIcon({
      className: `custom-marker ${isActive && !isHovered ? 'pulse-animation' : ''} ${isSelected ? 'selected-marker' : ''}`,
      html: `
        <div style="
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: default;
        ">
          ${isActive && !isHovered ? `
            <div style="
              position: absolute;
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background-color: ${isActive ? '#FF6B35' : '#F4A261'};
              opacity: 0.3;
              animation: pulse 2s infinite;
            "></div>
          ` : ''}
          <div style="
            background: linear-gradient(135deg, ${isActive ? '#FF6B35' : '#F4A261'} 0%, ${isActive ? '#FF8C42' : '#E9C46A'} 100%);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25), 0 0 0 ${isSelected ? '3px' : '0px'} ${isActive ? '#FF6B35' : '#F4A261'}40;
            transition: all 0.3s ease;
            position: relative;
            z-index: 1;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));">
              <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
          </div>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.2); opacity: 0.1; }
            100% { transform: scale(1); opacity: 0.3; }
          }
        </style>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
      className: 'fixed-marker',
    })

    leafletMarker.setIcon(updatedIcon)
    // S'assurer que le marqueur n'est pas draggable et reste fixe
    if (leafletMarker.dragging) {
      leafletMarker.dragging.disable()
    }
    // Empêcher le repositionnement
    leafletMarker.options.draggable = false
    // Forcer la position pour éviter tout déplacement
    const currentPos = leafletMarker.getLatLng()
    if (currentPos.lat !== driver.latitude || currentPos.lng !== driver.longitude) {
      leafletMarker.setLatLng([driver.latitude, driver.longitude])
    }
  }, [isHovered, isActive, isSelected, driver.latitude, driver.longitude])

  // Créer une icône personnalisée améliorée pour chaque livreur
  const customIcon = L.divIcon({
    className: `custom-marker ${isActive && !isHovered ? 'pulse-animation' : ''} ${isSelected ? 'selected-marker' : ''}`,
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        ${isActive && !isHovered ? `
          <div style="
            position: absolute;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background-color: ${isActive ? '#FF6B35' : '#F4A261'};
            opacity: 0.3;
            animation: pulse 2s infinite;
          "></div>
        ` : ''}
        <div style="
          background: linear-gradient(135deg, ${isActive ? '#FF6B35' : '#F4A261'} 0%, ${isActive ? '#FF8C42' : '#E9C46A'} 100%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25), 0 0 0 ${isSelected ? '3px' : '0px'} ${isActive ? '#FF6B35' : '#F4A261'}40;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        </div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.1; }
          100% { transform: scale(1); opacity: 0.3; }
        }
      </style>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
      className: 'fixed-marker',
  })

  return (
    <Marker
      ref={markerRef}
      position={[driver.latitude, driver.longitude]}
      icon={customIcon}
      draggable={false}
      eventHandlers={{
        click: (e) => {
          e.originalEvent?.stopPropagation()
          e.originalEvent?.preventDefault()
          onSelect(selectedDriver === driver.id ? null : driver.id)
          // Charger l'adresse au clic si pas déjà chargée
          if (!exactAddress && !isLoadingAddress) {
            setIsLoadingAddress(true)
            fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${driver.latitude}&lon=${driver.longitude}&addressdetails=1&zoom=18`,
              {
                headers: {
                  'Accept': 'application/json',
                  'User-Agent': 'PAKO-Admin/1.0'
                }
              }
            )
            .then(response => response.json())
            .then(data => {
              if (data && data.display_name) {
                setExactAddress(data.display_name)
              } else {
                setExactAddress(`${driver.latitude.toFixed(6)}, ${driver.longitude.toFixed(6)}`)
              }
              setIsLoadingAddress(false)
            })
            .catch(error => {
              console.error('Erreur reverse geocoding:', error)
              setExactAddress(`${driver.latitude.toFixed(6)}, ${driver.longitude.toFixed(6)}`)
              setIsLoadingAddress(false)
            })
          }
        },
        dragstart: (e) => {
          e.originalEvent?.stopPropagation()
          e.originalEvent?.preventDefault()
        },
        drag: (e) => {
          e.originalEvent?.stopPropagation()
          e.originalEvent?.preventDefault()
        },
        dragend: (e) => {
          e.originalEvent?.stopPropagation()
          e.originalEvent?.preventDefault()
        },
      }}
    >
      <Popup
        className="custom-popup"
        closeButton={true}
        autoPan={true}
      >
        <div className="p-3 min-w-[200px]">
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isActive ? 'bg-[#FF6B35]/10' : 'bg-[#F4A261]/10'
            }`}>
              <FaTruck className={`h-5 w-5 ${isActive ? 'text-[#FF6B35]' : 'text-[#F4A261]'}`} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-base text-foreground mb-1">{driver.name}</p>
              <p className="text-xs text-muted-foreground font-medium">{driver.vehicle}</p>
              <Badge 
                variant={isActive ? "default" : "secondary"} 
                className="mt-1 text-xs"
              >
                {driver.status}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2 border-t pt-2">
            <div className="flex items-start gap-2 text-xs">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-muted-foreground mb-1">
                  <strong className="text-foreground">Position exacte:</strong>
                </div>
                {isLoadingAddress ? (
                  <div className="text-muted-foreground italic text-xs">Chargement du nom du lieu...</div>
                ) : exactAddress ? (
                  <div className="text-foreground font-medium text-xs leading-relaxed break-words">
                    {/* Afficher le nom du lieu si ce n'est pas juste des coordonnées */}
                    {exactAddress.match(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/) 
                      ? `Coordonnées: ${exactAddress}` 
                      : exactAddress}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-xs italic">
                    Cliquez pour charger le nom du lieu
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">Destination:</strong> {driver.destination}
              </span>
            </div>
            
            {isActive && (
              <div className="flex items-center gap-2 text-xs">
                <Gauge className="h-3.5 w-3.5 text-[#FF6B35]" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Vitesse:</strong> {driver.speed} km/h
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">Mise à jour:</strong> {driver.lastUpdate}
              </span>
            </div>
          </div>
          
          <Button
            variant="default"
            size="sm"
            className="mt-3 w-full bg-[#FF6B35] hover:bg-[#FF8C42] text-white"
            onClick={() => window.open(`tel:${driver.phone}`)}
          >
            <FaPhone className="h-3 w-3 mr-2" />
            Appeler {driver.name.split(' ')[0]}
          </Button>
        </div>
      </Popup>
    </Marker>
  )
}

export function TrafficPanel() {
  const [drivers, setDrivers] = useState(mockDrivers)
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // S'assurer que le composant s'exécute uniquement côté client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Simuler le rafraîchissement des positions
  const refreshPositions = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      // Simuler des changements de position légers
      setDrivers(prev => prev.map(driver => ({
        ...driver,
        latitude: driver.latitude + (Math.random() - 0.5) * 0.001,
        longitude: driver.longitude + (Math.random() - 0.5) * 0.001,
        lastUpdate: "À l'instant"
      })))
      setIsRefreshing(false)
    }, 1000)
  }

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehicle.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filterStatus === "all") return matchesSearch
    if (filterStatus === "active") return matchesSearch && driver.status === "En livraison"
    if (filterStatus === "available") return matchesSearch && driver.status === "Disponible"
    return matchesSearch
  })

  // Fonctions de contrôle de la carte
  const handleZoomIn = () => {
    if (mapInstance) {
      mapInstance.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapInstance) {
      mapInstance.zoomOut()
    }
  }

  const handleRecenter = () => {
    if (mapInstance) {
      mapInstance.setView([5.3477, -3.9622], 11)
    }
  }

  const handleMapReady = useCallback((map: L.Map) => {
    setMapInstance(map)
  }, [])

  const activeDrivers = drivers.filter(d => d.status === "En livraison").length
  const availableDrivers = drivers.filter(d => d.status === "Disponible").length

  return (
    <div className="space-y-8">
      {/* En-tête amélioré */}
      <div className="space-y-3">
        <h2 className="text-4xl font-extrabold text-foreground tracking-tight">Suivi du Trafic</h2>
        <p className="text-base text-muted-foreground">
          Visualisation en temps réel des positions des livreurs
        </p>
      </div>

      {/* Cartes KPIs améliorées */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Livreurs Actifs
              </CardTitle>
              <div className="text-4xl font-extrabold text-primary pt-2">{activeDrivers}</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FaTruck className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">En livraison actuellement</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-secondary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Livreurs Disponibles
              </CardTitle>
              <div className="text-4xl font-extrabold text-secondary pt-2">{availableDrivers}</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <FaUser className="h-6 w-6 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Prêts pour nouvelle livraison</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-1 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Total Livreurs
              </CardTitle>
              <div className="text-4xl font-extrabold text-foreground pt-2">{drivers.length}</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
              <FaMapMarkerAlt className="h-6 w-6 text-chart-1" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Sur la plateforme</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        {/* Carte */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">Carte en Temps Réel</CardTitle>
                <CardDescription>Positions des livreurs sur la carte</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Légende avec contrôles */}
            <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Légende à gauche */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#FF6B35] border-2 border-white shadow-sm"></div>
                    <span className="text-xs text-muted-foreground">En livraison</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#F4A261] border-2 border-white shadow-sm"></div>
                    <span className="text-xs text-muted-foreground">Disponible</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activeDrivers} actifs • {availableDrivers} disponibles
                  </div>
                </div>
                
                {/* Contrôles à droite */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 border-r pr-2 mr-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleZoomIn}
                      className="h-8 w-8 p-0"
                      title="Zoomer"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleZoomOut}
                      className="h-8 w-8 p-0"
                      title="Dézoomer"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRecenter}
                      className="h-8 w-8 p-0"
                      title="Recentrer"
                    >
                      <Navigation2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-1 border-r pr-2 mr-2">
                    <Button
                      variant={filterStatus === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("all")}
                      className="h-8 px-2 text-xs"
                      title="Tous"
                    >
                      Tous
                    </Button>
                    <Button
                      variant={filterStatus === "active" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("active")}
                      className="h-8 px-2 text-xs"
                      title="En livraison"
                    >
                      Actifs
                    </Button>
                    <Button
                      variant={filterStatus === "available" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("available")}
                      className="h-8 px-2 text-xs"
                      title="Disponibles"
                    >
                      Disp.
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshPositions}
                    disabled={isRefreshing}
                    className="h-8 px-2"
                    title="Actualiser"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>

            <div className="h-[400px] rounded-lg overflow-hidden border-2 border-border shadow-lg relative">
              {!isClient ? (
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <FaMapMarkerAlt className="h-16 w-16 text-primary mx-auto opacity-50 animate-pulse" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-muted-foreground">Chargement de la carte...</p>
                    <p className="text-sm text-muted-foreground/70">Initialisation des positions des livreurs</p>
                  </div>
                </div>
              ) : (
                <MapContainer
                  center={[5.3477, -3.9622]} // Centre entre Abidjan et Bingerville
                  zoom={11}
                  minZoom={6}
                  maxZoom={15}
                  maxBounds={[[4.0, -9.0], [11.0, -2.0]]} // Limites de la Côte d'Ivoire
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                  scrollWheelZoom={true}
                  className="z-0 rounded-lg"
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    maxZoom={15}
                    tileSize={256}
                    zoomOffset={0}
                  />
                  <MapBoundsEnforcer />
                  <MapController onMapReady={handleMapReady} />
                  <ZoomControl position="bottomright" />
                  
                  {drivers
                    .filter(driver => {
                      if (filterStatus === "all") return true
                      if (filterStatus === "active") return driver.status === "En livraison"
                      if (filterStatus === "available") return driver.status === "Disponible"
                      return true
                    })
                    .map((driver) => {
                      const isActive = driver.status === "En livraison"
                      const isSelected = selectedDriver === driver.id
                      
                      return (
                        <HoverableMarker
                          key={driver.id}
                          driver={driver}
                          isActive={isActive}
                          isSelected={isSelected}
                          selectedDriver={selectedDriver}
                          onSelect={setSelectedDriver}
                        />
                      )
                    })}
                </MapContainer>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center flex items-center justify-center gap-2">
              <MapPin className="h-3 w-3" />
              {drivers.filter(driver => {
                if (filterStatus === "all") return true
                if (filterStatus === "active") return driver.status === "En livraison"
                if (filterStatus === "available") return driver.status === "Disponible"
                return true
              }).length} livreurs affichés sur la carte • Cliquez sur un marqueur pour plus d'informations
            </p>
          </CardContent>
        </Card>

        {/* Liste des livreurs */}
        <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un livreur..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedDriver === driver.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card hover:bg-accent"
                  }`}
                  onClick={() => setSelectedDriver(selectedDriver === driver.id ? null : driver.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FaTruck className={`h-4 w-4 ${
                        driver.status === "En livraison" ? "text-primary" : "text-secondary"
                      }`} />
                      <div>
                        <p className={`font-semibold text-sm ${
                          selectedDriver === driver.id ? "text-primary-foreground" : "text-foreground"
                        }`}>
                          {driver.name}
                        </p>
                        <p className={`text-xs ${
                          selectedDriver === driver.id ? "text-primary-foreground/80" : "text-muted-foreground"
                        }`}>
                          {driver.vehicle}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={driver.status === "En livraison" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {driver.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="h-3 w-3" />
                      <span className={selectedDriver === driver.id ? "text-primary-foreground/80" : "text-muted-foreground"}>
                        {driver.destination}
                      </span>
                    </div>
                    {driver.status === "En livraison" && (
                      <div className="flex items-center gap-2">
                        <span className={selectedDriver === driver.id ? "text-primary-foreground/80" : "text-muted-foreground"}>
                          Vitesse: {driver.speed} km/h
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={selectedDriver === driver.id ? "text-primary-foreground/80" : "text-muted-foreground"}>
                        {driver.lastUpdate}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`tel:${driver.phone}`)
                        }}
                      >
                        <FaPhone className="h-3 w-3" />
                      </Button>
                    </div>
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

