"""Cria dados de teste na base de dados: utilizadores, salas, material e horários.
Correr uma vez: python -m app.criar_dados"""
from sqlalchemy import text

from app.database import engine
from app.services.seguranca import gerar_hash

UTILIZADORES = [
    ("Ana Estudante", "ana@bookit.pt", "utilizador"),
    ("Gil Gestor", "gestor@bookit.pt", "gestor"),
    ("Alice Admin", "admin@bookit.pt", "administrador"),
]

# (nome, edifício, capacidade, equipamentos, abertura, fecho) - as mesmas salas da IA
SALAS = [
    ("Sala 1.01", "A", 8, ["projetor", "quadro"], "08:00", "20:00"),
    ("Sala 1.02", "A", 30, ["projetor"], "08:00", "20:00"),
    ("Sala 2.05", "B", 6, ["quadro"], "09:00", "18:00"),
    ("Sala 0.10", "Biblioteca", 10, ["projetor", "videoconferência"], "08:00", "22:00"),
]

# Material que os professores requisitam
MATERIAL = ["Cabo HDMI 1", "Cabo HDMI 2", "Projetor portátil", "Portátil de empréstimo"]


def main():
    with engine.begin() as bd:  # begin = tudo numa transação
        for nome, email, perfil in UTILIZADORES:
            bd.execute(text("""
                INSERT INTO utilizadores (nome, email, password_hash, perfil)
                VALUES (:nome, :email, :hash, :perfil)
                ON CONFLICT (email) DO NOTHING
            """), {"nome": nome, "email": email, "hash": gerar_hash("bookit123"),
                   "perfil": perfil})

        for nome, edificio, capacidade, equipamentos, abertura, fecho in SALAS:
            recurso_id = bd.execute(text("""
                INSERT INTO recursos (tipo_id, nome, localizacao, capacidade)
                VALUES ((SELECT id FROM tipos_recurso WHERE nome = 'sala'),
                        :nome, :edificio, :capacidade)
                ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome
                RETURNING id
            """), {"nome": nome, "edificio": edificio, "capacidade": capacidade}).scalar()

            for equipamento in equipamentos:
                bd.execute(text("""
                    INSERT INTO recurso_equipamento (recurso_id, equipamento_id)
                    SELECT :rid, id FROM equipamentos WHERE nome = :eq
                    ON CONFLICT DO NOTHING
                """), {"rid": recurso_id, "eq": equipamento})

            for dia in range(1, 6):  # segunda (1) a sexta (5)
                bd.execute(text("""
                    INSERT INTO horario_funcionamento (recurso_id, dia_semana, abertura, fecho)
                    VALUES (:rid, :dia, :abre, :fecha)
                    ON CONFLICT (recurso_id, dia_semana) DO NOTHING
                """), {"rid": recurso_id, "dia": dia, "abre": abertura, "fecha": fecho})

        for nome in MATERIAL:
            recurso_id = bd.execute(text("""
                INSERT INTO recursos (tipo_id, nome, localizacao, capacidade)
                VALUES ((SELECT id FROM tipos_recurso WHERE nome = 'equipamento'),
                        :nome, 'Receção', 1)
                ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome
                RETURNING id
            """), {"nome": nome}).scalar()
            for dia in range(1, 6):
                bd.execute(text("""
                    INSERT INTO horario_funcionamento (recurso_id, dia_semana, abertura, fecho)
                    VALUES (:rid, :dia, '08:00', '20:00')
                    ON CONFLICT (recurso_id, dia_semana) DO NOTHING
                """), {"rid": recurso_id, "dia": dia})

    print("Dados de teste criados. Password de todos: bookit123")


if __name__ == "__main__":
    main()