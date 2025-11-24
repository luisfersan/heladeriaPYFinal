// Página de login y registro
// Requisito #7: Autenticación de usuarios (login con Supabase Auth)

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState('cliente')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // Login
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/')
      } else {
        // Registro
        const { error } = await signUp(email, password, nombre, rol)
        if (error) throw error
        alert(
          'Registro exitoso. Por favor revisa tu correo para verificar tu cuenta.'
        )
        setIsLogin(true)
      }
    } catch (error) {
      setError(error.message || 'Ocurrió un error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow-lg">
          <div className="card-body p-5">
            {/* Logo y título */}
            <div className="text-center mb-4">
              <h2 className="fs-1 mb-2">🍦</h2>
              <h3 className="fw-bold">
                {isLogin ? 'Iniciar Sesión' : 'Registro'}
              </h3>
              <p className="text-muted">Frost & Cream</p>
            </div>

            {/* Mensajes de error */}
            {error && (
              <div
                className="alert alert-danger"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit}>
              {/* Campo Nombre (solo para registro) */}
              {!isLogin && (
                <div className="mb-3">
                  <label className="form-label">Nombre Completo</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    placeholder="Tu nombre"
                  />
                </div>
              )}

              {/* Campo Email */}
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                />
              </div>

              {/* Campo Contraseña */}
              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </div>

              {/* Campo Rol (solo para registro) */}
              {!isLogin && (
                <div className="mb-3">
                  <label className="form-label">Rol</label>
                  <select
                    className="form-select"
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                  >
                    <option value="cliente">Cliente</option>
                    <option value="empleado">Empleado</option>
                    <option value="admin">Administrador</option>
                  </select>
                  <small className="text-muted">
                    Selecciona el rol apropiado
                  </small>
                </div>
              )}

              {/* Botón de submit */}
              <button
                type="submit"
                className="btn btn-primary w-100 mb-3"
                disabled={loading}
              >
                {loading
                  ? 'Procesando...'
                  : isLogin
                  ? '🔐 Iniciar Sesión'
                  : '📝 Registrarse'}
              </button>
            </form>

            {/* Cambiar entre login y registro */}
            <div className="text-center">
              <button
                className="btn btn-link"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                }}
              >
                {isLogin
                  ? '¿No tienes cuenta? Regístrate'
                  : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>

            {/* Usuarios de prueba */}
            <div className="mt-4 p-3 bg-light rounded">
              <small className="text-muted">
                <strong>💡 Usuarios de prueba:</strong>
                <br />
                Admin: admin@frost.com / password
                <br />
                Empleado: empleado@frost.com / password
                <br />
                Cliente: cliente@frost.com / password
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
