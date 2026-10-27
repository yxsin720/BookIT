-- =====================================================
-- BookIT · Esquema PostgreSQL
-- Reservas de salas/equipamentos/lugares com recomendação por IA (CSP)
-- =====================================================

-- Necessário para a exclusão de reservas sobrepostas (igualdade + intervalo)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ---------- Tipos ----------
CREATE TYPE perfil_utilizador AS ENUM ('utilizador', 'gestor', 'administrador');
CREATE TYPE estado_reserva    AS ENUM ('confirmada', 'cancelada', 'reatribuida');
CREATE TYPE origem_reserva    AS ENUM ('manual', 'ia', 'primeiro_livre', 'reatribuicao');

-- ---------- Utilizadores ----------
CREATE TABLE utilizadores (
    id            BIGSERIAL PRIMARY KEY,
    nome          VARCHAR(120) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,           -- bcrypt/argon2, nunca texto simples
    perfil        perfil_utilizador NOT NULL DEFAULT 'utilizador',
    ativo         BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Preferências usadas pela IA (parte "tenta melhorar")
CREATE TABLE preferencias_utilizador (
    utilizador_id      BIGINT PRIMARY KEY REFERENCES utilizadores(id) ON DELETE CASCADE,
    local_preferido    VARCHAR(120),
    hora_preferida_ini TIME,
    hora_preferida_fim TIME,
    CHECK (hora_preferida_ini IS NULL OR hora_preferida_fim IS NULL
           OR hora_preferida_ini < hora_preferida_fim)
);

-- ---------- Recursos ----------
CREATE TABLE tipos_recurso (
    id   SMALLSERIAL PRIMARY KEY,
    nome VARCHAR(60) NOT NULL UNIQUE       -- sala, equipamento, lugar de estudo
);

CREATE TABLE recursos (
    id          BIGSERIAL PRIMARY KEY,
    tipo_id     SMALLINT     NOT NULL REFERENCES tipos_recurso(id),
    nome        VARCHAR(120) NOT NULL UNIQUE,
    localizacao VARCHAR(120),
    capacidade  INT          NOT NULL DEFAULT 1 CHECK (capacidade > 0),
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE equipamentos (
    id   SMALLSERIAL PRIMARY KEY,
    nome VARCHAR(80) NOT NULL UNIQUE       -- projetor, quadro, videoconferência...
);

CREATE TABLE recurso_equipamento (
    recurso_id     BIGINT   NOT NULL REFERENCES recursos(id)     ON DELETE CASCADE,
    equipamento_id SMALLINT NOT NULL REFERENCES equipamentos(id) ON DELETE CASCADE,
    PRIMARY KEY (recurso_id, equipamento_id)
);

-- Horário de funcionamento (0 = domingo ... 6 = sábado)
CREATE TABLE horario_funcionamento (
    id         BIGSERIAL PRIMARY KEY,
    recurso_id BIGINT   NOT NULL REFERENCES recursos(id) ON DELETE CASCADE,
    dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    abertura   TIME     NOT NULL,
    fecho      TIME     NOT NULL,
    CHECK (abertura < fecho),
    UNIQUE (recurso_id, dia_semana)
);

-- Períodos de indisponibilidade (avarias, manutenção)
CREATE TABLE indisponibilidades (
    id         BIGSERIAL PRIMARY KEY,
    recurso_id BIGINT      NOT NULL REFERENCES recursos(id) ON DELETE CASCADE,
    periodo    TSTZRANGE   NOT NULL,
    motivo     TEXT,
    criado_por BIGINT      NOT NULL REFERENCES utilizadores(id),
    criado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (NOT isempty(periodo))
);

-- ---------- Reservas ----------
CREATE TABLE reservas (
    id            BIGSERIAL PRIMARY KEY,
    utilizador_id BIGINT         NOT NULL REFERENCES utilizadores(id),
    recurso_id    BIGINT         NOT NULL REFERENCES recursos(id),
    periodo       TSTZRANGE      NOT NULL,
    n_pessoas     INT            NOT NULL DEFAULT 1 CHECK (n_pessoas > 0),
    estado        estado_reserva NOT NULL DEFAULT 'confirmada',
    origem        origem_reserva NOT NULL DEFAULT 'manual',
    criado_em     TIMESTAMPTZ    NOT NULL DEFAULT now(),
    cancelado_em  TIMESTAMPTZ,
    CHECK (NOT isempty(periodo)),
    CHECK (NOT lower_inf(periodo) AND NOT upper_inf(periodo)),

    -- Consistência: nunca há duas reservas confirmadas sobrepostas no mesmo recurso.
    -- É a base de dados que garante isto, mesmo com muitos pedidos em simultâneo.
    CONSTRAINT reservas_sem_sobreposicao
        EXCLUDE USING gist (recurso_id WITH =, periodo WITH &&)
        WHERE (estado = 'confirmada')
);

-- Equipamento pedido numa reserva
CREATE TABLE reserva_equipamento (
    reserva_id     BIGINT   NOT NULL REFERENCES reservas(id)     ON DELETE CASCADE,
    equipamento_id SMALLINT NOT NULL REFERENCES equipamentos(id),
    PRIMARY KEY (reserva_id, equipamento_id)
);

-- Histórico de reatribuições após falha de um recurso
CREATE TABLE reatribuicoes (
    id                BIGSERIAL PRIMARY KEY,
    reserva_antiga_id BIGINT      NOT NULL REFERENCES reservas(id),
    reserva_nova_id   BIGINT      REFERENCES reservas(id),
    indisponibilidade_id BIGINT   REFERENCES indisponibilidades(id),
    feita_por         BIGINT      REFERENCES utilizadores(id),
    criado_em         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Registo das recomendações (para medir tempo de resposta e comparar CSP vs primeiro livre)
CREATE TABLE recomendacoes_log (
    id                BIGSERIAL PRIMARY KEY,
    utilizador_id     BIGINT      REFERENCES utilizadores(id),
    metodo            VARCHAR(20) NOT NULL CHECK (metodo IN ('csp', 'primeiro_livre')),
    pedido            JSONB       NOT NULL,   -- pessoas, duração, equipamento...
    n_opcoes          INT         NOT NULL DEFAULT 0,
    tempo_resposta_ms INT,
    reserva_id        BIGINT      REFERENCES reservas(id),  -- reserva escolhida, se houver
    criado_em         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Índices ----------
CREATE INDEX idx_reservas_utilizador  ON reservas (utilizador_id, estado);
CREATE INDEX idx_reservas_recurso     ON reservas USING gist (recurso_id, periodo);
CREATE INDEX idx_indisp_recurso       ON indisponibilidades USING gist (recurso_id, periodo);
CREATE INDEX idx_recursos_tipo        ON recursos (tipo_id) WHERE ativo;
CREATE INDEX idx_reco_log_criado      ON recomendacoes_log (criado_em);

-- ---------- Impedir reservas em períodos indisponíveis ----------
CREATE OR REPLACE FUNCTION fn_validar_reserva() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'confirmada' THEN
        IF NOT EXISTS (SELECT 1 FROM recursos WHERE id = NEW.recurso_id AND ativo) THEN
            RAISE EXCEPTION 'Recurso % inativo', NEW.recurso_id;
        END IF;
        IF EXISTS (SELECT 1 FROM indisponibilidades
                   WHERE recurso_id = NEW.recurso_id AND periodo && NEW.periodo) THEN
            RAISE EXCEPTION 'Recurso % indisponível no período pedido', NEW.recurso_id;
        END IF;
        IF NEW.n_pessoas > (SELECT capacidade FROM recursos WHERE id = NEW.recurso_id) THEN
            RAISE EXCEPTION 'Capacidade do recurso % excedida', NEW.recurso_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_reserva
    BEFORE INSERT OR UPDATE OF recurso_id, periodo, n_pessoas, estado ON reservas
    FOR EACH ROW EXECUTE FUNCTION fn_validar_reserva();

-- ---------- Dados iniciais ----------
INSERT INTO tipos_recurso (nome) VALUES ('sala'), ('equipamento'), ('lugar de estudo');
INSERT INTO equipamentos (nome)  VALUES ('projetor'), ('quadro'), ('videoconferência'), ('computadores');

-- ---------- Exemplo de utilização (a reserva é gravada numa transação) ----------
-- BEGIN;
-- INSERT INTO reservas (utilizador_id, recurso_id, periodo, n_pessoas, origem)
-- VALUES (1, 1, tstzrange('2026-11-03 10:00+00', '2026-11-03 12:00+00', '[)'), 6, 'ia');
-- COMMIT;  -- se a sala já estiver ocupada, a BD recusa e a IA recalcula