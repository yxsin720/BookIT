from pydantic import BaseModel


class PedidoRecomendacao(BaseModel):
    """O que a tela Nova reserva envia."""
    tipo: str
    n_pessoas: int
    duracao_min: int
    data_inicio: str
    data_fim: str
    periodo: str = "qualquer"
    edificio: str = ""
    equipamentos: list[str] = []
    n_sessoes: int = 1


class NovaReserva(BaseModel):
    """A opção que o utilizador escolheu na tela Opções recomendadas."""
    recurso_id: int
    inicio: str  # hora de Lisboa, ex.: "2026-11-04T14:00:00"
    fim: str
    n_pessoas: int
    origem: str = "ia"  # "ia" ou "primeiro_livre"