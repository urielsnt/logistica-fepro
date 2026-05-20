import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [rol, setRol] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const inicializarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setRol(currentUser?.user_metadata?.rol ?? null)
      setCargando(false)
    }

    inicializarSesion()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setRol(currentUser?.user_metadata?.rol ?? null)
      setCargando(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (cargando) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-emerald-500 font-bold animate-pulse text-xl">
          Iniciando plataforma...
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, rol, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)