# Biblioteca Digital

## Identificación del Proyecto

**Nombre del proyecto:** Biblioteca Digital / Biblioteca Online
**Nombre del repositorio:** biblioteca-digital
**Versión:** 1.0.0
**Tipo de sistema:** Aplicación web monolítica
**Runtime:** Node.js 18 o superior
**Gestor de paquetes:** npm

**Deploy en Railway:**
https://bibliotecaonline-production.up.railway.app/

**Repositorio GitHub:**
https://github.com/PabloCannizzaro/BibliotecaOnline

---

## Descripción General

El proyecto consiste en una plataforma web para la gestión de una biblioteca digital, permitiendo a los usuarios consultar libros, realizar compras, solicitar préstamos, gestionar su cuenta y dejar reseñas.

Además, incluye un panel administrativo para la gestión integral del catálogo, stock, ventas, préstamos y usuarios.

La aplicación está desarrollada como un sistema web compuesto por un frontend estático y una API backend. El frontend permite la interacción del usuario con el catálogo, el inicio de sesión, el registro, la compra y el préstamo de libros.

El backend se encarga de procesar las solicitudes, gestionar la autenticación, consultar la base de datos y aplicar las reglas de negocio.

El sistema utiliza una base de datos MySQL con un modelo relacional normalizado, permitiendo administrar libros, autores, categorías, editoriales, ejemplares, usuarios, ventas, préstamos, reseñas, reservas y movimientos de stock.

---

## Objetivo del Proyecto

El objetivo principal del proyecto es desarrollar una plataforma web funcional para una biblioteca online que permita:

* Consultar un catálogo de libros.
* Filtrar y buscar libros por categoría o texto.
* Registrar e iniciar sesión de usuarios.
* Comprar libros disponibles.
* Solicitar préstamos de ejemplares.
* Visualizar el historial de compras y préstamos.
* Gestionar administrativamente libros, usuarios, ventas, préstamos y stock.
* Controlar accesos mediante roles de usuario y administrador.

---

## Stack Tecnológico

### Backend

* Node.js
* Express 4
* MySQL
* mysql2/promise
* JWT para autenticación
* bcryptjs para encriptación de contraseñas
* dotenv para variables de entorno
* cors para control de acceso entre cliente y servidor

### Frontend

* HTML
* CSS
* JavaScript vanilla
* Google Fonts
* Bootstrap Icons

### Base de Datos

* MySQL
* Modelo relacional normalizado
* Uso de claves primarias
* Uso de claves foráneas
* Uso de tablas puente

### Deploy

* Railway
* Builder: NIXPACKS
* Healthcheck: `/api/status`

---

## Arquitectura del Sistema

El sistema posee una arquitectura monolítica, donde el backend desarrollado con Express sirve tanto la API REST como los archivos estáticos del frontend.

La aplicación se organiza en tres grandes capas:

---

### 1. Capa de Presentación

Está formada por los archivos:

* `index.html`
* `styles.css`
* `script.js`
* Carpeta `/assets`

Esta capa permite al usuario interactuar con el catálogo, acceder a su cuenta, realizar operaciones de compra o préstamo y navegar por el sitio.

---

### 2. Capa de Lógica de Negocio

Está implementada mediante rutas y controladores en Express. Incluye la lógica para:

* Autenticación.
* Gestión de usuarios.
* Gestión de libros.
* Compras.
* Préstamos.
* Reseñas.
* Administración del sistema.

---

### 3. Capa de Persistencia

Se conecta con MySQL mediante un pool de conexiones configurado en `config/db.js`.

La comunicación con la base de datos se realiza mediante consultas SQL parametrizadas.

---

## Estructura Principal del Repositorio

| Archivo / Carpeta        | Descripción                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `server.js`              | Archivo principal del servidor. Inicializa Express, configura rutas, healthchecks y sirve el frontend. |
| `config/db.js`           | Configuración de conexión a MySQL mediante pool.                                                       |
| `middlewares/auth.js`    | Middleware de autenticación JWT y validación de rol administrador.                                     |
| `routes/authRoutes.js`   | Rutas de registro e inicio de sesión.                                                                  |
| `routes/bookRoutes.js`   | Rutas relacionadas al catálogo, filtros, detalle de libros y reseñas.                                  |
| `routes/userRoutes.js`   | Rutas para perfil, compras, préstamos e historial del usuario.                                         |
| `routes/adminRoutes.js`  | Rutas administrativas para dashboard, libros, stock, ventas, usuarios y préstamos.                     |
| `index.html`             | Estructura principal del frontend.                                                                     |
| `styles.css`             | Estilos visuales de la aplicación.                                                                     |
| `script.js`              | Lógica del frontend y manejo de estado.                                                                |
| `bd/schema_reparado.sql` | Script de creación de la base de datos.                                                                |
| `bd/seed_reparado.sql`   | Datos iniciales o demo.                                                                                |
| `bd/queries_test.sql`    | Consultas de prueba y verificación.                                                                    |
| `README.md`              | Documentación general del proyecto.                                                                    |
| `DEPLOY_RAILWAY.md`      | Documentación de despliegue.                                                                           |
| `railway.json`           | Configuración de despliegue en Railway.                                                                |

