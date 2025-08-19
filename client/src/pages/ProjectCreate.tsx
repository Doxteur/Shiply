import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Archive, CheckCircle, ExternalLink, Lock } from 'lucide-react'
import axiosInstance from '@/app/utils/axios'
import { useNavigate } from 'react-router'

type GithubRepo = { name: string; full_name: string; private: boolean; html_url: string }

export default function ProjectCreate() {
  const navigate = useNavigate()
  const [provider, setProvider] = useState<null | 'github' | 'gitlab' | 'zip'>(null)
  const [githubConnected, setGithubConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [repos, setRepos] = useState<GithubRepo[]>([])
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [reposError, setReposError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const pollRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current)
    }
  }, [])

  async function handleGithubConnect() {
    try {
      setIsConnecting(true)
      // Fetch authorize URL from API (requires auth)
      const { data } = await axiosInstance.get<{ url: string }>(
        '/integrations/github/authorize'
      )
      const w = window.open(
        data.url,
        'gh_oauth',
        'width=900,height=700,menubar=no,toolbar=no'
      )
      // Poll status
      pollRef.current = window.setInterval(async () => {
        try {
          const { data } = await axiosInstance.get<{ connected: boolean }>(
            '/integrations/github/status'
          )
          if (data.connected) {
            setGithubConnected(true)
            if (pollRef.current) window.clearInterval(pollRef.current)
            try {
              w?.close()
            } catch (e) {
              console.error('Erreur lors de la fermeture de la fenêtre GitHub:', e)
            }
            await loadGithubRepos()
          }
        } catch (e) {
          console.error('Erreur lors de la vérification de la connexion GitHub:', e)
        }
      }, 1000)
    } finally {
      setIsConnecting(false)
    }
  }

  async function loadGithubRepos() {
    setLoadingRepos(true)
    setReposError(null)
    try {
      const { data } = await axiosInstance.get<{ data: GithubRepo[] }>(
        '/integrations/github/repos'
      )
      setRepos(Array.isArray(data?.data) ? data.data : [])
    } catch (e) {
      setReposError(String(e))
    } finally {
      setLoadingRepos(false)
    }
  }

  function deriveKeyFromName(name: string) {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/(^-+)|(-+$)/g, '')
      .slice(0, 8) || 'PROJ'
  }

  async function handleUseRepo(repo: GithubRepo) {
    const initial = {
      name: repo.name,
      key: deriveKeyFromName(repo.name),
      provider: 'github' as const,
      full_name: repo.full_name,
    }
    navigate('/projects/new/finalize', { state: initial })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="mx-auto max-w-4xl space-y-8 px-6 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="h-8 w-8 rounded-lg bg-primary" />
          </div>
          <h1 className="mb-2 text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Créer un nouveau projet
          </h1>
          <p className="text-muted-foreground">
            Choisissez votre source de code et configurez votre projet CI/CD
          </p>
        </motion.div>

        {/* Provider Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                Source du code
              </CardTitle>
              <CardDescription>
                Sélectionnez la plateforme où se trouve votre code source
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ProviderTile
                  provider="github"
                  label="GitHub"
                  description="Dépôts publics et privés"
                  active={provider === 'github'}
                  onClick={() => setProvider('github')}
                />
                <ProviderTile
                  provider="gitlab"
                  label="GitLab"
                  description="Prochainement disponible"
                  active={provider === 'gitlab'}
                  disabled
                  onClick={() => setProvider('gitlab')}
                />
                <ProviderTile
                  provider="zip"
                  label="Archive ZIP"
                  description="Upload manuel"
                  active={provider === 'zip'}
                  disabled
                  onClick={() => setProvider('zip')}
                />
              </div>

              <AnimatePresence initial={false}>
                {provider === 'github' && (
                  <motion.div
                    key="github-panel"
                    initial={{ height: 0, opacity: 0, scale: 0.95 }}
                    animate={{ height: 'auto', opacity: 1, scale: 1 }}
                    exit={{ height: 0, opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 rounded-2xl border border-border/20 bg-gradient-to-br from-card/80 via-card/60 to-card/40 p-6 backdrop-blur-xl shadow-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <GitHubIcon className="h-8 w-8" />
                        <div>
                          <div className="font-semibold">Connexion GitHub</div>
                          <div className="text-sm text-muted-foreground">
                            Accédez à vos dépôts GitHub
                          </div>
                        </div>
                      </div>

                       {!githubConnected ? (
                        <div className="space-y-4">
                          <div className="text-sm text-muted-foreground">
                            Connectez votre compte GitHub pour importer un dépôt existant et générer automatiquement votre pipeline CI/CD.
                          </div>
                          <Button
                            type="button"
                            onClick={handleGithubConnect}
                            disabled={isConnecting}
                            className="w-full rounded-xl bg-[#24292f] hover:bg-[#1c2128] text-white"
                          >
                            <GitHubIcon className="mr-2 h-4 w-4" />
                            {isConnecting ? 'Ouverture…' : 'Se connecter avec GitHub'}
                          </Button>
                        </div>
                       ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle className="h-4 w-4" />
                            Connecté à GitHub
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher un dépôt…"
                                className="w-full rounded-lg border border-border/40 bg-background/50 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
                              />
                              <Button variant="outline" onClick={loadGithubRepos} className="rounded-xl">
                                Recharger
                              </Button>
                            </div>
                             <div className="custom-scroll max-h-80 overflow-auto rounded-xl border border-border/20 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-sm shadow-inner">
                              {loadingRepos && (
                                <div className="flex items-center justify-center p-8">
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
                                    Chargement des dépôts…
                                  </div>
                                </div>
                              )}
                              {reposError && (
                                <div className="p-6 text-center">
                                  <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                                    {reposError}
                                  </div>
                                </div>
                              )}
                               {!loadingRepos && !reposError && (
                                <div className="p-2 space-y-2">
                                  {repos
                                    .filter((r) =>
                                      search
                                        ? r.full_name.toLowerCase().includes(search.toLowerCase())
                                        : true
                                    )
                                    .slice(0, 100)
                                    .map((r) => (
                                      <motion.div
                                        key={r.full_name}
                                        onClick={() => handleUseRepo(r)}
                                        whileHover={{ scale: 1.01, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                                                                 className="group relative flex cursor-pointer items-center gap-4 rounded-xl border border-border/30 bg-gradient-to-r from-card/80 via-card/60 to-card/80 p-4 backdrop-blur-sm shadow-lg transition-all hover:border-border/50 hover:shadow-xl hover:shadow-primary/10 hover:from-card/90 hover:via-card/70 hover:to-card/90"
                                      >
                                        {/* Repository Icon */}
                                        <div className="flex-shrink-0">
                                          <div className="rounded-lg bg-primary/10 p-2 text-primary group-hover:bg-primary/20 transition-colors">
                                            <GitHubIcon className="h-5 w-5" />
                                          </div>
                                        </div>

                                        {/* Repository Info */}
                                        <div className="min-w-0 flex-1 space-y-1">
                                          <div className="flex items-center gap-2">
                                            <div className="truncate font-semibold text-foreground">
                                              {r.full_name}
                                            </div>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                              r.private
                                                ? 'bg-amber-500/15 text-amber-600 border border-amber-500/20'
                                                : 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20'
                                            }`}>
                                              {r.private ? 'Privé' : 'Public'}
                                            </span>
                                          </div>
                                          <div className="text-xs text-muted-foreground/80 truncate">
                                            {r.html_url}
                                          </div>
                                        </div>

                                        {/* Selection Badge */}
                                       <div className="pointer-events-none flex-shrink-0 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2">
                                          <div className="rounded-lg border border-green-500/30 bg-gradient-to-r from-green-500/20 to-green-400/20 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                                            <span className="text-xs font-semibold text-green-600">
                                              Sélectionner
                                            </span>
                                          </div>
                                        </div>

                                        {/* Hover Effect Overlay */}
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100"></div>
                                      </motion.div>
                                    ))}
                                  {repos.length === 0 && !loadingRepos && (
                                    <div className="flex flex-col items-center justify-center p-8 text-center">
                                      <div className="rounded-full bg-muted/50 p-4 mb-3">
                                        <GitHubIcon className="h-8 w-8 text-muted-foreground/50" />
                                      </div>
                                      <div className="text-sm text-muted-foreground">Aucun dépôt trouvé</div>
                                      <div className="text-xs text-muted-foreground/60 mt-1">
                                        Vérifiez vos permissions GitHub
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Project Configuration removed per request */}
      </div>
    </div>
  )
}

// Custom SVG Icons
function GitHubIcon({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

function GitLabIcon({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 0 0-.867 0L1.387 9.452.045 13.587a.924.924 0 0 0 .331 1.023L12 23.054l11.624-8.443a.924.924 0 0 0 .331-1.024"/>
    </svg>
  )
}

type ProviderTileProps = {
  readonly provider: 'github' | 'gitlab' | 'zip'
  readonly label: string
  readonly description: string
  readonly active?: boolean
  readonly disabled?: boolean
  readonly onClick?: () => void
}

function ProviderTile({ provider, label, description, active, disabled, onClick }: ProviderTileProps) {
  const getIcon = () => {
    switch (provider) {
      case 'github':
        return <GitHubIcon className="h-6 w-6" />
      case 'gitlab':
        return <GitLabIcon className="h-6 w-6" />
      case 'zip':
        return <Archive className="h-6 w-6" />
    }
  }

  const getColors = () => {
    if (disabled) return 'opacity-50'
    if (active) return 'border-primary/40 bg-primary/5 text-foreground shadow-lg'
    return 'border-border/40 bg-card/60 text-muted-foreground hover:bg-card/80 hover:shadow-md'
  }

  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all ${getColors()}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative">
        <div className="mb-3 rounded-xl bg-primary/10 p-3 text-primary w-fit">
          {getIcon()}
        </div>
        <div className="font-semibold">{label}</div>
        <div className="text-sm text-muted-foreground/80">{description}</div>
        {disabled && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            Bientôt disponible
          </div>
        )}
        {provider === 'github' && !disabled && (
          <div className="mt-2 flex items-center gap-2 text-xs text-primary">
            <ExternalLink className="h-3 w-3" />
            Connexion sécurisée
          </div>
        )}
      </div>
    </motion.button>
  )
}


