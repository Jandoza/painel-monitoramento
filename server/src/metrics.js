const METRIC_KEYS = ['requests_per_min', 'errors_per_min', 'latency_ms']

export async function seedRandomSamples(prisma, count = 1) {
  const rows = []
  for (let i = 0; i < count; i++) {
    const now = new Date()
    rows.push(
      { key: 'requests_per_min', value: Math.max(0, Math.round(100 + Math.random() * 150)), createdAt: now },
      { key: 'errors_per_min', value: Math.max(0, Math.round(Math.random() * 10)), createdAt: now },
      { key: 'latency_ms', value: Math.max(20, Math.round(30 + Math.random() * 120)), createdAt: now }
    )
  }
  await prisma.metricSample.createMany({ data: rows })
}

export async function getLatestSnapshot(prisma) {
  const toDate = new Date()
  const fromDate = new Date(toDate.getTime() - 15 * 60 * 1000)
  return queryMetricsRange({ prisma, fromDate, toDate })
}

export async function queryMetricsRange({ prisma, fromDate, toDate, key }) {
  const where = {
    createdAt: { gte: fromDate, lte: toDate },
    ...(key ? { key } : {})
  }
  const samples = await prisma.metricSample.findMany({
    where,
    orderBy: { createdAt: 'asc' }
  })

  const bucket = new Map()
  for (const s of samples) {
    const minute = new Date(s.createdAt)
    minute.setSeconds(0, 0)
    const minuteKey = minute.toISOString()
    if (!bucket.has(minuteKey)) bucket.set(minuteKey, new Map())
    const byKey = bucket.get(minuteKey)
    if (!byKey.has(s.key)) byKey.set(s.key, [])
    byKey.get(s.key).push(s.value)
  }

  const series = {}
  for (const mk of bucket.keys()) {
    const byKey = bucket.get(mk)
    for (const k of byKey.keys()) {
      if (!series[k]) series[k] = []
      const arr = byKey.get(k)
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length
      series[k].push({ t: mk, v: Number(avg.toFixed(2)) })
    }
  }

  const kpi = {}
  for (const k of METRIC_KEYS) {
    const points = series[k] || []
    const last = points[points.length - 1]?.v ?? 0
    kpi[k] = last
  }

  return { from: fromDate.toISOString(), to: toDate.toISOString(), series, kpi }
}