---

## Funcionalidades del Sistema

### Funcionalidades para Usuarios

* Registro de cuenta.
* Inicio de sesión.
* Consulta de catálogo de libros.
* Búsqueda de libros.
* Filtro por categorías.
* Visualización del detalle de cada libro.
* Visualización de reseñas.
* Creación de reseñas.
* Compra de libros.
* Solicitud de préstamos.
* Consulta de historial de compras.
* Consulta de préstamos activos e históricos.
* Acceso al panel “Mi cuenta”.

---

### Funcionalidades para Administradores

* Acceso a dashboard administrativo.
* Visualización de estadísticas generales.
* Gestión de libros.
* Alta, modificación y activación/desactivación de libros.
* Gestión de precios.
* Consulta de historial de precios.
* Gestión de ejemplares y stock.
* Consulta de libros con bajo stock.
* Consulta de usuarios.
* Consulta de ventas.
* Consulta de préstamos activos.
* Consulta de préstamos vencidos.
* Control operativo de la biblioteca.

---

## API Backend

### Rutas Generales

| Método | Ruta              | Descripción                             |
| ------ | ----------------- | --------------------------------------- |
| GET    | `/api/status`     | Verifica el estado general del sistema. |
| GET    | `/api/health/env` | Verifica variables de entorno.          |
| GET    | `/api/health/db`  | Verifica conexión con la base de datos. |

---

### Autenticación

| Método | Ruta                 | Descripción          |
| ------ | -------------------- | -------------------- |
| POST   | `/api/auth/register` | Registro de usuario. |
| POST   | `/api/auth/login`    | Inicio de sesión.    |

---

### Catálogo de Libros

| Método | Ruta                     | Descripción                                      |
| ------ | ------------------------ | ------------------------------------------------ |
| GET    | `/api/books/categories`  | Lista categorías.                                |
| GET    | `/api/books/authors`     | Lista autores.                                   |
| GET    | `/api/books/publishers`  | Lista editoriales.                               |
| GET    | `/api/books`             | Lista libros con búsqueda y filtros.             |
| GET    | `/api/books/:id`         | Muestra detalle de un libro.                     |
| POST   | `/api/books/:id/reviews` | Permite agregar reseñas. Requiere autenticación. |

---

### Usuario Autenticado

| Método | Ruta                  | Descripción                           |
| ------ | --------------------- | ------------------------------------- |
| GET    | `/api/user/me`        | Obtiene datos del usuario actual.     |
| POST   | `/api/user/purchases` | Registra una compra.                  |
| POST   | `/api/user/loans`     | Registra un préstamo.                 |
| GET    | `/api/user/purchases` | Lista compras del usuario.            |
| GET    | `/api/user/loans`     | Lista préstamos activos o históricos. |

---

### Administración

| Método | Ruta                          | Descripción                         |
| ------ | ----------------------------- | ----------------------------------- |
| GET    | `/api/admin/stats`            | Estadísticas generales.             |
| GET    | `/api/admin/dashboard`        | Datos para el panel administrativo. |
| GET    | `/api/admin/books`            | Lista libros para administración.   |
| GET    | `/api/admin/books/low-stock`  | Lista libros con bajo stock.        |
| POST   | `/api/admin/books`            | Crea un nuevo libro.                |
| PUT    | `/api/admin/books/:id`        | Edita un libro existente.           |
| PATCH  | `/api/admin/books/:id/status` | Cambia el estado de un libro.       |
| POST   | `/api/admin/books/:id/prices` | Registra un cambio de precio.       |
| POST   | `/api/admin/books/:id/copies` | Agrega ejemplares.                  |
| GET    | `/api/admin/users`            | Lista usuarios.                     |
| GET    | `/api/admin/sales`            | Lista ventas.                       |
| GET    | `/api/admin/loans/active`     | Lista préstamos activos.            |
| GET    | `/api/admin/loans/overdue`    | Lista préstamos vencidos.           |
| GET    | `/api/admin/price-history`    | Consulta historial de precios.      |

