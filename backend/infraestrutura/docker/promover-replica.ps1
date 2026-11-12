# Failover manual: promove a réplica a primária quando o primário cai.
#
#   .\promover-replica.ps1
#
# Depois de promover, a API deve passar a apontar para "db-replica"
# (ver DATABASE_URL em .env).

$ErrorActionPreference = "Stop"

Write-Host "A promover bookit-db-replica..."
docker exec bookit-db-replica su-exec postgres pg_ctl promote -D /var/lib/postgresql/data

Write-Host "À espera que a réplica aceite escritas..."
do {
    Start-Sleep -Seconds 1
    $emRecuperacao = (docker exec bookit-db-replica su-exec postgres psql -U postgres -d bookit -tAc "SELECT pg_is_in_recovery()") -join ""
} until ($emRecuperacao.Trim() -eq "f")

Write-Host "Pronto: bookit-db-replica é agora o primário."
