import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store'
import { fetchProjects, selectAllProjects, deleteProject } from '@/app/features/projects/projectsSlice'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Settings, Play, Code, GitBranch, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router'

export default function Projects() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const projects = useSelector(selectAllProjects)
  const { loading } = useSelector((s: RootState) => s.projects)

  useEffect(() => {
    dispatch(fetchProjects())
  }, [dispatch])

  async function handleDeleteProject(id: number) {
    const ok = window.confirm('Supprimer ce projet ? Cette action est irréversible.')
    if (!ok) return
    try {
      await dispatch(deleteProject({ id })).unwrap()
      dispatch(fetchProjects())
    } catch (e) {
      console.error('delete project failed', e)
    }
  }

  const getProjectStatus = () => {
    const statuses = ['configured', 'incomplete', 'needs-setup'] as const
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  const getStatusConfig = (status: 'configured' | 'incomplete' | 'needs-setup') => {
    switch (status) {
      case 'configured':
        return {
          label: 'Configuré',
          color: 'bg-green-500/15 text-green-600 border-green-500/20',
          icon: CheckCircle2,
        }
      case 'incomplete':
        return {
          label: 'Configuration incomplète',
          color: 'bg-amber-500/15 text-amber-600 border-amber-500/20',
          icon: AlertCircle,
        }
      default:
        return {
          label: 'Configuration requise',
          color: 'bg-blue-500/15 text-blue-600 border-blue-500/20',
          icon: Settings,
        }
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Projets CI/CD
              </CardTitle>
              <CardDescription>
                Shiply fonctionne avec Docker. Vous pouvez démarrer en local ou via Docker Compose.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => navigate('/projects/new')} className="rounded-xl">
                Nouveau projet
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl border border-border/30 bg-card/60 p-4 backdrop-blur-sm">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Guide de démarrage</div>
              <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-3">
                <div className="rounded-lg border border-border/30 bg-background/60 p-3">
                  <div className="font-semibold mb-1">Démarrage local</div>
                  <div className="text-muted-foreground">API</div>
                  <div className="font-mono text-muted-foreground/90">cd server && bun run dev</div>
                  <div className="mt-2 text-muted-foreground">Frontend</div>
                  <div className="font-mono text-muted-foreground/90">cd client && bun run dev</div>
                </div>
                <div className="rounded-lg border border-border/30 bg-background/60 p-3">
                  <div className="font-semibold mb-1">Runner local</div>
                  <div className="font-mono text-muted-foreground/90 break-all">API_URL=http://localhost:3333 RUNNER_NAME=runner-local bun run --cwd=runner dev</div>
                </div>
                <div className="rounded-lg border border-border/30 bg-background/60 p-3">
                  <div className="font-semibold mb-1">Docker Compose</div>
                  <div className="text-muted-foreground">Fichier: docker-compose.yml</div>
                  <div className="font-mono text-muted-foreground/90">docker compose up -d</div>
                </div>
              </div>
            </div>

            {loading && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 rounded-xl border border-border/40 bg-card/50 animate-pulse" />
                ))}
              </div>
            )}

            {!loading && projects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted/50 p-4 mb-4">
                  <Code className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Aucun projet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  Créez votre premier projet CI/CD via le bouton « Nouveau projet ».
                </p>
              </div>
            )}

            {!loading && projects.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => {
                  const status = getProjectStatus()
                  const statusConfig = getStatusConfig(status)
                  const StatusIcon = statusConfig.icon

                  return (
                    <motion.div key={project.id} whileHover={{ scale: 1.02, y: -4 }} className="group relative">
                      <Card className="h-full border border-border/30 bg-gradient-to-br from-card/80 via-card/60 to-card/80 backdrop-blur-sm shadow-lg transition-all group-hover:border-border/50 group-hover:shadow-xl group-hover:shadow-primary/10">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg font-semibold truncate">{project.name}</CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs font-mono">{project.key}</Badge>
                                <Badge className={`text-xs border ${statusConfig.color}`}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConfig.label}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {project.description && (
                            <p className="text-sm text-muted-foreground/80 line-clamp-2">{project.description}</p>
                          )}
                        </CardHeader>

                        <CardContent className="pt-0 space-y-4">
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Configuration</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <GitBranch className="h-3 w-3" />
                                <span>Docker: {status === 'configured' ? 'Configuré' : 'À configurer'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>Pipelines: {status === 'configured' ? '2' : '0'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/projects/${project.id}`)}
                              className="flex-1 rounded-lg"
                            >
                              <Settings className="h-3 w-3 mr-1" />
                              Détails
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => navigate(`/projects/${project.id}/pipelines`)}
                              className="flex-1 rounded-lg"
                              disabled={status !== 'configured'}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Pipelines
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteProject(project.id)}
                              className="rounded-lg"
                            >
                              Supprimer
                            </Button>
                          </div>
                        </CardContent>

                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


