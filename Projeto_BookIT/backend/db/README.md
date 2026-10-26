# db

Base de dados do BookIT: **PostgreSQL 16**, com o schema definido em
`BookIT.sql`.

Não é só armazenamento — é aqui que vive a **garantia de consistência** do
sistema. A API e a IA podem correr em várias instâncias ao mesmo tempo; a base
de dados é o ponto único que decide, em transação, se uma reserva entra ou não.

## Como o schema é carregado

O `dockercompose.yml` monta este ficheiro em
`/docker-entrypoint-initdb.d/01-bookit.sql` do contentor Postgres. O Postgres
executa-o automaticamente **na primeira inicialização**, quando o volume de
dados ainda está vazio.

Consequência prática: alterar o `BookIT.sql` **não** altera uma BD já criada.
Para recarregar:

```powershell
cd backend/infraestrutura/docker
docker compose -f dockercompose.yml down -v
docker compose -f dockercompose.yml up -d
```

O `-v` apaga o volume — destrói os dados existentes.

## Modelo de dados

    tipos_recurso ──┐
                    ├──< recursos ──< horario_funcionamento
    equipamentos ───┤        │
                    └──< recurso_equipamento
                             │
    utilizadores ──< reservas >── reserva_equipamento
        │              │
        │              └──< reatribuicoes
        └──< preferencias_utilizador

| Tabela                    | Para que serve                                         |
|---------------------------|--------------------------------------------------------|
| `utilizadores`            | Contas e perfil (`utilizador`/`gestor`/`administrador`) |
| `preferencias_utilizador` | Preferências de local e hora usadas pela IA            |
| `tipos_recurso`           | sala, equipamento, lugar de estudo                     |
| `recursos`                | Salas/equipamentos/lugares, com capacidade e ativo     |
| `equipamentos`            | projetor, quadro, videoconferência, computadores       |
| `recurso_equipamento`     | Que equipamento cada recurso tem                       |
| `horario_funcionamento`   | Abertura/fecho por recurso e dia da semana             |
| `indisponibilidades`      | Avarias e manutenções (intervalos de tempo)            |
| `reservas`                | As reservas: período, estado e origem                  |
| `reserva_equipamento`     | Equipamento pedido em cada reserva                     |
| `reatribuicoes`           | Histórico de reservas movidas após falha               |
| `recomendacoes_log`       | Registo de recomendações (método, tempo de resposta)   |

Tipos enumerados: `perfil_utilizador`, `estado_reserva`
(`confirmada`/`cancelada`/`reatribuida`) e `origem_reserva`
(`manual`/`ia`/`primeiro_livre`/`reatribuicao`).

## As três defesas contra reservas duplicadas

Esta é a parte que implementa o "não perder nem duplicar reservas". Está na
base de dados, não na aplicação — por isso funciona mesmo com N instâncias
da API.

**1. Constraint de exclusão (a principal).** A extensão `btree_gist` permite
excluir reservas sobrepostas no mesmo recurso:

```sql
EXCLUDE USING gist (recurso_id WITH =, periodo WITH &&)
WHERE (estado = 'confirmada')
```

Duas reservas confirmadas nunca se sobrepõem. São os próprios índices do
Postgres que o garantem, de forma atómica.

**2. Trigger de validação.** `fn_validar_reserva` corre antes de cada
insert/update e recusa se o recurso estiver inativo, se o período colidir com
uma indisponibilidade, ou se o nº de pessoas exceder a capacidade.

**3. Intervalos semiabertos.** O período é um `TSTZRANGE` com `[)` — inclui o
início e exclui o fim. Assim uma reserva que acaba às 12:00 e outra que começa
às 12:00 não colidem, que é o comportamento esperado.

## Ligar e inspecionar

```powershell
# dentro do contentor
docker exec -it bookit-db psql -U postgres -d bookit

# do host, com psql instalado
psql "postgresql://postgres:1234@localhost:5432/bookit"
```

Dentro do `psql`:

    \dt                        -- listar tabelas
    \d reservas                -- detalhe da tabela reservas
    SELECT * FROM reservas;    -- ver reservas

Credenciais de desenvolvimento: em
`infraestrutura/docker/dockercompose.yml` e em `../.env.exemplo`.

## Estado atual

- Um único nó (primário). A **réplica** prevista na arquitetura ainda não está
  configurada.
- A **idempotência** das reservas (chave para pedidos repetidos depois de uma
  falha) está descrita na Memória Descritiva mas ainda não existe no schema.