---

## Modelo de Datos

La base de datos está compuesta por 19 tablas principales:

* `roles`
* `users`
* `authors`
* `publishers`
* `categories`
* `books`
* `book_authors`
* `book_categories`
* `copies`
* `price_history`
* `sales`
* `sale_items`
* `loans`
* `loan_items`
* `reviews`
* `stock_movements`
* `reservations`
* `carts`
* `cart_items`

---

## Características del Modelo de Datos

* Uso de relaciones uno a muchos y muchos a muchos.
* Relaciones N:M resueltas mediante tablas puente.
* Gestión de inventario por ejemplar individual.
* Separación entre ventas y préstamos.
* Registro de historial de precios.
* Control de stock mediante movimientos.
* Integridad referencial mediante claves foráneas.

---

## Instalación y Ejecución Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/PabloCannizzaro/BibliotecaOnline.git
cd BibliotecaOnline
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las variables necesarias para la conexión a la base de datos y la autenticación.

Ejemplo:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=biblioteca_digital
JWT_SECRET=clave_secreta
```

### 4. Crear la base de datos

Ejecutar los scripts SQL ubicados en la carpeta `bd`:

```sql
bd/schema_reparado.sql
bd/seed_reparado.sql
```

### 5. Ejecutar el servidor

```bash
npm start
```

La aplicación quedará disponible en:

```bash
http://localhost:3000
```

---

## Estado del Proyecto

Proyecto funcional en versión 1.0.0, con frontend, backend, base de datos y deploy en Railway.

---

## Autor / Equipo

Proyecto desarrollado con fines académicos para la gestión de una biblioteca digital.


<img width="2095" height="2347" alt="DER-BIBLIOTECA DIGITAL" src="https://github.com/user-attachments/assets/dc033e43-a8a8-480e-a36b-5d971bba2677" />


------------------------------------------------------------------------------------------------------------------------------------------
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template?template=https://github.com/REEMPLAZAR_USUARIO_Y_REPOSITORIO)

Biblioteca online con frontend HTML/CSS/JS y backend Node.js + Express conectado a MySQL en Aiven mediante SSL.

TODO antes de publicar el README: reemplazar `REEMPLAZAR_USUARIO_Y_REPOSITORIO` por `USUARIO/REPOSITORIO`.

## Estructura

- `server.js`: servidor Express, frontend y endpoints de diagnostico.
- `config/db.js`: pool MySQL con `mysql2/promise`, variables de entorno y SSL.
- `routes/`: rutas `/api/auth`, `/api/books`, `/api/user` y `/api/admin`.
- `middlewares/auth.js`: validacion JWT y rol administrador.
- `index.html`, `styles.css`, `script.js`: frontend.
- No hay carpeta `public/` obligatoria: el servidor sirve `index.html`, `styles.css` y `script.js` desde la raiz.
- `bd/`: esquema, seed, consultas de prueba y documentacion SQL.
- `certs/ca.pem`: certificado CA publico para desarrollo local.
- `railway.json`: configuracion de deploy Railway.

## Ejecutar localmente

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env` copiando `.env.example`.

3. Completar `.env` con la password real de Aiven y un `JWT_SECRET` fuerte. No subir `.env` al repositorio.

4. Para SSL local, guardar el CA de Aiven en `certs/ca.pem` y configurar:

```env
DB_SSL_CA=./certs/ca.pem
```

Tambien se puede usar `DB_SSL_CA_CONTENT` con el contenido completo del certificado.

5. Importar la base:

```text
bd/schema_reparado.sql
bd/seed_reparado.sql
```

6. Iniciar:

```bash
npm start
```

7. Abrir:

```text
http://localhost:4000
```

## Probar backend

```text
http://localhost:4000/api/status
http://localhost:4000/api/health/env
http://localhost:4000/api/health/db
http://localhost:4000/api/books
```

`/api/status` debe responder:

```json
{
  "status": "ok",
  "message": "API de Biblioteca Digital activa"
}
```

`/api/health/db` ejecuta `SELECT DATABASE() AS database_name` y, si la conexion esta bien, responde:

```json
{
  "ok": true,
  "database": "biblioteca_digital"
}
```

## Variables de entorno

`.env.example` contiene valores de ejemplo. Variables requeridas:

