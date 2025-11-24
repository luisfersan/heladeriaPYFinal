import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div>
      {/* Hero section atractivo */}
      <div className="text-center py-5 bg-gradient bg-primary text-white rounded-3">
        <h1 className="display-3 fw-bold mb-3">
          🍦 Bienvenido a Frost & Cream
        </h1>
        <p className="lead fs-4 mb-4">
          Los mejores helados artesanales de la ciudad
        </p>
        <Link
          to="/productos"
          className="btn btn-light btn-lg"
        >
          🍨 Ver Productos
        </Link>
      </div>

      {/* Tarjetas de características */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card h-100 text-center">
            <div className="card-body">
              <div className="fs-1 mb-3">🌟</div>
              <h5 className="card-title">Ingredientes Premium</h5>
              <p className="card-text">
                Utilizamos solo los mejores ingredientes frescos
              </p>
            </div>
          </div>
        </div>
        {/* ... más tarjetas ... */}
      </div>

      {/* Información sobre roles */}
      <div className="alert alert-info">
        <h5>ℹ️ Información del Sistema</h5>
        <ul>
          <li>
            <strong>Público:</strong> Puede ver productos
          </li>
          <li>
            <strong>Cliente:</strong> Puede realizar ventas
          </li>
          <li>
            <strong>Empleado:</strong> Gestiona ingredientes
          </li>
          <li>
            <strong>Admin:</strong> Acceso completo
          </li>
        </ul>
      </div>
    </div>
  )
}
