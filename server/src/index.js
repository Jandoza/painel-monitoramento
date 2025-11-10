import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import { seedRandomSamples, getLatestSnapshot, queryMetricsRange } from './metrics.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))

const server = http.createServer(app)
const io = new SocketIOServer(server, {
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }
})

const prisma = new PrismaClient()

app.get('/health', (_req, res) => res.json({ ok: true }))

app.get('/metrics', async (req, res) => {
  try {
    const { from, to, key } = req.query
    const now = new Date()
    const toDate = to ? new Date(to) : now
    const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 15 * 60 * 1000)

    const data = await queryMetricsRange({ prisma, fromDate, toDate, key })
    res.json(data)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'internal_error' })
  }
})

app.post('/metrics/seed', async (_req, res) => {
  try {
    await seedRandomSamples(prisma, 60)
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'internal_error' })
  }
})

// Serve arquivos estáticos do frontend (build do Vite em ../public)
app.use(express.static(path.join(__dirname, '../public')))

// Alias via GET para facilitar teste no navegador
app.get('/metrics/seed', async (_req, res) => {
  try {
    await seedRandomSamples(prisma, 60)
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'internal_error' })
  }
})

io.on('connection', async (socket) => {
  socket.emit('metrics:update', await getLatestSnapshot(prisma))
})

setInterval(async () => {
  try {
    io.emit('metrics:update', await getLatestSnapshot(prisma))
  } catch (e) {
    console.error('emit error', e)
  }
}, 5000)

setInterval(async () => {
  try {
    await seedRandomSamples(prisma, 1)
  } catch (e) {
    console.error('seed error', e)
  }
}, 5000)

const port = Number(process.env.PORT || 4000)
server.listen(port, () => {
  console.log(`server listening on http://localhost:${port}`)
})

// Fallback para SPA (react-router) - precisa vir após as rotas da API
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'))
})


