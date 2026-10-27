# infraestrutura

Camada de execução do BookIT: contentores, rede, balanceamento e persistência.
Não tem lógica de negócio — é a cola que põe os serviços a comunicar.

## Estrutura

    infraestrutura/
    ├── docker/
    │   └── dockercompose.yml   # stack (db, redis, api, nginx)
    └── nginx/
        └── default.conf        # reverse proxy para a API

## Arquitetura-alvo vs. estado atual

Pela Memória Descritiva, a arquitetura final é:

    Nginx (balanceador) → API de reservas (2+ instâncias)
                        → Serviço de IA (2 instâncias)
                        → PostgreSQL (1 primário + 1 réplica)

Nesta fase o compose levanta uma versão simplificada, de uma instância por
serviço, mais o Redis:

| Serviço | Imagem           | Estado atual          | Alvo                    |
|---------|------------------|-----------------------|-------------------------|
| nginx   | nginx:alpine     | reverse proxy         | balanceador             |
| api     | build do backend | 1 instância           | 2+ instâncias stateless |
| db      | postgres:16      | 1 primário            | primário + réplica      |
| redis   | redis:7          | cache / estado volátil| —                       |
| ia      | —                | ainda não existe      | 2 instâncias stateless  |

> O serviço no compose chama-se `api` (é o papel dele na arquitetura), embora
> o código esteja na pasta `backend/app/`. O nginx aponta para `api:8000`.

## Portas

| Serviço | Host | Contentor |
|---------|------|-----------|
| nginx   | 8080 | 80        |
| db      | 5432 | 5432      |
| redis   | 6379 | 6379      |
| api     | —    | 8000 (só interno, via `expose`) |

A porta 80 do host costuma estar ocupada (ex.: MAMP/Apache), por isso o nginx
publica na 8080. Acede-se em `http://localhost:8080`.

## Como correr

O ficheiro chama-se `dockercompose.yml` (**sem hífen**), logo não é um dos
nomes padrão do Compose — é obrigatório indicar o `-f`.

```powershell
cd backend/infraestrutura/docker

docker compose -f dockercompose.yml up -d          # subir tudo
docker compose -f dockercompose.yml ps             # ver estado
docker compose -f dockercompose.yml logs -f api    # seguir logs de um serviço
docker compose -f dockercompose.yml down           # parar (mantém volumes)
docker compose -f dockercompose.yml down -v        # parar e apagar dados
```

## Detalhes que importam

- **Persistência:** volumes nomeados `bookit-db-data` e `bookit-redis-data`.
  Os dados sobrevivem a `down`, mas não a `down -v`.
- **Init da BD:** o `db/BookIT.sql` é montado em
  `/docker-entrypoint-initdb.d/`. O Postgres só corre esse script quando o
  volume de dados está **vazio** (primeira inicialização).
- **Healthchecks:** `pg_isready` no Postgres e `redis-cli ping` no Redis. O
  serviço `api` só arranca depois de ambos estarem `healthy` (`depends_on`).
- **Nginx e DNS:** o proxy usa `resolver 127.0.0.11` com `proxy_pass` por
  variável. Sem isto, o nginx falha no arranque com
  `host not found in upstream` sempre que a `api` está em restart — resolve o
  nome uma única vez, no arranque.

## Verificações rápidas

```powershell
docker exec bookit-db psql -U postgres -d bookit -c "\dt"    # tabelas
docker exec bookit-redis redis-cli ping                      # PONG
docker exec bookit-nginx nginx -t                            # sintaxe do conf
curl.exe -s -o NUL -w "%{http_code}" http://localhost:8080/  # 200 / 502
```

Um **502** no nginx significa que o proxy está bem montado mas o destino
(a `api`) não respondeu — normalmente porque ainda não existe código da API.
