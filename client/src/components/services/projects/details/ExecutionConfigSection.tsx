import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Package, Server, Terminal } from 'lucide-react'

export function ExecutionConfigSection({ runMode, startCommand, dockerfilePath, composePath }: { readonly runMode?: string; readonly startCommand?: string; readonly dockerfilePath?: string; readonly composePath?: string }) {
  return (
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
              {runMode === 'command' && <Terminal className="h-4 w-4" />}
              {runMode === 'dockerfile' && <Package className="h-4 w-4" />}
              {runMode === 'compose' && <Server className="h-4 w-4" />}
            </div>
            <div>
              <div className="font-medium">Mode d'exécution</div>
              <div className="text-sm text-muted-foreground capitalize">{runMode ?? '—'}</div>
            </div>
          </div>
          {runMode === 'command' && (
            <div className="rounded-lg border border-border/20 bg-background/50 p-3 font-mono text-sm">{startCommand ?? '—'}</div>
          )}
          {runMode === 'dockerfile' && (
            <div className="rounded-lg border border-border/20 bg-background/50 p-3 font-mono text-sm">{dockerfilePath ?? 'Dockerfile'}</div>
          )}
          {runMode === 'compose' && (
            <div className="rounded-lg border border-border/20 bg-background/50 p-3 font-mono text-sm">{composePath ?? 'docker-compose.yml'}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


