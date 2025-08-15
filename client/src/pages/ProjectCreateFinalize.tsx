import { useLocation, useNavigate } from 'react-router'
import { useState } from 'react'
import ProjectCreateForm from '@/components/services/projects/ProjectCreateForm'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Boxes, FileCog, Plus, Trash2, GitBranch, Folder } from 'lucide-react'

type LocationState = {
  name?: string
  key?: string
  description?: string
  provider?: 'github' | 'gitlab' | 'zip'
  full_name?: string
}

export default function ProjectCreateFinalize() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state || {}) as LocationState
  const [runMode, setRunMode] = useState<'command' | 'dockerfile' | 'compose'>('command')
  const [startCommand, setStartCommand] = useState<string>('bun run dev')
  const [dockerfilePath, setDockerfilePath] = useState<string>('Dockerfile')
  const [composePath, setComposePath] = useState<string>('docker-compose.yml')
  const [defaultBranch, setDefaultBranch] = useState<string>('main')
  const [rootPath, setRootPath] = useState<string>('')
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>([
    { key: 'NODE_ENV', value: 'development' },
  ])

  function addEnvVar() {
    setEnvVars((prev) => [...prev, { key: '', value: '' }])
  }

  function removeEnvVar(index: number) {
    setEnvVars((prev) => prev.filter((_, i) => i !== index))
  }

  function updateEnvVar(index: number, field: 'key' | 'value', value: string) {
    setEnvVars((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle>Finaliser la création</CardTitle>
            <CardDescription>
              Pré-rempli depuis {state.provider === 'github' ? 'GitHub' : 'la source'} — vous pouvez ajuster avant de créer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state.full_name && (
              <div className="mb-4 text-sm text-muted-foreground">
                Dépôt sélectionné: <span className="font-medium">{state.full_name}</span>
              </div>
            )}
            <ProjectCreateForm
              initialName={state.name}
              initialKey={state.key}
              initialDescription={state.description}
              onCreated={() => navigate('/projects', { replace: true })}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Référentiel */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.03 }}>
        <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Référentiel
            </CardTitle>
            <CardDescription>Définissez la branche par défaut et, si nécessaire, un sous-dossier du dépôt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Branche par défaut</label>
                <div className="relative">
                  <GitBranch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={defaultBranch}
                    onChange={(e) => setDefaultBranch(e.target.value)}
                    placeholder="ex: main"
                    className="w-full rounded-lg border border-border/30 bg-background/70 pl-10 pr-3 py-3 text-sm outline-none transition-all focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground/80">Branche utilisée par défaut pour les opérations CI/CD</div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Chemin racine (optionnel)</label>
                <div className="relative">
                  <Folder className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={rootPath}
                    onChange={(e) => setRootPath(e.target.value)}
                    placeholder="ex: apps/web"
                    className="w-full rounded-lg border border-border/30 bg-background/70 pl-10 pr-3 py-3 text-sm outline-none transition-all focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground/80">Laissez vide si le projet est à la racine du dépôt</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
        <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Configuration d'exécution
            </CardTitle>
            <CardDescription>Définissez le mode de démarrage et la commande associée</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
                        <div className="flex flex-wrap items-center gap-2">
              <motion.button
                type="button"
                onClick={() => setRunMode('command')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${runMode === 'command'
                  ? 'border-primary/40 bg-primary/10 text-foreground shadow-md'
                  : 'border-border/40 text-muted-foreground hover:bg-card/60 hover:border-border/60'
                }`}
              >
                <Play className="h-4 w-4" />
                Commande
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setRunMode('dockerfile')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${runMode === 'dockerfile'
                  ? 'border-primary/40 bg-primary/10 text-foreground shadow-md'
                  : 'border-border/40 text-muted-foreground hover:bg-card/60 hover:border-border/60'
                }`}
              >
                <Boxes className="h-4 w-4" />
                Dockerfile
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setRunMode('compose')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${runMode === 'compose'
                  ? 'border-primary/40 bg-primary/10 text-foreground shadow-md'
                  : 'border-border/40 text-muted-foreground hover:bg-card/60 hover:border-border/60'
                }`}
              >
                <FileCog className="h-4 w-4" />
                Docker Compose
              </motion.button>
            </div>

            {runMode === 'command' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border border-border/20 bg-gradient-to-br from-card/60 via-card/40 to-card/60 p-4 backdrop-blur-sm"
              >
                <label className="mb-3 block text-sm font-medium text-foreground">Commande de lancement</label>
                <div className="relative">
                  <Play className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={startCommand}
                    onChange={(e) => setStartCommand(e.target.value)}
                    placeholder="Ex: bun run dev"
                    className="w-full rounded-lg border border-border/30 bg-background/70 pl-10 pr-3 py-3 text-sm outline-none transition-all focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground/80">
                  Commande exécutée directement sur l'environnement cible
                </div>
              </motion.div>
            )}

            {runMode === 'dockerfile' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border border-border/20 bg-gradient-to-br from-card/60 via-card/40 to-card/60 p-4 backdrop-blur-sm"
              >
                <label className="mb-3 block text-sm font-medium text-foreground">Chemin du Dockerfile</label>
                <div className="relative">
                  <Boxes className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={dockerfilePath}
                    onChange={(e) => setDockerfilePath(e.target.value)}
                    placeholder="Ex: Dockerfile"
                    className="w-full rounded-lg border border-border/30 bg-background/70 pl-10 pr-3 py-3 text-sm outline-none transition-all focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="mt-3 rounded-lg bg-blue-500/10 p-3 text-xs text-blue-600">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 h-1 w-1 rounded-full bg-blue-600"></div>
                    <div>Le runner construira l'image depuis ce Dockerfile présent dans le dépôt GitHub.</div>
                  </div>
                </div>
              </motion.div>
            )}

            {runMode === 'compose' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border border-border/20 bg-gradient-to-br from-card/60 via-card/40 to-card/60 p-4 backdrop-blur-sm"
              >
                <label className="mb-3 block text-sm font-medium text-foreground">Chemin du fichier docker-compose</label>
                <div className="relative">
                  <FileCog className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={composePath}
                    onChange={(e) => setComposePath(e.target.value)}
                    placeholder="Ex: docker-compose.yml"
                    className="w-full rounded-lg border border-border/30 bg-background/70 pl-10 pr-3 py-3 text-sm outline-none transition-all focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="mt-3 rounded-lg bg-green-500/10 p-3 text-xs text-green-600">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 h-1 w-1 rounded-full bg-green-600"></div>
                    <div>Orchestre plusieurs services avec docker-compose up depuis le dépôt.</div>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle>Variables d'environnement</CardTitle>
            <CardDescription>Ajoutez des variables clés/valeurs nécessaires à l'application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {envVars.map((pair, idx) => (
                <motion.div
                  key={`${idx}-${pair.key}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="group rounded-xl border border-border/20 bg-gradient-to-br from-card/60 via-card/40 to-card/60 p-4 backdrop-blur-sm hover:border-border/30 transition-all"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-end">
                    <div className="sm:col-span-4">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Variable</label>
                      <input
                        value={pair.key}
                        onChange={(e) => updateEnvVar(idx, 'key', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                        placeholder="NOM_VARIABLE"
                        className="w-full rounded-lg border border-border/30 bg-background/70 px-3 py-2.5 text-sm font-mono outline-none transition-all focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/50"
                      />
                    </div>
                    <div className="sm:col-span-7">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Valeur</label>
                      <input
                        value={pair.value}
                        onChange={(e) => updateEnvVar(idx, 'value', e.target.value)}
                        placeholder="Valeur de la variable"
                        className="w-full rounded-lg border border-border/30 bg-background/70 px-3 py-2.5 text-sm outline-none transition-all focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/50"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                        onClick={() => removeEnvVar(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center pt-2"
              >
                <Button
                  type="button"
                  onClick={addEnvVar}
                  variant="outline"
                  className="rounded-xl border-dashed border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une variable d'environnement
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


