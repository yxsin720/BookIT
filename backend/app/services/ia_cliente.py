"""Falar com o serviço de IA, com tolerância a faltas (cenário C2)."""
import httpx

from app.config import IA_URLS


def pedir_ia(caminho, corpo):
    """Tenta cada cópia da IA por ordem (ia-1, ia-2...). Devolve None se nenhuma responder."""
    for url in IA_URLS:
        try:
            resposta = httpx.post(f"{url}{caminho}", json=corpo, timeout=3.0)
            resposta.raise_for_status()
            return resposta.json()
        except httpx.HTTPError:
            continue  # esta cópia falhou ou demorou: tenta a próxima
    return None