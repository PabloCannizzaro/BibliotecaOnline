# Deploy en Railway

Guia para desplegar Biblioteca Digital en Railway con Node.js, Express y MySQL en Aiven.

## Pasos

1. Confirmar que `.env` no este versionado.
2. Subir el repositorio a GitHub.
3. Crear `New Project` en Railway.
4. Elegir `Deploy from GitHub repo`.
5. Seleccionar el repositorio.
6. Esperar el build de Nixpacks.
7. Cargar variables de entorno.
8. Generar dominio publico.
9. Probar endpoints y frontend.

`railway.json` define:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Variables Railway

Configurar en `Service -> Variables`:

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

Railway define `PORT` automaticamente. El servidor usa `process.env.PORT || 4000`, por lo que no hay que hardcodear puertos.

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

Revisar `DB_NAME` y confirmar que `schema_reparado.sql` fue importado en Aiven.

### SSL error

Revisar `DB_SSL_CA_CONTENT`. Debe contener todo el certificado CA. Si se uso `\n`, confirmar que no falten caracteres.

### Cannot find module

Ejecutar `npm install` localmente y confirmar que toda dependencia importada este en `package.json`.

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
- La base tiene `schema_reparado.sql` y, si corresponde, `seed_reparado.sql`.
