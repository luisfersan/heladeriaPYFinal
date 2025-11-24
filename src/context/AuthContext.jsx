// src/context/AuthContext.jsx
// Contexto para manejar la autenticación y autorización de usuarios
// Requisito #7: Autenticación de usuarios (login con Supabase Auth)
// Requisito #8: Autorización por roles (admin, empleado, cliente, público)

import React, { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../supabaseClient'

// Crear el contexto de autenticación
const AuthContext = createContext({})

// Hook personalizado para usar el contexto de autenticación
// Este hook se usará en todos los componentes que necesiten saber si hay un usuario logueado
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

// Provider del contexto de autenticación
// Este componente envuelve toda la aplicación y provee el estado de autenticación
export const AuthProvider = ({ children }) => {
  // Estado para el usuario autenticado (de Supabase Auth)
  const [user, setUser] = useState(null)

  // Estado para el perfil del usuario (incluye nombre y rol de nuestra tabla users)
  const [userProfile, setUserProfile] = useState(null)

  // Estado de carga
  const [loading, setLoading] = useState(true)

  // Efecto para verificar la sesión actual al cargar la app
  useEffect(() => {
    // Obtener la sesión actual de Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // Si hay usuario, obtener su perfil con el rol
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Escuchar cambios en la autenticación (login, logout, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
        setLoading(false)
      }
    })

    // Limpiar la suscripción al desmontar el componente
    return () => subscription.unsubscribe()
  }, [])

  // Función para obtener el perfil del usuario con su rol desde la tabla users
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUserProfile(data)
    } catch (error) {
      console.error('Error al obtener perfil:', error)
      // Si no existe el perfil, crear uno por defecto como cliente
      setUserProfile({ id: userId, nombre: 'Usuario', rol: 'cliente' })
    } finally {
      setLoading(false)
    }
  }

  // Función de login (iniciar sesión)
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Función de registro (crear cuenta nueva)
  const signUp = async (email, password, nombre, rol = 'cliente') => {
    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      // 2. Crear perfil de usuario con rol en nuestra tabla users
      if (authData.user) {
        const { error: profileError } = await supabase.from('users').insert([
          {
            id: authData.user.id,
            nombre,
            rol,
          },
        ])

        if (profileError) throw profileError
      }

      return { data: authData, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Función de logout (cerrar sesión)
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUserProfile(null)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  // Verificar si el usuario tiene un rol específico
  // Se puede pasar un string o un array de roles
  // Ejemplo: hasRole('admin') o hasRole(['admin', 'empleado'])
  const hasRole = (roles) => {
    if (!userProfile) return false
    if (Array.isArray(roles)) {
      return roles.includes(userProfile.rol)
    }
    return userProfile.rol === roles
  }

  // Obtener el rol del usuario actual
  // Retorna: 'admin', 'empleado', 'cliente', o 'publico'
  const getUserRole = () => {
    return userProfile?.rol || 'publico'
  }

  // Valor que se provee a todos los componentes hijos
  const value = {
    user, // Usuario autenticado de Supabase Auth
    userProfile, // Perfil del usuario con nombre y rol
    loading, // Estado de carga
    signIn, // Función para iniciar sesión
    signUp, // Función para registrarse
    signOut, // Función para cerrar sesión
    hasRole, // Función para verificar roles
    getUserRole, // Función para obtener el rol actual
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
