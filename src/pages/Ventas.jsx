// Página para realizar ventas de productos
// Requisito #6: Función de venta de productos con actualización de inventario
// Requisito #8c: Cliente puede realizar ventas

import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Ventas() {
  const [productos, setProductos] = useState([])
  const [productosDetalle, setProductosDetalle] = useState([])
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [ventasHoy, setVentasHoy] = useState(0)
  const [totalVentasHoy, setTotalVentasHoy] = useState(0)

  const { user, userProfile } = useAuth()
  const navigate = useNavigate()

  // Verificar que el usuario esté autenticado
  useEffect(() => {
    if (!user) {
      alert('Debes iniciar sesión para acceder a ventas')
      navigate('/login')
    }
  }, [user, navigate])

  useEffect(() => {
    if (user) {
      fetchProductos()
      fetchVentasHoy()
    }
  }, [user])

  // Obtener productos con sus ingredientes
  const fetchProductos = async () => {
    try {
      setLoading(true)

      // Obtener productos
      const { data: productos, error: errorProductos } = await supabase
        .from('productos')
        .select('*')
        .order('id', { ascending: true })

      if (errorProductos) throw errorProductos

      // Obtener ingredientes de cada producto
      const { data: ingredientesProducto, error: errorIngredientes } =
        await supabase.from('producto_ingrediente').select(
          `
          producto_id,
          ingredientes (
            id,
            nombre,
            inventario
          )
        `
        )

      if (errorIngredientes) throw errorIngredientes

      // Combinar información
      const productosCompletos = productos.map((producto) => {
        const ingredientes = ingredientesProducto
          .filter((ip) => ip.producto_id === producto.id)
          .map((ip) => ip.ingredientes)

        // Verificar disponibilidad (todos los ingredientes deben tener stock)
        const disponible = ingredientes.every((ing) => ing.inventario > 0)

        return {
          ...producto,
          ingredientes,
          disponible,
        }
      })

      setProductosDetalle(productosCompletos)
      setProductos(productos)
    } catch (error) {
      console.error('Error al cargar productos:', error)
      alert('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  // Obtener ventas del día
  const fetchVentasHoy = async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('ventas')
        .select(
          `
          *,
          productos (nombre)
        `
        )
        .gte('fecha', hoy)
        .order('fecha', { ascending: false })

      if (error) throw error

      setVentas(data || [])

      // Calcular estadísticas
      const contador = data?.length || 0
      const total = data?.reduce((sum, v) => sum + parseFloat(v.total), 0) || 0

      setVentasHoy(contador)
      setTotalVentasHoy(total)
    } catch (error) {
      console.error('Error al cargar ventas:', error)
    }
  }

  // Función para vender un producto
  const venderProducto = async (producto) => {
    // Verificar disponibilidad
    if (!producto.disponible) {
      alert(
        '❌ No hay suficiente inventario de ingredientes para este producto'
      )
      return
    }

    const cantidad = parseInt(
      prompt(`¿Cuántas unidades de "${producto.nombre}" deseas vender?`, '1')
    )

    if (!cantidad || cantidad <= 0 || isNaN(cantidad)) {
      return
    }

    try {
      // 1. Verificar inventario suficiente
      for (const ingrediente of producto.ingredientes) {
        if (ingrediente.inventario < cantidad) {
          alert(
            `❌ No hay suficiente inventario de ${ingrediente.nombre}. Disponible: ${ingrediente.inventario}, Necesario: ${cantidad}`
          )
          return
        }
      }

      // 2. Descontar inventario de cada ingrediente
      for (const ingrediente of producto.ingredientes) {
        const { error: errorUpdate } = await supabase
          .from('ingredientes')
          .update({ inventario: ingrediente.inventario - cantidad })
          .eq('id', ingrediente.id)

        if (errorUpdate) throw errorUpdate
      }

      // 3. Registrar la venta
      const { error: errorVenta } = await supabase.from('ventas').insert([
        {
          producto_id: producto.id,
          user_id: user.id,
          cantidad: cantidad,
          total: producto.precio_publico * cantidad,
        },
      ])

      if (errorVenta) throw errorVenta

      alert(
        `✅ Venta realizada correctamente: ${cantidad} x ${producto.nombre}`
      )

      // Recargar datos
      fetchProductos()
      fetchVentasHoy()
    } catch (error) {
      console.error('Error al realizar venta:', error)
      alert('❌ Error al realizar la venta')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div
          className="spinner-border text-primary"
          role="status"
        >
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4">💰 Sistema de Ventas</h2>

      {/* Estadísticas del día */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">🛒 Ventas del Día</h5>
              <p className="display-4 mb-0">{ventasHoy}</p>
              <small>transacciones realizadas hoy</small>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">💵 Total del Día</h5>
              <p className="display-4 mb-0">${totalVentasHoy.toFixed(2)}</p>
              <small>ingresos generados hoy</small>
            </div>
          </div>
        </div>
      </div>

      {/* Productos disponibles para venta */}
      <div className="mb-4">
        <h4 className="mb-3">🍨 Productos Disponibles</h4>
        <div className="row g-3">
          {productosDetalle.map((producto) => (
            <div
              key={producto.id}
              className="col-md-6 col-lg-4"
            >
              <div
                className={`card h-100 ${
                  producto.disponible ? '' : 'border-danger'
                }`}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{producto.nombre}</h5>
                    <span className="fs-3">
                      {producto.tipo === 'copa' ? '🍨' : '🥤'}
                    </span>
                  </div>

                  <p className="text-muted mb-2">
                    <strong>Precio:</strong> ${producto.precio_publico}
                  </p>

                  {/* Estado de disponibilidad */}
                  {producto.disponible ? (
                    <div className="alert alert-success py-2 mb-2">
                      ✅ Disponible
                    </div>
                  ) : (
                    <div className="alert alert-danger py-2 mb-2">
                      ❌ Sin inventario suficiente
                    </div>
                  )}

                  {/* Ingredientes con su inventario */}
                  <div className="mb-3">
                    <small className="text-muted d-block mb-1">
                      <strong>Ingredientes:</strong>
                    </small>
                    {producto.ingredientes.map((ing) => (
                      <div
                        key={ing.id}
                        className="d-flex justify-content-between mb-1"
                      >
                        <small>{ing.nombre}</small>
                        <span
                          className={`badge ${
                            ing.inventario > 0 ? 'bg-success' : 'bg-danger'
                          }`}
                        >
                          {ing.inventario}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    className="btn btn-primary w-100"
                    onClick={() => venderProducto(producto)}
                    disabled={!producto.disponible}
                  >
                    {producto.disponible ? '🛒 Vender' : '❌ No Disponible'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historial de ventas del día */}
      <div>
        <h4 className="mb-3">📋 Historial de Ventas Hoy</h4>
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Hora</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {ventas.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center text-muted"
                  >
                    No hay ventas registradas hoy
                  </td>
                </tr>
              ) : (
                ventas.map((venta) => (
                  <tr key={venta.id}>
                    <td>{new Date(venta.fecha).toLocaleTimeString('es-CO')}</td>
                    <td>{venta.productos?.nombre || 'Producto eliminado'}</td>
                    <td>
                      <span className="badge bg-primary">{venta.cantidad}</span>
                    </td>
                    <td className="text-success fw-bold">
                      ${parseFloat(venta.total).toFixed(2)}
                    </td>
                    <td>
                      {venta.user_id === user.id
                        ? 'Tú'
                        : venta.user_id || 'Sistema'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
