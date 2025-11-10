# Painel de Monitoramento — Server

## Requisitos
- Node 18+
- (Opcional) Docker — este template já está configurado para usar SQLite localmente, sem Docker.

## Configuração
1. Banco de dados: por padrão usa SQLite (`prisma/schema.prisma` → `file:./dev.db`).

2. Gerar client e aplicar migrações:
```
npm run prisma:generate
npm run prisma:migrate
```

3. Executar em desenvolvimento:
```
npm run dev
```

Endpoints úteis:
- `GET /health`
- `GET /metrics?from&to&key`
- `POST /metrics/seed`

Socket.IO: evento `metrics:update` a cada 5s.

