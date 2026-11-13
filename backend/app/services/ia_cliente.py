"""Falar com o serviço de IA, com tolerância a faltas (cenário C2)."""
import httpx

from app.config import IA_URLS

# Um só cliente para toda a aplicação: reaproveita as ligações à IA
# em vez de abrir uma nova a cada pedido.
# connect=0.5: se uma cópia estiver desligada, desiste depressa e passa à seguinte
# (no Windows, uma ligação recusada pode demorar ~2 s a falhar).
cliente = httpx.Client(timeout=httpx.Timeout(3.0, connect=0.5))


def pedir_ia(caminho, corpo):
    """Tenta cada cópia da IA por ordem (ia-1, ia-2...). Devolve None se nenhuma responder."""
    for url in IA_URLS:
        try:
            resposta = cliente.post(f"{url}{caminho}", json=corpo)
            resposta.raise_for_status()
            return resposta.json()
        except httpx.HTTPError:
            continue  # esta cópia falhou ou demorou: tenta a próxima
    return None
