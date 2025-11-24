import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Importar las páginas de la heladería
import Home from './pages/Home'
import Login from './pages/Login'
import Ingredientes from './pages/Ingredientes'
import Productos from './pages/Productos'
import Ventas from './pages/Ventas'

export default function App() {
  const { user, signOut, getUserRole } = useAuth() // Obtener info del usuario
  const rol = getUserRole() // Obtener el rol del usuario

  return (
    <div>
      {/* Navbar con logo de heladería y menú según rol */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link
            className="navbar-brand"
            to="/"
          >
            🍦 Heladería Frost & Cream {/* ← Logo y nombre */}
          </Link>

          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/productos"
              >
                🍨 Productos
              </Link>
            </li>

            {/* Solo admin y empleado ven ingredientes */}
            {(rol === 'admin' || rol === 'empleado') && (
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="/ingredientes"
                >
                  🧊 Ingredientes
                </Link>
              </li>
            )}

            {/* Solo usuarios autenticados ven ventas */}
            {user && (
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="/ventas"
                >
                  💰 Ventas
                </Link>
              </li>
            )}

            {/* Mostrar nombre de usuario y botón logout */}
            {user ? (
              <li className="nav-item">
                <button onClick={signOut}>Cerrar Sesión</button>
              </li>
            ) : (
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="/login"
                >
                  🔐 Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>

      <div className="container">
        <Routes>
          {/* Rutas de la heladería */}
          <Route
            path="/"
            element={<Home />}
          />
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/ingredientes"
            element={<Ingredientes />}
          />
          <Route
            path="/productos"
            element={<Productos />}
          />
          <Route
            path="/ventas"
            element={<Ventas />}
          />
        </Routes>
      </div>
    </div>
  )
}
