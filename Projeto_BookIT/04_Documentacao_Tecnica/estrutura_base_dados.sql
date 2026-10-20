-- BookIT - estrutura da base de dados (rascunho da 1.ª entrega)
-- PostgreSQL. A validar e ajustar durante a implementação.

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE perfil_utilizador AS ENUM ('utilizador', 'gestor', 'admin');

CREATE TABLE utilizador (
    id             BIGSERIAL PRIMARY KEY,
    nome           TEXT NOT NULL,
    email          TEXT NOT NULL UNIQUE,
    password_hash  TEXT NOT NULL,
    perfil         perfil_utilizador NOT NULL DEFAULT 'utilizador'
);

CREATE TABLE recurso (
    id            BIGSERIAL PRIMARY KEY,
    nome          TEXT NOT NULL,
    tipo          TEXT NOT NULL CHECK (tipo IN ('sala', 'equipamento', 'lugar')),
    capacidade    INTEGER NOT NULL CHECK (capacidade > 0),
    localizacao   TEXT,
    hora_abertura TIME NOT NULL DEFAULT '08:00',
    hora_fecho    TIME NOT NULL DEFAULT '22:00',
    estado        TEXT NOT NULL DEFAULT 'ativo' CHECK (estado IN ('ativo', 'indisponivel'))
);

CREATE TABLE equipamento (
    id    BIGSERIAL PRIMARY KEY,
    nome  TEXT NOT NULL UNIQUE
);

CREATE TABLE recurso_equipamento (
    recurso_id      BIGINT NOT NULL REFERENCES recurso(id) ON DELETE CASCADE,
    equipamento_id  BIGINT NOT NULL REFERENCES equipamento(id),
    PRIMARY KEY (recurso_id, equipamento_id)
);

CREATE TABLE reserva (
    id                  BIGSERIAL PRIMARY KEY,
    utilizador_id       BIGINT NOT NULL REFERENCES utilizador(id),
    recurso_id          BIGINT NOT NULL REFERENCES recurso(id),
    inicio              TIMESTAMPTZ NOT NULL,
    fim                 TIMESTAMPTZ NOT NULL,
    n_pessoas           INTEGER NOT NULL CHECK (n_pessoas > 0),
    estado              TEXT NOT NULL DEFAULT 'confirmada'
                        CHECK (estado IN ('confirmada', 'cancelada', 'reatribuida')),
    chave_idempotencia  TEXT NOT NULL UNIQUE,
    criado_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (fim > inicio),
    -- impede duas reservas confirmadas sobrepostas no mesmo recurso
    EXCLUDE USING gist (recurso_id WITH =, tstzrange(inicio, fim) WITH &&)
        WHERE (estado = 'confirmada')
);

CREATE INDEX idx_reserva_recurso_inicio ON reserva (recurso_id, inicio);
CREATE INDEX idx_reserva_utilizador ON reserva (utilizador_id);
