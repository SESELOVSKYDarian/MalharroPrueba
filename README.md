# Malharro – Sitio institucional con panel y backend propio

Este repositorio contiene el front-end construido con Next.js y el nuevo stack de administración desarrollado en Node.js + Express. El objetivo es reemplazar completamente Strapi manteniendo el estilo visual de Malharro y todas las funcionalidades editoriales.

## Estructura del proyecto

```
.
├── backend/        # API REST en Express + Sequelize
├── public/
├── src/            # Aplicación Next.js (frontend público + panel admin)
└── ...
```

## Requisitos previos

- Node.js 18+
- Base de datos MySQL, PostgreSQL **o** SQLite (para desarrollo). La conexión se configura mediante variables de entorno.

## Configuración del backend

1. Copiá el archivo de ejemplo y ajustá los valores según tu entorno:

   ```bash
   cd backend
   cp .env.example .env
   ```

   Variables relevantes:

   | Variable        | Descripción                                                    |
   | --------------- | -------------------------------------------------------------- |
   | `PORT`          | Puerto del API (por defecto 4000)                              |
   | `APP_URL`       | URL pública del backend (usada para generar links a uploads)   |
   | `JWT_SECRET`    | Clave para firmar los tokens JWT                               |
   | `DB_DIALECT`    | `postgres`, `mysql` o `sqlite`                                 |
   | `DB_HOST`...    | Credenciales de la base (ignorado si usás SQLite)              |
   | `DB_STORAGE`    | Ruta del archivo SQLite (solo modo `sqlite`)                   |
   | `ADMIN_EMAIL`   | Usuario admin creado por el seed (opcional)                    |
   | `ADMIN_PASSWORD`| Contraseña inicial del admin (por defecto `admin123`)          |

2. Instalá dependencias y ejecutá el script de seed:

   ```bash
   npm install
   npm run seed
   npm run start
   ```

   > En entornos sin acceso a npm registry podés descargar los paquetes de manera manual. El seed genera datos de muestra (slides, textos, agenda, documentos) y un usuario administrador.

## Configuración del frontend (Next.js)

1. Desde la raíz del repo copiá el archivo de entorno:

   ```bash
   cp .env.example .env.local
   ```

   Valores mínimos:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   NEXT_PUBLIC_URL=http://localhost:3000
   ```

2. Instalá dependencias y levantá el servidor de desarrollo:

   ```bash
   npm install
   npm run dev
   ```

   La aplicación pública estará disponible en `http://localhost:3000`.

## Panel administrativo

- Ruta: `/admin`
- Autenticación: ingresá con el usuario administrador generado por el seed (`admin@malharro.edu.ar` / `admin123`, salvo que lo modifiques).
- Secciones disponibles:
  - **Slider principal**: crear, editar y eliminar slides del hero.
  - **Agenda**: gestionar eventos y sus imágenes.
  - **Usina**: alta y edición de referentes con su imagen y link.
  - **Documentos**: subir material descargable (PDF u otros archivos).
  - **Textos**: modificar bloques de texto reutilizados en la home.
  - **Acordeón de carreras**: administrar elementos desplegables.
  - **Cargar archivos**: zona lateral para subir imágenes/PDF y obtener el ID asociado.

Todos los cambios se almacenan mediante el backend Express y se reflejan automáticamente en el frontend público.

## Endpoints principales

| Método | Endpoint                     | Descripción                              |
| ------ | ---------------------------- | ---------------------------------------- |
| POST   | `/api/auth/login`            | Ingreso con usuario/contraseña           |
| GET    | `/api/users/me`              | Perfil del usuario autenticado           |
| GET    | `/api/slider`                | Slider principal                         |
| CRUD   | `/api/slider/slides`         | Gestión de slides                        |
| CRUD   | `/api/agendas`               | Eventos de agenda                        |
| CRUD   | `/api/usinas`                | Referentes/egresados                     |
| CRUD   | `/api/documentos`            | Documentos descargables                  |
| GET    | `/api/textos/:key`           | Contenido de texto público               |
| PUT    | `/api/textos/:key`           | Actualizar texto                         |
| GET    | `/api/acordeones/:key`       | Datos del acordeón                       |
| PUT    | `/api/acordeones/:key`       | Crear/editar elementos del acordeón      |
| POST   | `/api/upload`                | Subida de archivos con `multipart/form-data` |

> Las operaciones de escritura requieren un token JWT con rol **Administrador**.

## Notas adicionales

- Los archivos subidos se guardan en `backend/uploads/`. Podés cambiar la ruta con `UPLOADS_DIR` en el `.env` del backend.
- El frontend dejó de depender de Strapi y consume exclusivamente la nueva API.
- El login con Google fue removido en esta iteración. Podés extender la API para soportarlo si lo necesitás.

## Scripts útiles

| Script                | Descripción                               |
| --------------------- | ----------------------------------------- |
| `npm run dev`         | Levanta el frontend Next.js               |
| `npm run build`       | Compila el frontend para producción       |
| `npm run start`       | Inicia Next.js en modo producción         |
| `backend/npm run dev` | Inicia el API con recarga en caliente     |
| `backend/npm run seed`| Regenera la base con datos iniciales      |

## Licencia

Proyecto académico – utilización interna del Instituto Superior de Arte Nº 2 "Martín Malharro".
