"""Lê as configurações das variáveis de ambiente (ficheiro .env)."""
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]
JWT_SECRET = os.environ.get("JWT_SECRET", "mudar-isto-em-producao")
IA_URLS = os.environ.get("IA_URLS", "http://127.0.0.1:8001").split(",")
INSTANCIA = os.environ.get("INSTANCIA", "api-local")