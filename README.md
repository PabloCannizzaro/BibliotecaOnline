# Biblioteca Digital

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
