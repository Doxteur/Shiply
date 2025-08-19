import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store'
import { fetchPipelines } from '@/app/features/pipelines/pipelinesSlice'
import { fetchProjectRunsPage } from '@/app/features/runs/runsSlice'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Activity, GitBranch, Clock} from 'lucide-react'

export default function ProjectRuns() {
  const { id } = useParams()
  const projectId = Number(id)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const runsState = useSelector((s: RootState) => s.runs)
  const pipelinesByProjectId = useSelector((s: RootState) => s.pipelines.byProjectId)

  const pageData = runsState.pagesByProjectId[projectId]
  const [page, setPage] = useState<number>(pageData?.currentPage ?? 1)
  const perPage = 10

  const pipelineById = useMemo(() => {
    const map = new Map<number, { id: number; name: string }>()
    const list = pipelinesByProjectId[projectId] ?? []
    for (const pl of list) map.set(pl.id, { id: pl.id, name: pl.name })
    return map
  }, [pipelinesByProjectId, projectId])

  useEffect(() => {
    if (projectId) {
      dispatch(fetchPipelines({ projectId }))
      dispatch(fetchProjectRunsPage({ projectId, page, perPage }))
    }
  }, [dispatch, projectId, page])

  const runs = (pageData?.ids ?? []).map((rid) => runsState.byId[rid]).filter(Boolean)

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate(`/projects/${projectId}`)} className="rounded-lg">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <h1 className="text-xl font-semibold">Historique des runs</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Runs du projet
            </CardTitle>
            <CardDescription>Liste paginée des exécutions récentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="overflow-hidden rounded-xl border border-border/30">
              <div className="grid grid-cols-12 bg-background/50 px-4 py-2 text-xs font-medium text-muted-foreground">
                <div className="col-span-2">Run</div>
                <div className="col-span-4">Pipeline</div>
                <div className="col-span-2">Statut</div>
                <div className="col-span-2">Début</div>
                <div className="col-span-2">Durée</div>
              </div>
              {(runs.length === 0) && (
                <div className="px-4 py-6 text-sm text-muted-foreground">Aucun run pour cette page</div>
              )}
              {runs.map((r) => {
                const status: 'success' | 'failed' | 'running' = r.status === 'failed' ? 'failed' : (r.status === 'running' || r.status === 'queued') ? 'running' : 'success'
                const name = pipelineById.get(r.pipelineId)?.name ?? `pipeline #${r.pipelineId}`
                const start = r.startedAt ? new Date(r.startedAt).toLocaleString() : '—'
                const duration = (r.startedAt && r.finishedAt)
                  ? formatDuration(new Date(r.finishedAt).getTime() - new Date(r.startedAt).getTime())
                  : '—'
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => navigate(`/runs/${r.id}`)}
                    aria-label={`Ouvrir le run #${r.id}`}
                    className="grid grid-cols-12 items-center border-t border-border/20 px-4 py-3 text-left text-sm hover:bg-card/60 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <div className="col-span-2 font-mono">#{r.id}</div>
                    <div className="col-span-4 flex items-center gap-2 truncate">
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{name}</span>
                    </div>
                    <div className="col-span-2"><RunBadge status={status} /></div>
                    <div className="col-span-2">{start}</div>
                    <div className="col-span-2 flex items-center gap-2"><Clock className="h-4 w-4" /> {duration}</div>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="text-xs text-muted-foreground">
                Page {pageData?.currentPage ?? page} / {pageData?.lastPage ?? 1} • {pageData?.total ?? 0} runs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  disabled={(pageData?.currentPage ?? page) <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  disabled={(pageData?.currentPage ?? page) >= (pageData?.lastPage ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function RunBadge({ status }: { readonly status: 'success' | 'failed' | 'running' }) {
  const map = {
    success: { className: 'bg-green-500/10 text-green-600 border-green-500/20', label: 'success' },
    failed: { className: 'bg-red-500/10 text-red-600 border-red-500/20', label: 'failed' },
    running: { className: 'bg-blue-500/10 text-blue-600 border-blue-500/20', label: 'running' },
  }
  const c = map[status]
  return (
    <Badge variant={status === 'running' ? 'outline' : 'secondary'} className={`capitalize ${c.className} backdrop-blur-sm`}>{c.label}</Badge>
  )
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes <= 0) return `${seconds}s`
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
}


