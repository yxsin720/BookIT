from fastapi import APIRouter, Depends

from app.schemas.reservas import PedidoRecomendacao
from app.services.alternativa import primeiro_livre
from app.services.ia_cliente import pedir_ia
from app.services.recursos import carregar_recursos, carregar_reservas
from app.services.sessao import utilizador_atual

router = APIRouter(prefix="/api", tags=["recomendações"])


@router.post("/recomendacoes")
def recomendacoes(pedido: PedidoRecomendacao, utilizador=Depends(utilizador_atual)):
    # 1. Ir buscar à BD tudo o que a IA precisa
    recursos = carregar_recursos()
    reservas = carregar_reservas(pedido.data_inicio, pedido.data_fim)
    corpo = {"pedido": pedido.model_dump(), "recursos": recursos, "reservas": reservas}

    # 2. Pedir à IA (tenta ia-1, depois ia-2)
    resposta = pedir_ia("/recomendar", corpo)
    if resposta is not None:
        return {"origem": "ia", "instancia_ia": resposta["instancia"],
                "opcoes": resposta["opcoes"]}

    # 3. Nenhuma IA respondeu: alternativa simples, e o sistema continua a funcionar
    return {"origem": "primeiro_livre",
            "opcoes": primeiro_livre(pedido.model_dump(), recursos, reservas)}