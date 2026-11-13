#!/bin/sh
# Arranque da réplica: na primeira vez clona o primário; nas seguintes
# apenas arranca o Postgres em modo "hot standby".
set -e

: "${PRIMARY_HOST:=db}"
: "${REPLICADOR_USER:=replicador}"

export PGPASSWORD="$REPLICADOR_PASSWORD"

if [ ! -s "$PGDATA/PG_VERSION" ]; then
    echo "[replica] PGDATA vazio: a clonar o primário '$PRIMARY_HOST'..."

    mkdir -p "$PGDATA"
    find "$PGDATA" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
    chown postgres:postgres "$PGDATA"
    chmod 700 "$PGDATA"

    # Espera que o primário aceite ligações antes de copiar.
    until pg_isready -h "$PRIMARY_HOST" -p 5432 -q; do
        echo "[replica] à espera do primário..."
        sleep 2
    done

    su-exec postgres pg_basebackup \
        -h "$PRIMARY_HOST" -p 5432 -U "$REPLICADOR_USER" \
        -D "$PGDATA" -Fp -Xs -P -w

    # Ligação ao primário (com password, para reconectar sozinha).
    su-exec postgres sh -c "cat >> '$PGDATA/postgresql.auto.conf' <<EOF
primary_conninfo = 'host=$PRIMARY_HOST port=5432 user=$REPLICADOR_USER password=$REPLICADOR_PASSWORD'
EOF"

    # Marca este nó como standby: arranca em recuperação contínua.
    su-exec postgres touch "$PGDATA/standby.signal"

    echo "[replica] clonagem concluída."
fi

exec /usr/local/bin/docker-entrypoint.sh postgres
