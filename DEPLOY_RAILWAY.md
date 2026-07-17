# Deploy en Railway

Guia para desplegar Biblioteca Digital en Railway con Node.js, Express y MySQL en Aiven.

## Boton de deploy

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template?template=https://github.com/PabloCannizzaro/BibliotecaOnline)

TODO antes de publicar el README: reemplazar `REEMPLAZAR_USUARIO_Y_REPOSITORIO` por `USUARIO/REPOSITORIO`.

Alternativa si el boton no funciona: hacer deploy manual desde Railway Dashboard.

## Requisitos previos

- Cuenta en Railway.
- Proyecto subido a GitHub.
- Base MySQL creada en Aiven.
- Schema importado: `bd/schema_final.sql`.
- Seed importado si queres datos demo: `bd/seed_final.sql`.
- Certificado CA de Aiven disponible en `certs/ca.pem`.
- Password real de Aiven y un `JWT_SECRET` fuerte.

## Pasos

1. Confirmar que `.env` no este versionado.
2. Subir el repositorio a GitHub.
3. Entrar a Railway.
4. Crear `New Project`.
5. Elegir `Deploy from GitHub repo`.
6. Seleccionar el repositorio.
7. Esperar el build de Nixpacks.
8. Cargar variables de entorno.
9. Generar dominio publico.
10. Probar endpoints y frontend.

`railway.json` define:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/status",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Variables Railway

Configurar en `Service -> Variables`:

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

Railway define `PORT` automaticamente. Si Railway ya define `PORT`, no hace falta cargarlo manualmente. El servidor usa `process.env.PORT || 4000`, por lo que no hay que hardcodear puertos.

## Copiar el CA de Aiven

1. Abrir `certs/ca.pem`.
2. Copiar todo el contenido, incluyendo:

```text
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
```

3. Pegar ese contenido completo en `DB_SSL_CA_CONTENT`.

Si Railway no conserva saltos de linea, pegarlo con `\n`. El backend convierte esos `\n` a saltos reales antes de crear el pool MySQL.

En local se puede usar:

```env
DB_SSL_CA=./certs/ca.pem
```

En Railway, si existe `DB_SSL_CA_CONTENT`, no hace falta `DB_SSL_CA`.

## Probar

Despues del deploy:

```text
https://TU-DOMINIO.up.railway.app/api/status
https://TU-DOMINIO.up.railway.app/api/health/env
https://TU-DOMINIO.up.railway.app/api/health/db
https://TU-DOMINIO.up.railway.app/api/books
https://TU-DOMINIO.up.railway.app/
```

Respuestas esperadas:

```json
{
  "status": "ok",
  "message": "API de Biblioteca Digital activa"
}
```

```json
{
  "ok": true,
  "database": "biblioteca_digital"
}
```

## Revisar logs

En Railway abrir `Deployments` o `Logs`. El servidor solo imprime indicadores booleanos de configuracion y no imprime `DB_PASSWORD`, `JWT_SECRET` ni certificado.

## Errores comunes

### Application failed to respond

Revisar que Railway use `npm start` y que el servidor escuche `process.env.PORT`.

### Access denied

Revisar `DB_USER` y `DB_PASSWORD`. Confirmar que la password real no tenga espacios extra.

### Unknown database

Revisar `DB_NAME` y confirmar que `schema_final.sql` fue importado en la base indicada por esa variable.

### SSL error

Revisar `DB_SSL_CA_CONTENT`. Debe contener todo el certificado CA. Si se uso `\n`, confirmar que no falten caracteres.

### Cannot find module

Ejecutar `npm install` localmente y confirmar que toda dependencia importada este en `package.json`.

### npm start not found

Revisar que `package.json` tenga:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

### La web carga pero no aparecen libros

Probar `/api/books` y `/api/health/db`. Si `/api/health/db` falla, revisar variables de Aiven y SSL.

### Login o registro falla

Revisar `JWT_SECRET` y que existan tablas `users` y `roles`. El seed usa hashes bcrypt para los usuarios demo.

## Checklist antes de deploy

- `npm install` funciona.
- `npm start` funciona.
- `.env` no esta versionado.
- `DB_PASSWORD` y `JWT_SECRET` no estan en el codigo.
- `DB_SSL_CA_CONTENT` esta configurado en Railway.
- La base tiene `schema_final.sql` y, si corresponde, `seed_final.sql`.
