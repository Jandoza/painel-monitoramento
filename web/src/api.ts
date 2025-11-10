const API_URL = (import.meta as any).env?.VITE_API_URL as string | undefined

function endpoint(path: string) {
  return API_URL ? `${API_URL}${path}` : path
}

export async function fetchMetrics(params?: { from?: string; to?: string; key?: string }) {
  const qs = new URLSearchParams(params as any).toString()
  const url = endpoint(`/metrics${qs ? `?${qs}` : ''}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error('failed')
  return res.json() as Promise<{ from: string; to: string; series: Record<string, { t: string; v: number }[]>; kpi: Record<string, number> }>
}

export { API_URL }

