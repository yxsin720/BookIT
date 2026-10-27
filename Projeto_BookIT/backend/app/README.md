# app

A aplicação BookIT — a **API de reservas**. É aqui que vive o código que corre
dentro do contentor `api`.

Organizada em **MVC**. Como este serviço devolve JSON (e não HTML), as "views"
são os contratos de entrada/saída (Pydantic), não templates.

## MVC neste projeto

| Camada MVC       | Pasta       | O que faz                                                      |
|------------------|-------------|----------------------------------------------------------------|
| **Model**        | `models/`   | Tabelas e relações (SQLAlchemy). Espelham o `db/BookIT.sql`.   |
| **View**         | `schemas/`  | Contrato de entrada/saída (Pydantic). É o que o cliente vê.    |
| **Controller**   | `routers/`  | Rotas HTTP: recebe, valida, delega e responde.                 |
| (lógica)         | `services/` | Regras de negócio — o "como". Não é camada MVC clássica;      |
|                  |             | existe para os routers ficarem finos.                          |

## Estrutura

    app/
    ├── main.py        # cria a app FastAPI (o "app" de app.main:app)
    ├── config.py      # lê as variáveis de ambiente
    ├── database.py    # engine e sessões do SQLAlchemy
    ├── models/        # M — tabelas e relações
    ├── schemas/       # V — Pydantic (entrada/saída)
    ├── routers/       # C — endpoints
    └── services/      # lógica de negócio

## O caminho de um pedido

    Cliente → Nginx → router (C) → valida com schema (V) → service
                                                            ├→ model (M) → PostgreSQL
                                                            └→ cliente do serviço de IA

1. O **router** recebe o pedido; o FastAPI valida-o contra o schema.
2. Chama o **service** com dados já validados — nunca com o JSON cru.
3. O **service** fala com a base de dados (models) e/ou com o serviço de IA.
4. O router devolve o schema de resposta.

## A regra central

**A IA sugere, a base de dados confirma.** O service nunca assume que a
gravação vai correr bem: tenta gravar numa transação e trata a recusa
(sobreposição, recurso indisponível, capacidade excedida), pedindo depois à IA
que recalcule.

## Estado atual

Existem apenas as pastas vazias (marcadas com `.gitkeep`). Falta criar:

- `main.py` com o objeto `app` — o Dockerfile arranca `uvicorn app.main:app`,
  por isso sem este ficheiro o contentor reinicia em ciclo;
- `config.py` e `database.py`;
- um `__init__.py` em cada subpasta, para serem pacotes importáveis.

## Correr em desenvolvimento

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

# a app é "main:app" quando o CWD é a própria pasta app/
cd app
..\..\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

Dentro do Docker o comando é `uvicorn app.main:app` (CWD = raiz do backend).
Os serviços `db` e `redis` são publicados no host (5432 e 6379), por isso a
app corre bem fora do Docker desde que o `DATABASE_URL` aponte para `localhost`.

## Endpoints previstos

| Método | Rota                              | Descrição                          | Perfil        |
|--------|-----------------------------------|------------------------------------|---------------|
| POST   | `/auth/login`                     | Autenticação (JWT)                 | todos         |
| GET    | `/recursos`                       | Pesquisar disponibilidade          | utilizador    |
| POST   | `/recomendacoes`                  | Pedir as k melhores opções (IA)    | utilizador    |
| POST   | `/reservas`                       | Criar reserva (transação)          | utilizador    |
| DELETE | `/reservas/{id}`                  | Cancelar reserva                   | utilizador    |
| GET    | `/reservas`                       | Reservas do próprio utilizador     | utilizador    |
| POST   | `/recursos/{id}/indisponibilidade`| Marcar avaria/manutenção           | gestor        |
| POST   | `/reatribuicoes`                  | Reatribuir reservas afetadas (IA)  | gestor        |
| GET    | `/reservas/todas`                 | Consultar todas as reservas        | administrador |
| CRUD   | `/utilizadores`                   | Gerir utilizadores e permissões    | administrador |
| GET    | `/health`                         | Liveness/readiness                 | infra         |

## Perfis

- **utilizador** — reserva e cancela, consulta as suas reservas.
- **gestor** — gere recursos e equipamentos, marca indisponibilidades e
  aciona a reatribuição.
- **administrador** — gere utilizadores e permissões, vê todas as reservas.

## Configuração

Lê variáveis de ambiente (ver `../.env.exemplo`). Dentro do Docker os
hostnames são `db` e `redis`; fora do Docker, `localhost`.
