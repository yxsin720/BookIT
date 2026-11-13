#!/bin/sh
# Corre apenas na primeira inicialização do volume do primário.
# Cria o utilizador dedicado à replicação, com a password vinda do ambiente.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL
CREATE ROLE replicador WITH REPLICATION LOGIN PASSWORD '$REPLICADOR_PASSWORD';
SQL
