# 🍦 Heladería Frost & Cream - Sistema de Gestión

Sistema completo de gestión para heladería con React + Vite y Supabase.

## 📋 Requisitos Cumplidos del Proyecto

### ✅ Requisitos Técnicos

1. **Frontend en React con Vite** - Implementado con Vite 7.2.4 y React 19.2.0
2. **Estilos con Bootstrap** - Utiliza Bootstrap 5.3.0 via CDN
3. **Conexión a Supabase** - API REST automática configurada
4. **CRUD completo de ingredientes** - Página `/ingredientes` con todas las operaciones
5. **Listado de productos** - Muestra ingredientes, calorías, costo y rentabilidad
6. **Función de venta** - Descuenta inventario y registra ventas automáticamente
7. **Autenticación** - Login con Supabase Auth implementado
8. **Autorización por roles**:
   - Admin: Acceso total incluyendo rentabilidad
   - Empleado: Todas las funciones excepto rentabilidad
   - Cliente: Ventas y visualización de productos
   - Público: Solo visualización de productos
9. **Interfaz atractiva** - Logo, nombre creativo "Frost & Cream" y diseño responsive
10. **Despliegue** - Preparado para Vercel (instrucciones incluidas)

### 📁 Estructura del Proyecto

```
mi-crud-react/
│── index.html                 # HTML principal
│── vite.config.js            # Configuración de Vite
│── package.json              # Dependencias
│── README.md                 # Este archivo
└── src/
    │── main.jsx              # Punto de entrada
    │── App.jsx               # Componente principal
    │── supabaseClient.js     # Configuración de Supabase
    ├── context/
    │   └── AuthContext.jsx   # Contexto de autenticación
    └── pages/
        ├── Home.jsx          # Página de inicio
        ├── Login.jsx         # Login y registro
        ├── Ingredientes.jsx  # CRUD de ingredientes
        ├── Productos.jsx     # Listado de productos
        └── Ventas.jsx        # Sistema de ventas
```

## 🚀 Instalación y Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

#### Ejecutar scripts SQL en Supabase (SQL Editor):

**Script de creación de tablas:**

```sql
-- Usuarios
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  rol text check (rol in ('admin', 'empleado', 'cliente')) not null default 'cliente'
);

-- Ingredientes
create table public.ingredientes (
  id bigserial primary key,
  nombre text not null,
  precio numeric(10,2) not null,
  calorias integer not null,
  inventario integer not null default 0,
  es_vegetariano boolean not null default false,
  es_sano boolean not null default true,
  tipo text check (tipo in ('base', 'complemento')) not null,
  sabor text
);

-- Productos
create table public.productos (
  id bigserial primary key,
  nombre text not null,
  precio_publico numeric(10,2) not null,
  tipo text check (tipo in ('copa', 'malteada')) not null,
  vaso text,
  volumen_onzas integer
);

-- Relación productos - ingredientes
create table public.producto_ingrediente (
  id bigserial primary key,
  producto_id bigint not null references public.productos(id) on delete cascade,
  ingrediente_id bigint not null references public.ingredientes(id) on delete cascade
);

-- Ventas
create table public.ventas (
  id bigserial primary key,
  producto_id bigint not null references public.productos(id),
  user_id uuid references public.users(id),
  fecha timestamp with time zone default now(),
  cantidad integer not null default 1,
  total numeric(10,2) not null
);

-- Vistas
create view public.v_calorias_producto as
select p.id as producto_id, p.nombre,
sum(i.calorias) as total_calorias
from public.productos p
join public.producto_ingrediente pi on p.id = pi.producto_id
join public.ingredientes i on pi.ingrediente_id = i.id
group by p.id, p.nombre;

create view public.v_costo_producto as
select p.id as producto_id, p.nombre,
sum(i.precio) as costo
from public.productos p
join public.producto_ingrediente pi on p.id = pi.producto_id
join public.ingredientes i on pi.ingrediente_id = i.id
group by p.id, p.nombre;

create view public.v_rentabilidad_producto as
select p.id as producto_id, p.nombre,
p.precio_publico,
c.costo,
(p.precio_publico - c.costo) as rentabilidad
from public.productos p
join public.v_costo_producto c on p.id = c.producto_id;
```

**Script de datos iniciales:**

