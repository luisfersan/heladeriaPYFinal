// Configuración del cliente de Supabase para conectar con la base de datos
import { createClient } from '@supabase/supabase-js'

// URL del proyecto de Supabase
const supabaseUrl = 'https://fzcyaycbpqcjbkmjukgq.supabase.co'

// Clave pública (anon key) de Supabase - segura para usar en el frontend
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6Y3lheWNicHFjamJrbWp1a2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NTAwNjYsImV4cCI6MjA3OTQyNjA2Nn0.jbb0QsyG6ZzYHI1wHGkP69JsXSNeXG4gCl712wVP9a4'

// Crear y exportar el cliente de Supabase
// Este cliente se usará en toda la aplicación para interactuar con la base de datos
export const supabase = createClient(supabaseUrl, supabaseKey)
