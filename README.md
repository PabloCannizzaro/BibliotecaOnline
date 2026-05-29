# Biblioteca Digital

Biblioteca online con frontend HTML/CSS/JS y backend Node.js + Express conectado a MySQL en Aiven mediante SSL.

## Estructura

- `server.js`: servidor Express, frontend y endpoints de diagnostico.
- `config/db.js`: pool MySQL con `mysql2/promise`, variables de entorno y SSL.
- `routes/`: rutas `/api/auth`, `/api/books`, `/api/user` y `/api/admin`.
- `middlewares/auth.js`: validacion JWT y rol administrador.
- `index.html`, `styles.css`, `script.js`: frontend.
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
DB_SSL_CA=./certs/ca.pem
DB_SSL_CA_CONTENT=
JWT_SECRET=REEMPLAZAR_JWT_SECRET
```

No hardcodear `DB_PASSWORD`, `JWT_SECRET` ni contenido de certificados en el codigo.

## Deploy en Railway

1. Subir el repo a GitHub.
2. Crear un proyecto en Railway.
3. Elegir `Deploy from GitHub repo`.
4. Configurar variables.
5. Deployar.
6. Probar la URL publica.

Variables Railway:

```env
NODE_ENV=production
DB_HOST=bookonline00-114-pmccole14-ecdc.d.aivencloud.com
DB_PORT=21861
DB_USER=avnadmin
DB_PASSWORD=REEMPLAZAR_PASSWORD_REAL
DB_NAME=biblioteca_digital
DB_SSL_CA_CONTENT=CONTENIDO_COMPLETO_DEL_CA_PEM
JWT_SECRET=REEMPLAZAR_SECRET_FUERTE
```

Railway define `PORT` automaticamente. El servidor usa `process.env.PORT || 4000`.

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
