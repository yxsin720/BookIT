"""Dados de exemplo para testar o motor de IA sem precisar da base de dados."""

# Os recursos (salas) que existem
RECURSOS = [
    {"id": 1, "nome": "Sala 1.01", "tipo": "sala", "capacidade": 8,
     "edificio": "A", "equipamentos": ["projetor", "quadro"],
     "abertura": "08:00", "fecho": "20:00", "ativo": True},
    {"id": 2, "nome": "Sala 1.02", "tipo": "sala", "capacidade": 30,
     "edificio": "A", "equipamentos": ["projetor"],
     "abertura": "08:00", "fecho": "20:00", "ativo": True},
    {"id": 3, "nome": "Sala 2.05", "tipo": "sala", "capacidade": 6,
     "edificio": "B", "equipamentos": ["quadro"],
     "abertura": "09:00", "fecho": "18:00", "ativo": True},
    {"id": 4, "nome": "Sala 0.10", "tipo": "sala", "capacidade": 10,
     "edificio": "Biblioteca", "equipamentos": ["projetor", "videoconferência"],
     "abertura": "08:00", "fecho": "22:00", "ativo": True},
    {"id": 5, "nome": "Sala 3.01", "tipo": "sala", "capacidade": 12,
     "edificio": "B", "equipamentos": ["projetor"],
     "abertura": "08:00", "fecho": "20:00", "ativo": False},  # avariada
]

# As reservas que já estão confirmadas
RESERVAS = [
    {"recurso_id": 1, "inicio": "2026-11-03T14:00", "fim": "2026-11-03T16:00"},
    {"recurso_id": 4, "inicio": "2026-11-03T10:00", "fim": "2026-11-03T12:00"},
]

# O pedido, no formato que o frontend do Pascoal envia
PEDIDO = {
    "tipo": "sala",
    "n_pessoas": 6,
    "duracao_min": 120,
    "data_inicio": "2026-11-03",
    "data_fim": "2026-11-05",
    "periodo": "tarde",
    "edificio": "A",
    "equipamentos": ["projetor"],
    "n_sessoes": 1,
}