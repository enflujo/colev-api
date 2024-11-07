#!/bin/bash
# restaurarRespaldo.sh

# Cargar variables de entorno
source .env 

# Ruta del archivo de respaldo
RUTA="/data/respaldo/respaldo_datos_colev.dump"

# Restaurar MongoDB
/usr/bin/docker exec -i colev-api-bd mongorestore \
  --authenticationDatabase admin \
  --archive=$RUTA \
  --username $BD_USUARIO \
  --password $BD_CLAVE \
  --nsInclude="colev.*"
