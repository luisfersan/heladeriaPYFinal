// Página para listar productos con sus ingredientes
// Requisito #5: Listado de productos con ingredientes, calorías, costo y rentabilidad
// Requisito #8d: Público puede ver lista de productos

import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [productosDetalle, setProductosDetalle] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProducto, setSelectedProducto] = useState(null)

  const { getUserRole } = useAuth()
  const rol = getUserRole()

  // Verificar si el usuario puede ver rentabilidad (solo admin)
  const puedeVerRentabilidad = rol === 'admin'

  useEffect(() => {
    fetchProductos()
  }, [])

  // Obtener todos los productos con sus datos calculados
  const fetchProductos = async () => {
    try {
      setLoading(true)

      // 1. Obtener productos básicos
      const { data: productos, error: errorProductos } = await supabase
        .from('productos')
        .select('*')
        .order('id', { ascending: true })

      if (errorProductos) throw errorProductos

      // 2. Obtener calorías desde la vista
      const { data: calorias, error: errorCalorias } = await supabase
        .from('v_calorias_producto')
        .select('*')

      if (errorCalorias) throw errorCalorias

      // 3. Obtener costos desde la vista
      const { data: costos, error: errorCostos } = await supabase
        .from('v_costo_producto')
        .select('*')

      if (errorCostos) throw errorCostos

      // 4. Obtener rentabilidad desde la vista
      const { data: rentabilidad, error: errorRentabilidad } = await supabase
        .from('v_rentabilidad_producto')
        .select('*')

      if (errorRentabilidad) throw errorRentabilidad

      // 5. Obtener ingredientes de cada producto
      const { data: ingredientesProducto, error: errorIngredientes } =
        await supabase.from('producto_ingrediente').select(
          `
          producto_id,
          ingredientes (
            id,
            nombre,
            precio,
            calorias,
            inventario,
            tipo
          )
        `
        )

      if (errorIngredientes) throw errorIngredientes

      // Combinar toda la información
      const productosCompletos = productos.map((producto) => {
        const caloriasData = calorias.find((c) => c.producto_id === producto.id)
        const costoData = costos.find((c) => c.producto_id === producto.id)
        const rentabilidadData = rentabilidad.find(
          (r) => r.producto_id === producto.id
        )
        const ingredientes = ingredientesProducto
          .filter((ip) => ip.producto_id === producto.id)
          .map((ip) => ip.ingredientes)

        return {
          ...producto,
          total_calorias: caloriasData?.total_calorias || 0,
          costo: costoData?.costo || 0,
          rentabilidad: rentabilidadData?.rentabilidad || 0,
          ingredientes: ingredientes || [],
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

  // Función para ver detalles de un producto
  const verDetalles = (producto) => {
    setSelectedProducto(producto)
  }

  // Función para obtener el producto más rentable
  const productoMasRentable = () => {
    if (productosDetalle.length === 0) return null
    return productosDetalle.reduce((max, p) =>
      p.rentabilidad > max.rentabilidad ? p : max
    )
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

  const masRentable = productoMasRentable()

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">🍨 Nuestros Productos</h2>
      </div>

      {/* Mostrar producto más rentable solo para admin */}
      {puedeVerRentabilidad && masRentable && (
        <div className="alert alert-success mb-4">
          <h5>⭐ Producto Más Rentable</h5>
          <p className="mb-0">
            <strong>{masRentable.nombre}</strong> - Rentabilidad: $
            {masRentable.rentabilidad.toFixed(2)}
          </p>
        </div>
      )}

      {/* Grid de productos */}
      <div className="row g-4">
        {productosDetalle.map((producto) => (
          <div
            key={producto.id}
            className="col-md-6 col-lg-4"
          >
            <div className="card h-100 shadow-sm hover-shadow">
              <div className="card-body">
                {/* Icono según tipo */}
                <div className="text-center mb-3">
                  <span className="fs-1">
                    {producto.tipo === 'copa' ? '🍨' : '🥤'}
                  </span>
                </div>

                {/* Nombre del producto */}
                <h5 className="card-title text-center mb-3">
                  {producto.nombre}
                </h5>

                {/* Información del producto */}
                <div className="mb-3">
                  <p className="mb-1">
                    <strong>Tipo:</strong>{' '}
                    <span className="badge bg-primary">{producto.tipo}</span>
                  </p>

                  {producto.tipo === 'copa' && producto.vaso && (
                    <p className="mb-1">
                      <strong>Vaso:</strong> {producto.vaso}
                    </p>
                  )}

                  {producto.tipo === 'malteada' && producto.volumen_onzas && (
                    <p className="mb-1">
                      <strong>Volumen:</strong> {producto.volumen_onzas} oz
                    </p>
                  )}

                  <p className="mb-1">
                    <strong>Precio:</strong>{' '}
                    <span className="text-success fw-bold">
                      ${producto.precio_publico}
                    </span>
                  </p>

                  <p className="mb-1">
                    <strong>Calorías:</strong> {producto.total_calorias} cal
                  </p>

                  {/* Mostrar costo y rentabilidad solo si tiene permisos */}
                  {puedeVerRentabilidad && (
                    <>
                      <p className="mb-1">
                        <strong>Costo:</strong> ${producto.costo.toFixed(2)}
                      </p>
                      <p className="mb-1">
                        <strong>Rentabilidad:</strong>{' '}
                        <span
                          className={
                            producto.rentabilidad > 0
                              ? 'text-success'
                              : 'text-danger'
                          }
                        >
                          ${producto.rentabilidad.toFixed(2)}
                        </span>
                      </p>
                    </>
                  )}
                </div>

                {/* Ingredientes */}
                <div className="mb-3">
                  <strong>Ingredientes:</strong>
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {producto.ingredientes.map((ing) => (
                      <span
                        key={ing.id}
                        className="badge bg-secondary"
                        title={`${ing.tipo} - Inventario: ${ing.inventario}`}
                      >
                        {ing.nombre}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Botón de detalles */}
                <button
                  className="btn btn-outline-primary w-100"
                  onClick={() => verDetalles(producto)}
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de detalles */}
      {selectedProducto && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedProducto(null)}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Detalles: {selectedProducto.nombre}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setSelectedProducto(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Información General</h6>
                    <ul className="list-group mb-3">
                      <li className="list-group-item">
                        <strong>Tipo:</strong> {selectedProducto.tipo}
                      </li>
                      <li className="list-group-item">
                        <strong>Precio al Público:</strong> $
                        {selectedProducto.precio_publico}
                      </li>
                      <li className="list-group-item">
                        <strong>Calorías Totales:</strong>{' '}
                        {selectedProducto.total_calorias} cal
                      </li>
                      {puedeVerRentabilidad && (
                        <>
                          <li className="list-group-item">
                            <strong>Costo de Producción:</strong> $
                            {selectedProducto.costo.toFixed(2)}
                          </li>
                          <li className="list-group-item">
                            <strong>Rentabilidad:</strong> $
                            {selectedProducto.rentabilidad.toFixed(2)}
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="col-md-6">
                    <h6>Ingredientes Detallados</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Tipo</th>
                            <th>Calorías</th>
                            <th>Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProducto.ingredientes.map((ing) => (
                            <tr key={ing.id}>
                              <td>{ing.nombre}</td>
                              <td>
                                <span className="badge bg-info">
                                  {ing.tipo}
                                </span>
                              </td>
                              <td>{ing.calorias} cal</td>
                              <td>
                                <span
                                  className={`badge ${
                                    ing.inventario > 0
                                      ? 'bg-success'
                                      : 'bg-danger'
                                  }`}
                                >
                                  {ing.inventario}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedProducto(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
