#!/bin/sh
echo "Waiting for the database to be available..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "Database is up - running migrations"
# npx prisma migrate reset
npx prisma generate --schema=./prisma/schema.prisma
npx prisma migrate dev --name migration
echo "Migrations are done - starting the server"
exec node src/app.js
