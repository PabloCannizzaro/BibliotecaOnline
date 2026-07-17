# Biblioteca Digital - Base de Datos

## Importacion

1. Ejecutar `schema_reparado.sql` en MySQL/Aiven para crear tablas, claves e indices.
2. Ejecutar `seed_reparado.sql` despues del esquema para cargar datos de prueba.
3. Ejecutar `queries_test.sql` para validar consultas principales.

Si la base ya existe antes de estos cambios, ejecutar una sola vez:

```sql
bd/migration_notifications_and_card_payments.sql
```

La migracion agrega metadatos no sensibles de pago en `sales` y la tabla `notifications`.
No se almacena numero completo de tarjeta ni CVV.

## Orden correcto

1. `schema_reparado.sql`
2. `seed_reparado.sql`
3. `queries_test.sql`

Para bases existentes: ejecutar primero `migration_notifications_and_card_payments.sql` y luego desplegar el backend actualizado.

## Variables del backend

El backend no usa valores locales por defecto para la base. Configurar siempre:

```env
DB_HOST=bookonline00-114-pmccole14-ecdc.d.aivencloud.com
DB_PORT=21861
DB_USER=avnadmin
DB_PASSWORD=REEMPLAZAR_PASSWORD
DB_NAME=biblioteca_digital
DB_SSL_CA=./certs/ca.pem
JWT_SECRET=REEMPLAZAR_JWT_SECRET
```

En Railway usar `DB_SSL_CA_CONTENT` con el contenido completo del certificado CA en lugar de `DB_SSL_CA`.

## Datos de prueba

Los usuarios del seed usan hashes bcrypt, no contrasenas en texto plano. Credenciales demo:

- `admin@example.com` / `admin1234`
- `valeria@example.com` / `pass1234`
- `santiago@example.com` / `user123`

No usar estas credenciales en produccion.
