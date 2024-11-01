#!/bin/bash
# crearRespaldo.sh

# Install Environment file
source .env 

# Backup MongoDB
/usr/bin/docker exec colev-api-bd mongodump \
  --authenticationDatabase admin \
  --archive \
  --username $BD_USUARIO \
  --password $BD_CLAVE \
  --db colev \
  --archive \
  > ./respaldo/respaldo_datos_colev.dump
