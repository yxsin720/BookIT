"""Ler da base de dados as salas e as reservas, no formato que a IA espera."""
from app.database import consultar


def carregar_recursos():
    return consultar("""
        SELECT r.id,
               r.nome,
               CASE t.nome WHEN 'lugar de estudo' THEN 'lugar' ELSE t.nome END AS tipo,
               r.capacidade,
               COALESCE(r.localizacao, '') AS edificio,
               COALESCE(array_agg(DISTINCT e.nome) FILTER (WHERE e.nome IS NOT NULL),
                        '{}') AS equipamentos,
               to_char(COALESCE(min(h.abertura), '08:00'), 'HH24:MI') AS abertura,
               to_char(COALESCE(max(h.fecho), '22:00'), 'HH24:MI') AS fecho,
               r.ativo
        FROM recursos r
        JOIN tipos_recurso t ON t.id = r.tipo_id
        LEFT JOIN recurso_equipamento re ON re.recurso_id = r.id
        LEFT JOIN equipamentos e ON e.id = re.equipamento_id
        LEFT JOIN horario_funcionamento h ON h.recurso_id = r.id
        GROUP BY r.id, t.nome
        ORDER BY r.id
    """)


def carregar_reservas(data_inicio, data_fim):
    """Reservas confirmadas entre as duas datas, com horas de Lisboa e sem fuso."""
    return consultar("""
        SELECT id, recurso_id, n_pessoas,
               to_char(lower(periodo) AT TIME ZONE 'Europe/Lisbon', 'YYYY-MM-DD"T"HH24:MI') AS inicio,
               to_char(upper(periodo) AT TIME ZONE 'Europe/Lisbon', 'YYYY-MM-DD"T"HH24:MI') AS fim
        FROM reservas
        WHERE estado = 'confirmada'
          AND periodo && tstzrange(CAST(:ini AS date)::timestamp AT TIME ZONE 'Europe/Lisbon',
                                   (CAST(:fim AS date) + 1)::timestamp AT TIME ZONE 'Europe/Lisbon')
    """, ini=data_inicio, fim=data_fim)
