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