```sql
insert into public.ingredientes
(nombre, precio, calorias, inventario, es_vegetariano, es_sano, tipo, sabor)
values
('Vainilla', 1000, 150, 50, true, true, 'base', 'vainilla'),
('Fresa', 1200, 100, 40, true, true, 'base', 'fresa'),
('Chocolate', 1500, 200, 30, true, true, 'base', 'chocolate'),
('Chispas de Chocolate', 500, 50, 25, true, false, 'complemento', null),
('Crema Batida', 300, 70, 20, true, false, 'complemento', null),
('Sirope de Fresa', 400, 60, 15, true, false, 'complemento', null),
('Oreo', 800, 110, 25, true, false, 'complemento', null);

insert into public.productos
(nombre, precio_publico, tipo, vaso, volumen_onzas)
values
('Copa Vainilla Deluxe', 5000, 'copa', 'mediano', null),
('Copa ChocoFresa', 6000, 'copa', 'grande', null),
('Malteada de Fresa', 7000, 'malteada', null, 16),
('Malteada Oreo', 7500, 'malteada', null, 20);

-- Asignar ingredientes a productos
-- Copa Vainilla Deluxe: Vainilla + Crema Batida + Chispas de Chocolate
insert into public.producto_ingrediente (producto_id, ingrediente_id)
values (1, 1), (1, 5), (1, 4);

-- Copa ChocoFresa: Chocolate + Fresa + Sirope de Fresa
insert into public.producto_ingrediente (producto_id, ingrediente_id)
values (2, 3), (2, 2), (2, 6);

-- Malteada de Fresa: Fresa + Crema Batida + Sirope de Fresa
insert into public.producto_ingrediente (producto_id, ingrediente_id)
values (3, 2), (3, 5), (3, 6);

-- Malteada Oreo: Vainilla + Crema Batida + Oreo
insert into public.producto_ingrediente (producto_id, ingrediente_id)
values (4, 1), (4, 5), (4, 7);
```

### 3. Configurar políticas de seguridad (RLS) en Supabase

En Supabase → Authentication → Policies, habilitar RLS y agregar políticas públicas para todas las tablas:

```sql
-- Ejemplo para ingredientes (repetir para todas las tablas)
alter table public.ingredientes enable row level security;

create policy "Permitir lectura pública"
on public.ingredientes for select
to anon, authenticated
using (true);

create policy "Permitir todas las operaciones a usuarios autenticados"
on public.ingredientes for all
to authenticated
using (true)
with check (true);
```

### 4. Crear usuarios de prueba

Ir a Supabase → Authentication → Users y crear:

- admin@frost.com / password (rol: admin)
- empleado@frost.com / password (rol: empleado)
- cliente@frost.com / password (rol: cliente)

Luego insertar en la tabla `users`:

```sql
insert into public.users (id, nombre, rol)
values
('uuid-del-admin', 'Administrador', 'admin'),
('uuid-del-empleado', 'Empleado', 'empleado'),
('uuid-del-cliente', 'Cliente', 'cliente');
```

## 💻 Ejecutar en desarrollo

```bash
npm run dev
```

Abre http://localhost:5173

## 📦 Build para producción

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`

## 🚀 Desplegar en Vercel

### Opción 1: Desde GitHub

1. Sube tu proyecto a GitHub
2. Importa el repositorio en Vercel
3. Vercel detectará automáticamente Vite
4. Deploy

### Opción 2: CLI de Vercel

```bash
npm install -g vercel
vercel login
vercel
```

## 👤 Roles y Permisos

| Rol          | Ingredientes | Productos       | Ventas      | Rentabilidad |
| ------------ | ------------ | --------------- | ----------- | ------------ |
| **Público**  | ❌           | ✅ Ver          | ❌          | ❌           |
| **Cliente**  | ❌           | ✅ Ver          | ✅ Realizar | ❌           |
| **Empleado** | ✅ CRUD      | ✅ Ver          | ✅ Realizar | ❌           |
| **Admin**    | ✅ CRUD      | ✅ Ver completo | ✅ Realizar | ✅ Ver       |

## 🎯 Funcionalidades Principales

### Ingredientes (Admin/Empleado)

- ✅ Crear, leer, actualizar, eliminar
- 📦 Reabastecer inventario
- 🔄 Renovar inventario (a 0 para complementos)
- 🏷️ Clasificación por tipo (base/complemento)

### Productos (Todos)

- 👀 Ver lista completa con ingredientes
- 🔢 Visualizar calorías totales
- 💰 Ver costo y rentabilidad (solo admin)
- ⭐ Identificar producto más rentable (solo admin)

### Ventas (Autenticados)

- 🛒 Vender productos con validación de inventario
- 📊 Contador de ventas del día
- 💵 Total de ingresos del día
- 📋 Historial de ventas

## 🔧 Tecnologías Utilizadas

- **React 19.2.0** - Framework de UI
- **Vite 7.2.4** - Build tool
- **Supabase 2.84.0** - Backend as a Service
- **Bootstrap 5.3.0** - Framework CSS
- **React Router 7.9.6** - Enrutamiento

## 📝 Notas Importantes

1. Las credenciales de Supabase están en `src/supabaseClient.js`
2. El sistema valida inventario antes de realizar ventas
3. Las vistas de calorías, costo y rentabilidad se calculan automáticamente
4. Los productos requieren exactamente 3 ingredientes
5. Solo los complementos pueden renovarse (inventario a 0)

## 🐛 Solución de Problemas

**Error de conexión a Supabase:**

- Verifica que las URLs y claves sean correctas
- Revisa que las políticas RLS estén configuradas

**No se muestran datos:**

- Ejecuta los scripts SQL de datos iniciales
- Verifica las políticas de seguridad

**Error al vender:**

- Verifica que haya inventario suficiente
- Revisa que el usuario esté autenticado

## 📧 Contacto

Proyecto desarrollado por Luis Fernando Sanchez F. Taller final del curso de Desarrollo Web Frontend
Universidad de Los Andes - Educación Continua

---

🍦 **Frost & Cream** - Sabores que derriten corazones ❤️
