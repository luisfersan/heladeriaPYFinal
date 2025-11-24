// Página para gestionar ingredientes (CRUD completo)
// Requisito #4: CRUD completo de ingredientes
// Requisito #8: Autorización - Solo admin y empleado pueden acceder

import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Ingredientes() {
  const [ingredientes, setIngredientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState(null)

  // Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    calorias: '',
    inventario: '',
    es_vegetariano: true,
    es_sano: true,
    tipo: 'base',
    sabor: '',
  })

  const { hasRole } = useAuth()
  const navigate = useNavigate()

  // Verificar autorización
  useEffect(() => {
    if (!hasRole(['admin', 'empleado'])) {
      alert('No tienes permisos para acceder a esta página')
      navigate('/')
    }
  }, [hasRole, navigate])

  // Cargar ingredientes al montar el componente
  useEffect(() => {
    fetchIngredientes()
  }, [])

  // Función para obtener todos los ingredientes
  const fetchIngredientes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('ingredientes')
        .select('*')
        .order('id', { ascending: true })

      if (error) throw error
      setIngredientes(data || [])
    } catch (error) {
      console.error('Error al cargar ingredientes:', error)
      alert('Error al cargar ingredientes')
    } finally {
      setLoading(false)
    }
  }

  // Función para crear o actualizar ingrediente
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const dataToSave = {
        ...formData,
        precio: parseFloat(formData.precio),
        calorias: parseInt(formData.calorias),
        inventario: parseInt(formData.inventario),
        // Solo guardar sabor si el tipo es 'base'
        sabor: formData.tipo === 'base' ? formData.sabor : null,
      }

      if (editando) {
        // Actualizar
        const { error } = await supabase
          .from('ingredientes')
          .update(dataToSave)
          .eq('id', editando.id)

        if (error) throw error
        alert('Ingrediente actualizado correctamente')
      } else {
        // Crear
        const { error } = await supabase
          .from('ingredientes')
          .insert([dataToSave])

        if (error) throw error
        alert('Ingrediente creado correctamente')
      }

      // Resetear formulario y recargar
      resetForm()
      fetchIngredientes()
      setShowModal(false)
    } catch (error) {
      console.error('Error al guardar:', error)
      alert('Error al guardar ingrediente')
    }
  }

  // Función para eliminar ingrediente
  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este ingrediente?')) return

    try {
      const { error } = await supabase
        .from('ingredientes')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Ingrediente eliminado correctamente')
      fetchIngredientes()
    } catch (error) {
      console.error('Error al eliminar:', error)
      alert('Error al eliminar ingrediente')
    }
  }

  // Función para reabastecer ingrediente
  const handleReabastecer = async (id, nombre) => {
    const cantidad = prompt(
      `¿Cuántas unidades deseas agregar al inventario de ${nombre}?`
    )
    if (!cantidad || isNaN(cantidad)) return

    try {
      // Obtener inventario actual
      const { data: current } = await supabase
        .from('ingredientes')
        .select('inventario')
        .eq('id', id)
        .single()

      // Actualizar inventario
      const { error } = await supabase
        .from('ingredientes')
        .update({ inventario: current.inventario + parseInt(cantidad) })
        .eq('id', id)

      if (error) throw error
      alert('Inventario actualizado correctamente')
      fetchIngredientes()
    } catch (error) {
      console.error('Error al reabastecer:', error)
      alert('Error al reabastecer inventario')
    }
  }

  // Función para renovar inventario (poner a 0 si es complemento)
  const handleRenovar = async (id, tipo, nombre) => {
    if (tipo !== 'complemento') {
      alert('Solo los complementos pueden renovarse (inventario a 0)')
      return
    }

    if (!confirm(`¿Poner a 0 el inventario de ${nombre}?`)) return

    try {
      const { error } = await supabase
        .from('ingredientes')
        .update({ inventario: 0 })
        .eq('id', id)

      if (error) throw error
      alert('Inventario renovado correctamente')
      fetchIngredientes()
    } catch (error) {
      console.error('Error al renovar:', error)
      alert('Error al renovar inventario')
    }
  }

  // Preparar edición
  const handleEdit = (ingrediente) => {
    setEditando(ingrediente)
    setFormData({
      nombre: ingrediente.nombre,
      precio: ingrediente.precio,
      calorias: ingrediente.calorias,
      inventario: ingrediente.inventario,
      es_vegetariano: ingrediente.es_vegetariano,
      es_sano: ingrediente.es_sano,
      tipo: ingrediente.tipo,
      sabor: ingrediente.sabor || '',
    })
    setShowModal(true)
  }

  // Resetear formulario
  const resetForm = () => {
    setEditando(null)
    setFormData({
      nombre: '',
      precio: '',
      calorias: '',
      inventario: '',
      es_vegetariano: true,
      es_sano: true,
      tipo: 'base',
      sabor: '',
    })
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">🧊 Gestión de Ingredientes</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
        >
          ➕ Agregar Ingrediente
        </button>
      </div>

      {/* Tabla de ingredientes */}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Calorías</th>
              <th>Inventario</th>
              <th>Tipo</th>
              <th>Sabor</th>
              <th>Vegetariano</th>
              <th>Sano</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ingredientes.map((ing) => (
              <tr key={ing.id}>
                <td>{ing.id}</td>
                <td>{ing.nombre}</td>
                <td>${ing.precio}</td>
                <td>{ing.calorias} cal</td>
                <td>
                  <span
                    className={`badge ${
                      ing.inventario > 10
                        ? 'bg-success'
                        : ing.inventario > 0
                        ? 'bg-warning'
                        : 'bg-danger'
                    }`}
                  >
                    {ing.inventario}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge ${
                      ing.tipo === 'base' ? 'bg-primary' : 'bg-secondary'
                    }`}
                  >
                    {ing.tipo}
                  </span>
                </td>
                <td>{ing.sabor || '-'}</td>
                <td>{ing.es_vegetariano ? '✅' : '❌'}</td>
                <td>{ing.es_sano ? '✅' : '❌'}</td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handleEdit(ing)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-outline-success"
                      onClick={() => handleReabastecer(ing.id, ing.nombre)}
                      title="Reabastecer"
                    >
                      📦
                    </button>
                    {ing.tipo === 'complemento' && (
                      <button
                        className="btn btn-outline-warning"
                        onClick={() =>
                          handleRenovar(ing.id, ing.tipo, ing.nombre)
                        }
                        title="Renovar (a 0)"
                      >
                        🔄
                      </button>
                    )}
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleDelete(ing.id)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de formulario */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editando ? 'Editar' : 'Nuevo'} Ingrediente
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Precio</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.precio}
                        onChange={(e) =>
                          setFormData({ ...formData, precio: e.target.value })
                        }
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Calorías</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.calorias}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            calorias: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Inventario</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.inventario}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            inventario: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tipo</label>
                      <select
                        className="form-select"
                        value={formData.tipo}
                        onChange={(e) =>
                          setFormData({ ...formData, tipo: e.target.value })
                        }
                      >
                        <option value="base">Base</option>
                        <option value="complemento">Complemento</option>
                      </select>
                    </div>
                  </div>

                  {formData.tipo === 'base' && (
                    <div className="mb-3">
                      <label className="form-label">Sabor</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.sabor}
                        onChange={(e) =>
                          setFormData({ ...formData, sabor: e.target.value })
                        }
                      />
                    </div>
                  )}

                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={formData.es_vegetariano}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          es_vegetariano: e.target.checked,
                        })
                      }
                      id="vegetariano"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="vegetariano"
                    >
                      Es Vegetariano
                    </label>
                  </div>

                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={formData.es_sano}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          es_sano: e.target.checked,
                        })
                      }
                      id="sano"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="sano"
                    >
                      Es Sano
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editando ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
