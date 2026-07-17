# Biblioteca Digital - Base de Datos

## Importacion

Estos scripts no ejecutan `CREATE DATABASE` ni `USE`.
La base debe estar seleccionada antes de importarlos, usando el nombre real configurado en `DB_NAME`.
Esto evita errores en bases administradas como Aiven o Railway, donde la base ya existe.

Orden correcto:

1. `schema_final.sql`
2. `seed_final.sql`
3. `queries_test.sql`

Ejemplo con cliente MySQL/MariaDB:

```bash
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" < bd/schema_final.sql
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" < bd/seed_final.sql
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" < bd/queries_test.sql
```

## Variables del backend

El backend usa `mysql2/promise` y no define valores locales por defecto.
Configurar siempre:

```env
DB_HOST=HOST_DE_MYSQL
DB_PORT=3306
DB_USER=USUARIO
DB_PASSWORD=PASSWORD
DB_NAME=NOMBRE_DE_BASE_EXISTENTE
DB_SSL_CA=./certs/ca.pem
JWT_SECRET=CAMBIAR_EN_PRODUCCION
```

En Railway se puede usar `DB_SSL_CA_CONTENT` con el contenido completo del certificado CA en lugar de `DB_SSL_CA`.

## Datos de prueba

`seed_final.sql` carga roles, usuarios, autores, editoriales, categorias, libros, ejemplares, ventas, pagos, prestamos, movimientos de stock, reservas, carritos, resenas y notificaciones.

Los usuarios del seed usan hashes bcrypt, no contrasenas en texto plano. Credenciales demo documentadas:

- `admin@example.com` / `admin1234`
- `valeria@example.com` / `pass1234`
- `santiago@example.com` / `user123`

No usar estas credenciales en produccion.
