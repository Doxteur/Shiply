import { useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store'
import { fetchProjects, selectAllProjects } from '@/app/features/projects/projectsSlice'
import { fetchPipelines } from '@/app/features/pipelines/pipelinesSlice'
import { fetchLatestRunsByProject, fetchProjectRunStats } from '@/app/features/runs/runsSlice'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, GitBranch, Folder, Settings, Play, GitCommit,
  Activity, Clock, CheckCircle, XCircle, AlertCircle,
  Code, Package, Terminal, Server, ExternalLink, Plus,
  type LucideIcon
} from 'lucide-react'

export default function ProjectDetails() {
  const { id } = useParams()
  const projectId = Number(id)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const projects = useSelector(selectAllProjects)
  const loading = useSelector((s: RootState) => s.projects.loading)
  const pipelines = useSelector((s: RootState) => s.pipelines.byProjectId[projectId] ?? [])
  const runsState = useSelector((s: RootState) => s.runs)
  const latestRunIds = runsState.latestByProjectId[projectId] ?? []
  const latestRuns = latestRunIds.map((rid) => runsState.byId[rid]).filter(Boolean)
  const runStats = runsState.statsByProjectId[projectId]

  const metrics = useMemo(() => {
    const completed = latestRuns.filter((r) => r.finishedAt && r.startedAt)
    const successCount = completed.filter((r) => r.status === 'success').length
    const failedCount = completed.filter((r) => r.status === 'failed').length
    const canceledCount = completed.filter((r) => r.status === 'canceled').length
    const denominator = successCount + failedCount + canceledCount
    const successRate = denominator > 0 ? Math.round((successCount / denominator) * 100) : null

    const durationsMs = completed
      .map((r) => {
        const start = new Date(r.startedAt as string).getTime()
        const end = new Date(r.finishedAt as string).getTime()
        return Math.max(0, end - start)
      })
      .filter((v) => Number.isFinite(v) && v > 0)

    const avgMs = durationsMs.length > 0 ? Math.round(durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length) : null
    return { successRate, avgMs }
  }, [latestRuns])

  const project = useMemo(() => projects.find((p: { id: number }) => p.id === projectId), [projects, projectId])

  useEffect(() => {
    if (!project) dispatch(fetchProjects())
  }, [dispatch, project])

  useEffect(() => {
    if (projectId) {
      dispatch(fetchPipelines({ projectId }))
      dispatch(fetchLatestRunsByProject({ projectId }))
      dispatch(fetchProjectRunStats({ projectId }))
    }
  }, [dispatch, projectId])

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header avec navigation */}
      <div className="sticky top-0 z-10 border-b border-border/20 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <Button variant="outline" onClick={() => navigate('/projects')} className="rounded-xl border-border/40 bg-background/50 backdrop-blur-sm hover:bg-background/80">
            <ArrowLeft className="mr-2 h-4 w-4" /> Projets
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{project?.name || (loading ? 'Chargement…' : 'Projet inconnu')}</h1>
            {project && (
              <p className="text-sm text-muted-foreground">
                <Badge variant="outline" className="mr-2 text-xs font-mono bg-background/50">{project.key}</Badge>
                Configuration et aperçu du projet
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
              <Play className="mr-2 h-4 w-4" /> Déclencher Run
            </Button>
            <Button variant="outline" className="rounded-xl border-border/40 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <Settings className="mr-2 h-4 w-4" /> Configurer
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {/* Section Hero du projet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
            <CardContent className="relative p-8">
              {project?.description && (
                <div className="mb-6 rounded-xl border border-border/30 bg-background/60 p-4 text-muted-foreground backdrop-blur-sm">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground/80">
                    <Code className="h-4 w-4" />
                    Description
                  </div>
                  {project.description}
                </div>
              )}

              {/* Actions rapides */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <QuickActionCard icon={Play} title="Nouveau Run" description="Déclencher pipeline" />
                <QuickActionCard icon={GitCommit} title="Pipelines" description={`${pipelines.length} configurés`} />
                <QuickActionCard icon={Activity} title="Historique" description="28 runs" />
                <QuickActionCard icon={Settings} title="Configurer" description="Modifier setup" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistiques rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatsCard icon={CheckCircle} title="Taux de succès" value={metrics.successRate !== null ? `${metrics.successRate}%` : '—'} trend="—" color="green" />
          <StatsCard icon={Clock} title="Durée moyenne" value={metrics.avgMs !== null ? formatDuration(metrics.avgMs) : '—'} trend="—" color="blue" />
          <StatsCard icon={GitCommit} title="Runs (total)" value={runStats ? String(runStats.total) : '—'} trend={runStats ? `${runStats.success} ok / ${runStats.failed} ko` : '—'} color="purple" />
          <StatsCard icon={Activity} title="Dernier run" value={latestRuns[0]?.status ?? '—'} trend={latestRuns[0]?.status === 'success' ? 'ok' : latestRuns[0]?.status ?? '—'} color="emerald" />
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Configuration principale */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Configuration du référentiel */}
            <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GitBranch className="h-5 w-5 text-primary" />
                  Configuration du référentiel
                </CardTitle>
                <CardDescription>Paramètres du dépôt Git et organisation du code</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ConfigItem icon={GitBranch} label="Branche par défaut" value={(project as unknown as { config: { defaultBranch: string } })?.config?.defaultBranch ?? 'main'} />
                <ConfigItem icon={Folder} label="Chemin racine" value={(project as unknown as { config: { rootPath: string } })?.config?.rootPath ?? '/'} />
              </CardContent>
            </Card>

            {/* Configuration d'exécution */}
            <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Terminal className="h-5 w-5 text-primary" />
                  Configuration d'exécution
                </CardTitle>
                <CardDescription>Paramètres de build et de déploiement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-border/30 bg-card/60 p-4 backdrop-blur-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      {(project as unknown as { config: { runMode: string } })?.config?.runMode === 'command' && <Terminal className="h-4 w-4" />}
                      {(project as unknown as { config: { runMode: string } })?.config?.runMode === 'dockerfile' && <Package className="h-4 w-4" />}
                      {(project as unknown as { config: { runMode: string } })?.config?.runMode === 'compose' && <Server className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="font-medium">Mode d'exécution</div>
                      <div className="text-sm text-muted-foreground capitalize">{(project as unknown as { config: { runMode: string } })?.config?.runMode ?? '—'}</div>
                    </div>
                  </div>

                  {(project as unknown as { config: { runMode: string } })?.config?.runMode === 'command' && (
                    <div className="rounded-lg border border-border/20 bg-background/50 p-3 font-mono text-sm">
                      {(project as unknown as { config: { startCommand: string } })?.config?.startCommand ?? '—'}
                    </div>
                  )}
                  {(project as unknown as { config: { runMode: string } })?.config?.runMode === 'dockerfile' && (
                    <div className="rounded-lg border border-border/20 bg-background/50 p-3 font-mono text-sm">
                      {(project as unknown as { config: { dockerfilePath: string } })?.config?.dockerfilePath ?? 'Dockerfile'}
                    </div>
                  )}
                  {(project as unknown as { config: { runMode: string } })?.config?.runMode === 'compose' && (
                    <div className="rounded-lg border border-border/20 bg-background/50 p-3 font-mono text-sm">
                      {(project as unknown as { config: { composePath: string } })?.config?.composePath ?? 'docker-compose.yml'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Variables d'environnement */}
            <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="h-5 w-5 text-primary" />
                  Variables d'environnement
                </CardTitle>
                <CardDescription>Configuration des variables pour le déploiement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {Array.isArray((project as unknown as { config: { envVars: Array<{ key: string; value: string }> } })?.config?.envVars) && (project as unknown as { config: { envVars: Array<{ key: string; value: string }> } })?.config?.envVars.length > 0 ? (
                    (project as unknown as { config: { envVars: Array<{ key: string; value: string }> } })?.config?.envVars.map((v: { key: string; value: string }, idx: number) => (
                      <motion.div
                        key={`${v.key}-${idx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="flex items-center justify-between rounded-xl border border-border/30 bg-background/60 px-4 py-3 backdrop-blur-sm"
                      >
                        <span className="font-mono text-sm font-medium text-muted-foreground">{v.key}</span>
                        <span className="font-mono text-sm text-foreground">{v.value}</span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-border/40 bg-background/30 p-8 text-center">
                      <Code className="mx-auto h-8 w-8 text-muted-foreground/50" />
                      <div className="mt-2 text-sm text-muted-foreground">Aucune variable configurée</div>
                      <Button variant="outline" size="sm" className="mt-3 rounded-lg">
                        <Plus className="mr-2 h-4 w-4" /> Ajouter une variable
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar avec informations supplémentaires */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Derniers runs */}
            <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-primary" />
                  Derniers runs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {latestRuns.length === 0 && (
                  <div className="text-sm text-muted-foreground">Aucun run récent</div>
                )}
                {latestRuns.map((r) => {
                  const pipeName = pipelines.find((p: { id: number; name: string }) => p.id === r.pipelineId)?.name ?? `pipeline #${r.pipelineId}`
                  const status: 'success' | 'failed' | 'running' = (r.status === 'queued' || r.status === 'running') ? 'running' : (r.status === 'failed' ? 'failed' : 'success')
                  return (
                    <RunItem key={r.id} status={status} pipeline={pipeName} time={r.createdAt ? new Date(r.createdAt).toLocaleString() : ''} duration={r.finishedAt ? '—' : '—'} />
                  )
                })}
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start rounded-lg border-border/40 bg-background/50 backdrop-blur-sm hover:bg-background/80">
                  <GitBranch className="mr-2 h-4 w-4" /> Voir le dépôt
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-lg border-border/40 bg-background/50 backdrop-blur-sm hover:bg-background/80">
                  <Activity className="mr-2 h-4 w-4" /> Historique complet
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-lg border-border/40 bg-background/50 backdrop-blur-sm hover:bg-background/80">
                  <Settings className="mr-2 h-4 w-4" /> Modifier config
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Composants helpers
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes <= 0) return `${seconds}s`
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
}
function QuickActionCard({ icon: Icon, title, description }: { readonly icon: LucideIcon, readonly title: string, readonly description: string }) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-sm shadow-lg transition-all hover:shadow-xl cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
        <CardContent className="relative flex items-center gap-3 p-4">
          <div className="rounded-lg bg-primary/10 p-2 text-primary transition-all group-hover:bg-primary/20 group-hover:scale-110">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm">{title}</div>
            <div className="text-xs text-muted-foreground">{description}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function StatsCard({ icon: Icon, title, value, trend, color }: { readonly icon: LucideIcon, readonly title: string, readonly value: string, readonly trend: string, readonly color: string }) {
  const colorClasses = {
    green: 'text-green-600 bg-green-500/10',
    blue: 'text-blue-600 bg-blue-500/10',
    purple: 'text-purple-600 bg-purple-500/10',
    emerald: 'text-emerald-600 bg-emerald-500/10'
  }

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-lg transition-all hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
        <CardContent className="relative flex items-center gap-3 p-4">
          <div className={`rounded-lg p-2 transition-all group-hover:scale-105 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-medium text-muted-foreground/80">{title}</div>
            <div className="text-xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground/60">{trend}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ConfigItem({ icon: Icon, label, value }: { readonly icon: LucideIcon, readonly label: string, readonly value: string }) {
  return (
    <div className="rounded-xl border border-border/30 bg-card/60 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <div className="mt-2 font-mono text-sm font-medium">{value}</div>
    </div>
  )
}

function RunItem({ status, pipeline, time, duration }: { readonly status: 'success' | 'failed' | 'running', readonly pipeline: string, readonly time: string, readonly duration: string }) {
  const statusConfig = {
    success: { icon: CheckCircle, className: 'text-green-600' },
    failed: { icon: XCircle, className: 'text-red-600' },
    running: { icon: AlertCircle, className: 'text-blue-600 animate-pulse' }
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/30 bg-background/60 p-3 backdrop-blur-sm">
      <StatusIcon className={`h-4 w-4 ${config.className}`} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{pipeline}</div>
        <div className="text-xs text-muted-foreground">{time} • {duration}</div>
      </div>
    </div>
  )
}