```env
PORT=4000
NODE_ENV=development
DB_HOST=bookonline00-114-pmccole14-ecdc.d.aivencloud.com
DB_PORT=21861
DB_USER=avnadmin
DB_PASSWORD=REEMPLAZAR_PASSWORD
DB_NAME=biblioteca_digital

# Local:
DB_SSL_CA=./certs/ca.pem

# Railway:
# Pegar el contenido completo del ca.pem como variable en Railway.
# Si usas DB_SSL_CA_CONTENT, no hace falta DB_SSL_CA.
DB_SSL_CA_CONTENT=

JWT_SECRET=REEMPLAZAR_JWT_SECRET
```

No hardcodear `DB_PASSWORD`, `JWT_SECRET` ni contenido de certificados en el codigo.

## Deploy en Railway

Boton:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template?template=https://github.com/REEMPLAZAR_USUARIO_Y_REPOSITORIO)

TODO antes de usar el boton: reemplazar `REEMPLAZAR_USUARIO_Y_REPOSITORIO` por `USUARIO/REPOSITORIO`.

Alternativa si el boton no funciona: hacer deploy manual desde Railway Dashboard.

### A. Deploy desde GitHub

1. Subir el proyecto a GitHub.
2. Entrar a Railway.
3. Crear `New Project`.
4. Elegir `Deploy from GitHub repo`.
5. Seleccionar el repositorio.
6. Esperar el build.
7. Ir a `Variables`.
8. Cargar las variables de entorno.
9. Generar dominio publico en `Settings -> Networking`.
10. Probar la URL publica.

### B. Variables a configurar en Railway

En Railway -> Service -> Variables agregar:

```env
PORT=4000
NODE_ENV=production
DB_HOST=bookonline00-114-pmccole14-ecdc.d.aivencloud.com
DB_PORT=21861
DB_USER=avnadmin
DB_PASSWORD=CONTRASENA_REAL_DE_AIVEN
DB_NAME=biblioteca_digital
DB_SSL_CA_CONTENT=CONTENIDO_COMPLETO_DEL_CA_PEM
JWT_SECRET=CLAVE_SECRETA_LARGA
```

Railway tambien define `PORT` automaticamente. Si Railway ya define `PORT`, no hace falta cargarlo manualmente.

Nunca subir `DB_PASSWORD` al codigo. Nunca subir `.env`.

### C. Como cargar DB_SSL_CA_CONTENT

1. Abrir `certs/ca.pem`.
2. Copiar todo el contenido, incluyendo:

```text
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
```

3. Pegar ese contenido completo en `DB_SSL_CA_CONTENT`.

Si Railway no conserva saltos de linea, se puede pegar igual o reemplazar los saltos por `\n`; `config/db.js` soporta ambas formas.

### D. Comando de inicio

Railway debe usar:

```bash
npm start
```

Si Railway no detecta el comando, configurarlo en `Settings -> Deploy -> Start Command` con `npm start`.

### E. Probar deploy

Una vez desplegado, probar:

```text
https://URL-DE-RAILWAY/api/status
```

Debe devolver:

```json
{
  "status": "ok"
}
```

Luego probar:

```text
https://URL-DE-RAILWAY/api/health/db
```

Debe devolver:

```json
{
  "ok": true,
  "database": "biblioteca_digital"
}
```

### F. Probar la web

Entrar a:

```text
https://URL-DE-RAILWAY/
```

Verificar:

- catalogo de libros;
- login;
- registro;
- rutas de usuario;
- rutas de administrador;
- compras/alquileres si estan implementados.

`railway.json` ya deja configurado:

- Builder: `NIXPACKS`.
- Start command: `npm start`.
- Healthcheck: `/api/status`.
- Restart policy: `ON_FAILURE`.

## Base de datos

Archivos principales:

- `bd/schema_reparado.sql`: crea tablas, claves foraneas, indices y restricciones.
- `bd/seed_reparado.sql`: carga datos demo con hashes bcrypt.
- `bd/queries_test.sql`: consultas de verificacion.
- `bd/README_BD.md`: instrucciones especificas de base.

Credenciales demo del seed:

- `admin@example.com` / `admin1234`
- `valeria@example.com` / `pass1234`
- `santiago@example.com` / `user123`

Son datos de prueba. Cambiarlos o eliminarlos antes de produccion.

## Seguridad

- `.env` esta ignorado por Git.
- El backend no imprime `DB_PASSWORD`, `JWT_SECRET` ni el contenido del certificado.
- El frontend usa rutas relativas como `/api/books`.
- Las consultas del backend usan parametros `?`.
- Las passwords nuevas se hashean con `bcryptjs`.
- JWT no tiene secreto por defecto: si falta `JWT_SECRET`, las rutas de auth devuelven error claro.
