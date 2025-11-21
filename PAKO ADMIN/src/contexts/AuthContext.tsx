import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'super_admin'
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté (localStorage)
    const storedUser = localStorage.getItem('pako_admin_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Erreur lors du parsing du user stocké:', error)
        localStorage.removeItem('pako_admin_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Pour la démo, on accepte n'importe quel email/password
      // En production, cela devrait être une vraie requête API
      if (email && password) {
        const userData: User = {
          id: 'admin-001',
          name: 'Administrateur PAKO',
          email: email,
          role: 'admin'
        }
        setUser(userData)
        localStorage.setItem('pako_admin_user', JSON.stringify(userData))
        setLoading(false)
        return true
      }
      setLoading(false)
      return false
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      setLoading(false)
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Pour la démo, on accepte n'importe quelle inscription
      // En production, cela devrait être une vraie requête API
      if (name && email && password) {
        const userData: User = {
          id: `admin-${Date.now()}`,
          name: name,
          email: email,
          role: 'admin'
        }
        setUser(userData)
        localStorage.setItem('pako_admin_user', JSON.stringify(userData))
        setLoading(false)
        return true
      }
      setLoading(false)
      return false
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error)
      setLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('pako_admin_user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}

