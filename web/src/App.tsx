import { useEffect, useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, Bar, BarChart } from 'recharts'
import { format } from 'date-fns'
import { fetchMetrics } from './api'
import { getSocket } from './socket'

type SeriesMap = Record<string, { t: string; v: number }[]>

function useRealtimeMetrics() {
  const [data, setData] = useState<{ from: string; to: string; series: SeriesMap; kpi: Record<string, number> } | null>(null)

  useEffect(() => {
    let active = true
    fetchMetrics().then(d => active && setData(d)).catch(() => {})
    const s = getSocket()
    s.on('metrics:update', (d) => { if (active) setData(d) })
    const poll = setInterval(() => fetchMetrics().then(d => active && setData(d)).catch(() => {}), 30000)
    return () => { active = false; s.off('metrics:update'); clearInterval(poll) }
  }, [])

  return data
}

function KpiCard({ title, value, suffix = '' }: { title: string; value: number | undefined; suffix?: string }) {
  return (
    <div style={{ padding: 16, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff' }}>
      <div style={{ color: '#6b7280', fontSize: 12 }}>{title}</div>
      <div style={{ fontWeight: 800, fontSize: 20 }}>{value ?? 0}{suffix}</div>
    </div>
  )
}

function toChartData(points?: { t: string; v: number }[]) {
  return (points || []).map(p => ({ time: format(new Date(p.t), 'HH:mm'), value: p.v }))
}

export default function App() {
  const data = useRealtimeMetrics()
  const reqData = useMemo(() => toChartData(data?.series['requests_per_min']), [data])
  const errData = useMemo(() => toChartData(data?.series['errors_per_min']), [data])
  const latData = useMemo(() => toChartData(data?.series['latency_ms']), [data])

  return (
    <div style={{ maxWidth: 1100, margin: '32px auto', padding: '0 16px', fontFamily: 'system-ui, Arial' }}>
      <h1>Painel de Monitoramento</h1>
      <p style={{ color: '#6b7280' }}>Tempo real com Socket.IO + fallback por polling</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        <KpiCard title="Requests/min" value={data?.kpi['requests_per_min']} />
        <KpiCard title="Erros/min" value={data?.kpi['errors_per_min']} />
        <KpiCard title="Latência média" value={data?.kpi['latency_ms']} suffix=" ms" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginTop: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
          <h3>Requests por minuto</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={reqData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
          <h3>Erros por minuto</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={errData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, marginTop: 16 }}>
        <h3>Latência média (ms)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={latData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#10b981" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}