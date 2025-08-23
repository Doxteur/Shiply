import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store'
import { fetchRun, fetchRunJobs } from '@/app/features/runs/runsSlice'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ListTree, Logs, TerminalSquare } from 'lucide-react'
import { REACT_APP_API_URL } from '@/app/utils/config'
import axiosInstance from '@/app/utils/axios'

export default function RunDetails() {
  const { id } = useParams()
  const runId = Number(id)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const runs = useSelector((s: RootState) => s.runs.byId)
  const jobsByRun = useSelector((s: RootState) => s.runs.jobsByRunId)
  const run = runs[runId]
  const jobs = useMemo(() => jobsByRun[runId] ?? [], [jobsByRun, runId])
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const [logs, setLogs] = useState<string>('')
  const logsRef = useRef<HTMLDivElement | null>(null)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    dispatch(fetchRun({ id: runId }))
    dispatch(fetchRunJobs({ runId }))
  }, [dispatch, runId])

  // Poll léger tant que le run n'est pas terminé, pour rafraîchir les statuts des jobs
  useEffect(() => {
    const isActive = !run || run.status === 'queued' || run.status === 'running'
    if (!isActive) return
    const interval = window.setInterval(() => {
      dispatch(fetchRun({ id: runId }))
      dispatch(fetchRunJobs({ runId }))
    }, 1500)
    return () => window.clearInterval(interval)
  }, [dispatch, runId, run])

  useEffect(() => {
    if (!selectedJobId && jobs.length > 0) setSelectedJobId(jobs[0].id)
  }, [jobs, selectedJobId])

  useEffect(() => {
    // cleanup previous stream
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }
    setLogs('')
    if (!selectedJobId) return
    const base = REACT_APP_API_URL
    const url = `${base}/jobs/${selectedJobId}/logs/stream?ts=${Date.now()}`

    // Précharger l'existant pour éviter un écran vide si le flux tarde
    ;(async () => {
      try {
        const res = await fetch(`${base}/jobs/${selectedJobId}/logs`)
        if (res.ok) {
          const txt = await res.text()
          if (txt) setLogs(txt)
        }
      } catch(err) {
        console.error('Error fetching logs', err)
      }
    })()

    const es = new EventSource(url)
    es.onmessage = (ev) => {
      setLogs((prev) => (prev ? prev + '\n' + ev.data : ev.data))
      if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight
    }
    // Ne pas fermer manuellement: EventSource gère les reconnexions
    es.onerror = () => {
      // Optionnel: on peut afficher un état ou logger
      // console.warn('SSE error on logs stream')
    }
    esRef.current = es
    return () => {
      es.close()
      esRef.current = null
    }
  }, [selectedJobId])

  // Fallback polling des logs si SSE est inactif ou lent, tant que le run est actif
  useEffect(() => {
    const isActive = !run || run.status === 'queued' || run.status === 'running'
    if (!selectedJobId || !isActive) return
    const base = REACT_APP_API_URL
    const interval = window.setInterval(async () => {
      try {
        const res = await fetch(`${base}/jobs/${selectedJobId}/logs`)
        if (!res.ok) return
        const txt = await res.text()
        // Met à jour seulement si on récupère plus que l'existant
        if (txt && txt.length > (logs?.length || 0)) {
          setLogs(txt)
          if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight
        }
      } catch {
        // ignore network errors
      }
    }, 1500)
    return () => window.clearInterval(interval)
  }, [selectedJobId, run, logs?.length])

  const runStatusBadge = useMemo(() => {
    const map = {
      success: 'bg-green-500/10 text-green-600 border-green-500/20',
      failed: 'bg-red-500/10 text-red-600 border-red-500/20',
      running: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      queued: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      canceled: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    } as const
    const k = (run?.status ?? 'queued') as keyof typeof map
    return map[k]
  }, [run?.status])

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)} className="rounded-lg">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <h1 className="text-xl font-semibold">Run #{runId}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTree className="h-5 w-5 text-primary" />
              Jobs
            </CardTitle>
            <CardDescription>Étapes du run</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {jobs.length === 0 && (
              <div className="text-sm text-muted-foreground">Aucun job</div>
            )}
            {jobs.map((j) => (
              <button
                key={j.id}
                onClick={() => setSelectedJobId(j.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  selectedJobId === j.id ? 'border-primary/40 bg-primary/10' : 'border-border/30 hover:bg-card/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="truncate font-medium">{j.stage} • {j.name}</div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {j.status}
                  </Badge>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Logs className="h-5 w-5 text-primary" />
                  Logs
                </CardTitle>
                <CardDescription>
                  Statut du run: <Badge variant="outline" className={`ml-1 ${runStatusBadge}`}>{run?.status ?? '—'}</Badge>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setLogs('')}>
                  <TerminalSquare className="mr-2 h-4 w-4" /> Clear
                </Button>
                {(run?.status === 'running' || run?.status === 'queued') && (
                  <Button size="sm" variant="destructive" className="rounded-lg" onClick={async () => {
                    try {
                      await axiosInstance.post(`/runs/${runId}/cancel`)
                      await dispatch(fetchRun({ id: runId }))
                      await dispatch(fetchRunJobs({ runId }))
                    } catch (err) {
                      console.error('Error canceling run', err)
                    }
                  }}>
                    Stopper
                  </Button>
                )}
                {run?.status === 'success' && (
                  <Button size="sm" className="rounded-lg" onClick={async () => {
                    try {
                      await axiosInstance.post(`/runs/${runId}/deploy`)
                      // rafraîchir jobs et sélectionner le job Deploy si présent
                      await dispatch(fetchRunJobs({ runId }))
                      const refreshed = (jobs || []) as Array<{ id: number; stage: string }>
                      const deployJob = refreshed.find((j) => j.stage === 'Deploy')
                      if (deployJob) setSelectedJobId(deployJob.id)
                    } catch {
                      // noop
                    }
                  }}>
                    Déployer
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={logsRef} className="custom-scroll h-[520px] w-full overflow-auto rounded-xl border border-border/30 bg-background/60 p-3 font-mono text-xs">
              {logs || '—'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


