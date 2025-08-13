import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, GitBranch, PlayCircle, TimerReset, BarChart3, Activity, Folders, ExternalLink, Sparkles, TrendingUp } from 'lucide-react'
import { useEffect, type ComponentType } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store'
import { fetchProjects, selectAllProjects } from '@/app/features/projects/projectsSlice'
import { useNavigate } from 'react-router'

function Home() {
  const dispatch = useDispatch<AppDispatch>()
  const projects = useSelector(selectAllProjects)
  const projectsLoading = useSelector((s: RootState) => s.projects.loading)
  const navigate = useNavigate()

  // Charger les projets récents au montage
  useEffect(() => {
    dispatch(fetchProjects())
  }, [dispatch])

  function handleCreateProject() {
    navigate('/projects/new')
  }
  return (
    <div className="min-h-full w-full bg-gradient-to-br from-background via-background to-muted/20">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-border/20 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <div className="relative ml-auto w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <input
              placeholder="Rechercher projets, pipelines..."
              className="w-full rounded-xl border border-border/40 bg-card/50 px-10 py-2.5 text-sm backdrop-blur-sm transition-all placeholder:text-muted-foreground/60 focus:border-primary/40 focus:bg-card/80 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30" size="sm">
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {/* Hero CI/CD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
            <CardContent className="relative grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-primary">Shiply Platform</span>
                  </div>
                  <CardTitle className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-3xl font-bold text-transparent">
                    Projets, Pipelines & Déploiements
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground/80">
                    Crée des projets, définis des pipelines, exécute des runs et déploie sur tes environnements avec simplicité et élégance.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleCreateProject} className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30">
                    <Plus className="h-4 w-4" />
                    Nouveau projet
                  </Button>
                  <Button variant="outline" className="rounded-xl border-border/40 bg-background/50 backdrop-blur-sm hover:bg-background/80">
                    <GitBranch className="h-4 w-4" />
                    Nouveau pipeline
                  </Button>
                </div>
              </div>
              <div className="hidden items-center justify-center md:flex">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative h-48 w-full"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 shadow-2xl" />
                  <div className="absolute inset-4 rounded-xl bg-gradient-to-tr from-primary/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex space-x-2">
                    <div className="h-3 w-3 rounded-full bg-primary/60" />
                    <div className="h-3 w-3 rounded-full bg-primary/40" />
                    <div className="h-3 w-3 rounded-full bg-primary/20" />
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* KPIs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard icon={Folders} title="Projets" value="6" trend="+1 ce mois" />
          <StatCard icon={GitBranch} title="Pipelines" value="14" trend="+3" />
          <StatCard icon={PlayCircle} title="Runs (24h)" value="48" trend="-5%" />
          <StatCard icon={Activity} title="Succès (%)" value="92%" trend="+3%" />
        </motion.div>

                {/* Derniers runs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Derniers runs
                  </CardTitle>
                  <CardDescription>Flux récent d'exécutions</CardDescription>
                </div>
                <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {RUNS.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="group flex items-center gap-4 rounded-xl border border-border/40 bg-card/40 p-4 backdrop-blur-sm transition-all hover:bg-card/60 hover:shadow-lg"
                >
                  <div className="rounded-lg bg-primary/10 p-2.5 text-primary group-hover:bg-primary/20 transition-colors">
                    <GitBranch className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="truncate font-medium">{r.pipeline}</span>
                      <RunStatus status={r.status} />
                    </div>
                    <div className="text-sm text-muted-foreground/80">
                      run #{r.id} • <span className="capitalize">{r.env}</span> • {r.time}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    <span className="font-mono">{r.duration}</span>
                  </div>
                </motion.div>
              ))}
            </CardContent>
            <CardFooter className="justify-end pt-4">
              <Button variant="outline" size="sm" className="rounded-xl border-border/40 bg-background/50 backdrop-blur-sm hover:bg-background/80">
                <TimerReset className="h-4 w-4" />
                Voir tout
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Projets récents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Folders className="h-5 w-5 text-primary" />
                    Projets récents
                  </CardTitle>
                  <CardDescription>Accès rapide aux projets actifs</CardDescription>
                </div>
                <Button onClick={handleCreateProject} size="sm" className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                  <Plus className="h-4 w-4" />
                  Nouveau
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {projectsLoading && (
                <>
                  {['s1','s2','s3'].map((k) => (
                    <div key={k} className="h-28 rounded-xl border border-border/40 bg-card/50 animate-pulse" />
                  ))}
                </>
              )}
              {!projectsLoading && projects.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                >
                  <ProjectCard key={p.id} name={p.name} keyProp={p.key} pipelines={Math.floor(Math.random()*5)+1} envs={["staging","production"]} lastRun={{ status: 'success', time: 'il y a 3 min' }} />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

type IconType = ComponentType<{ className?: string }>

type StatProps = { readonly icon: IconType; readonly title: string; readonly value: string; readonly trend: string }

function StatCard({ icon: Icon, title, value, trend }: StatProps) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-lg transition-all hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
        <CardContent className="relative flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary transition-all group-hover:bg-primary/20 group-hover:scale-105">
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

// placeholder supprimé (non utilisé)

const RUNS = [
  { id: 1452, pipeline: 'build-test-deploy', env: 'staging', status: 'success', duration: '2m13s', time: 'il y a 5 min' },
  { id: 1451, pipeline: 'quality-scan', env: 'staging', status: 'failed', duration: '1m01s', time: 'il y a 20 min' },
  { id: 1450, pipeline: 'api-deploy', env: 'production', status: 'running', duration: '—', time: 'en cours' },
] as const

type RunStatusType = 'success' | 'running' | 'failed'

function RunStatus({ status }: { readonly status: RunStatusType }) {
  const statusConfig = {
    success: { variant: 'secondary' as const, className: 'bg-green-500/10 text-green-600 border-green-500/20' },
    running: { variant: 'outline' as const, className: 'bg-blue-500/10 text-blue-600 border-blue-500/20 animate-pulse' },
    failed: { variant: 'destructive' as const, className: 'bg-red-500/10 text-red-600 border-red-500/20' }
  }

  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant}
      className={`capitalize ${config.className} backdrop-blur-sm`}
    >
      {status}
    </Badge>
  )
}

type ProjectCardModel = {
  readonly keyProp: string
  readonly name: string
  readonly pipelines: number
  readonly envs: Array<'staging' | 'production'>
  readonly lastRun: { readonly status: RunStatusType; readonly time: string }
}

function ProjectCard(project: ProjectCardModel) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-sm shadow-lg transition-all hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
        <CardHeader className="relative pb-3">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary transition-all group-hover:bg-primary/20 group-hover:scale-110">
              <Folders className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate font-semibold">{project.name}</CardTitle>
              <CardDescription className="text-muted-foreground/80">
                {project.keyProp} • {project.pipelines} pipelines
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4 pt-0">
          <div className="flex flex-wrap gap-2">
            {project.envs.map((e) => (
              <Badge key={e} variant="outline" className="bg-background/50 backdrop-blur-sm capitalize">
                {e}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
              <span>Dernier run:</span>
              <RunStatus status={project.lastRun.status} />
              <span>{project.lastRun.time}</span>
            </div>
            <Button size="sm" variant="outline" className="rounded-lg border-border/40 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// obsolete placeholder removed (now fetched from API)

export default Home
