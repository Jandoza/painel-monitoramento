# Deploy do backend no Render (rápido)

1) Crie um repositório Git (ex.: `painel-monitoramento-server`) e envie este diretório.
2) Em https://render.com > New + > Web Service.
3) Conecte o repositório e configure:
   - Runtime: Node 20
   - Build Command: `npm ci && npx prisma generate`
   - Start Command: `node src/index.js`
4) Variáveis de ambiente:
   - `PORT` = 10000 (Render define automaticamente, mas o Node usa `process.env.PORT`)
   - `CORS_ORIGIN` = URL do seu GitHub Pages
5) (Opcional) Banco de dados PostgreSQL (persistência):
   - Altere `prisma/schema.prisma` para `provider = postgresql` e defina `DATABASE_URL`
   - Build Command: `npm ci && npx prisma generate && npx prisma migrate deploy`
6) Depois do deploy, pegue a URL pública e use-a no frontend (`VITE_API_URL`).

Observação: usando SQLite o banco é efêmero; para persistir use Postgres.


