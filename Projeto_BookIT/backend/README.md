# Backend — BookIT

Backend do **BookIT**, sistema distribuído de reservas (salas, equipamentos e
lugares de estudo) com recomendação inteligente. Projeto de Desenvolvimento de
Software — Grupo 6.

Este documento explica o que é o backend, como está organizado e **por que
ordem** construir as peças.

## O problema que o backend resolve

Reservar um recurso numa universidade obriga a tentar combinações de recurso,
dia e hora até encontrar uma que sirva. As plataformas habituais mostram só o
que está livre. Quando algo avaria, as reservas afetadas reorganizam-se à mão.

O backend responde a isto:

1. O utilizador pede (ex.: sala para 6 pessoas, 2 horas, com projetor).
2. A IA devolve as **3 a 5 melhores** combinações de recurso e horário.
3. O utilizador escolhe e confirma.
4. A base de dados grava numa transação e **recusa** se houver sobreposição —
   e a IA recalcula.

## Arquitetura

    Cliente
       │
       ▼
    Nginx (balanceador)          ← infraestrutura/nginx/default.conf
       │
       ├──────────────► API de reservas  ×2+   ← app/   (stateless)
       │                     │
       │                     ├──────► Serviço de IA  ×2   ← ia/  (stateless)
       │                     │
       │                     └──────► PostgreSQL (1 primário + 1 réplica)
       │
       └──────────────► Redis (cache / estado volátil)

Tudo em contentores Docker, geridos por Docker Compose.

Ponto essencial: as instâncias da API e da IA **não guardam estado**. Por isso
qualquer uma pode atender qualquer pedido, e a consistência não depende de
qual delas respondeu.

## Mapa das pastas

| Pasta                    | O que é                                                        |
|--------------------------|----------------------------------------------------------------|
| `app/`                   | A aplicação: API de reservas, em MVC. Ver `app/README.md`       |
| `ia/`                    | O motor CSP (serviço separado, stateless) — ainda por criar      |
| `db/`                    | Schema PostgreSQL (`BookIT.sql`) e documentação. Ver `db/README.md` |
| `infraestrutura/`        | Docker Compose e Nginx. Ver `infraestrutura/README.md`           |
| `requirements.txt`       | Dependências Python                                              |
| `Dockerfile`             | Imagem da API (`uvicorn app.main:app`)                           |
| `.env.exemplo`           | Modelo das variáveis de ambiente                                 |

## As garantias do sistema

O backend tem de garantir três coisas, e a divisão de responsabilidades é o
que as torna possíveis:

| Garantia                              | Onde é assegurada                     |
|---------------------------------------|---------------------------------------|
| Não há reservas sobrepostas           | Base de dados (constraint de exclusão)|
| Não se perdem reservas confirmadas    | Base de dados (transação)             |
| Não se duplicam reservas              | Base de dados (idempotência) *a fazer*|

**A IA só sugere; a base de dados confirma.** Nenhuma sugestão da IA é uma
reserva até a BD aceitar a gravação. Detalhes das três defesas em
`db/README.md`.

## Correr

### Só a infraestrutura (db + redis + nginx)

```powershell
cd backend/infraestrutura/docker
docker compose -f dockercompose.yml up -d
docker compose -f dockercompose.yml ps
```

### A app na tua máquina (fora do Docker)

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

Copy-Item .env.exemplo .env      # e depois ajusta os valores

cd app
..\..\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

O `.env` para correr na máquina usa `localhost` nos hostnames. Dentro do
Docker, o compose injeta `db` e `redis`.

### Tudo junto em Docker

```powershell
cd backend
docker build -t bookit-api:dev .
cd infraestrutura/docker
docker compose -f dockercompose.yml up -d --build
# http://localhost:8080
```

## Passo a passo do desenvolvimento

Ordem sugerida. Cada passo tem uma forma de confirmar que ficou bem.

### Fase 0 — Ambiente

1. Instalar Docker Desktop e confirmar que o `py` (Python) existe.
2. `Copy-Item .env.exemplo .env` e ajustar os valores.
3. Subir a infraestrutura e confirmar a saúde:
   ```powershell
   docker exec bookit-db psql -U postgres -d bookit -c "\dt"   # 12 tabelas
   docker exec bookit-redis redis-cli ping                     # PONG
   ```

### Fase 1 — Esqueleto da API

4. `app/main.py` com a app FastAPI, `GET /health` e os routers incluídos.
5. `app/config.py` a ler as variáveis de ambiente.
6. `app/database.py` com a engine e a sessão do SQLAlchemy.
7. `__init__.py` em `app/models`, `app/schemas`, `app/routers`, `app/services`.
8. **Confirmar:** `docker compose up -d --build` → `http://localhost:8080/health`
   devolve **200** (hoje devolve 502, porque falta o passo 4).

### Fase 2 — Modelos e autenticação

9. `app/models/` a espelhar as tabelas do `BookIT.sql`.
10. `app/schemas/` com os modelos Pydantic de entrada e saída.
11. Autenticação JWT (PyJWT) com hashes Argon2 (pwdlib) e TOTP (pyotp).
12. Perfis e permissões: `utilizador`, `gestor`, `administrador`.

### Fase 3 — Reservas (o núcleo)

13. CRUD de reservas, sempre dentro de uma transação.
14. Tratar a **recusa** da base de dados: sobreposição, recurso indisponível,
    capacidade excedida — e pedir recálculo à IA.
15. Endpoints de recursos e de pesquisa de disponibilidade.
16. **Confirmar:** dois `INSERT` concorrentes para o mesmo intervalo — um passa,
    o outro é recusado.

### Fase 4 — Motor de IA

17. Criar o serviço em `ia/` (FastAPI ou função pura), como serviço à parte.
18. Cliente HTTP na API para falar com ele.
19. Endpoint `/recomendacoes` a devolver as k melhores opções (CSP com
    backtracking, forward checking, MRV, AC-3 e branch and bound).
20. Registar em `recomendacoes_log` o método (`csp` ou `primeiro_livre`) e o
    tempo de resposta — é o que permite comparar as duas abordagens.

### Fase 5 — Falhas e escala

21. Marcar indisponibilidades e **reatribuir** só as reservas afetadas.
22. Idempotência das reservas (chave por pedido), para repetições após falha.
23. Configurar a **réplica** do PostgreSQL.
24. Escalar `api` e `ia` para 2 instâncias e passar o nginx a balancear.
25. **Confirmar:** matar uma instância da API e repetir o pedido — o sistema
    continua a responder.

### Fase 6 — Testes

26. Testes de concorrência (reservas simultâneas para o mesmo recurso).
27. Testes dos cinco cenários de falha do modelo de faltas.
28. Comparação CSP vs. primeiro horário livre (usando o `recomendacoes_log`).

## Estado atual

Já existe: schema da base de dados, stack Docker (db, redis, nginx, api) e a
estrutura de pastas da aplicação.

Ainda falta: **todo o código da API** (`app/main.py` e seguintes) e o serviço
de IA (`ia/`). Por isso o contentor `api` reinicia em ciclo — o entrypoint
aponta para `app.main:app`, que ainda não existe.

## Onde ler mais

- `app/README.md` — organização MVC e endpoints previstos
- `db/README.md` — modelo de dados e as garantias de consistência
- `infraestrutura/README.md` — contentores, portas e como os comandos funcionam
