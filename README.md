# Painel de Monitoramento

Aplicação full‑stack servida por uma única URL:
- Backend: Node.js/Express + Prisma + Socket.IO
- Frontend: React/Vite (build estático servido pelo Express em `server/public`)

## Rodar localmente
1) Backend (já inclui o build do front em `server/public`):
```bash
cd server
npm install
npm run dev
# http://localhost:4000
```
2) Popular dados de exemplo:
```
GET http://localhost:4000/health
GET http://localhost:4000/metrics/seed
```

## Estrutura
```
projects/painel-monitoramento/
├── server/           # Express + Prisma (serve /metrics e o build do front em /public)
└── web/              # Código do frontend (Vite/React)
```

## Deploy via Railway (uma URL)
Conecte este repositório no Railway como **monorepo** com diretório do serviço = `server`.

- Build Command (Linux):
```bash
npm ci \
&& cd ../web && npm ci && npm run build \
&& cd ../server && npx prisma generate \
&& mkdir -p public && cp -r ../web/dist/* public/
```

- Start Command:
```bash
node src/index.js
```

> Observação: Como o frontend é servido pelo próprio Express, não é necessário CORS.


