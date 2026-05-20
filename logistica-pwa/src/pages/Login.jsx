import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const navigate = useNavigate()
  
  const { user } = useAuth()

  if (user) {
    navigate('/')
    return null
  }

  const iniciarSesion = async (e) => {
    e.preventDefault()
    setMensaje('Cargando...')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMensaje('Error: ' + error.message)
    else navigate('/')
  }

  const registrarse = async (e) => {
    e.preventDefault()
    setMensaje('Registrando...')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMensaje('Error: ' + error.message)
    else setMensaje('¡Registro exitoso! Ya puedes iniciar sesión.')
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <h2 className="text-2xl font-bold mb-4">Acceso a la Plataforma</h2>
      
      <form className="flex flex-col gap-4 w-full max-w-xs">
        <input 
          type="email" 
          placeholder="Tu correo" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input 
          type="password" 
          placeholder="Tu contraseña" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
        
        <button onClick={iniciarSesion} className="bg-blue-500 text-white p-2 rounded">
          Iniciar Sesión
        </button>
        <button onClick={registrarse} className="bg-gray-200 text-gray-800 p-2 rounded">
          Crear Cuenta Nueva
        </button>
      </form>

      {mensaje && <p className="mt-4 text-sm text-center font-bold text-red-500">{mensaje}</p>}
    </div>
  )
}