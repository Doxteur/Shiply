import { forwardRef } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GitCommit, Play, Download } from 'lucide-react'

type PipelineLite = { id: number; name: string; version: string }

export const PipelinesSection = forwardRef<HTMLDivElement, { readonly pipelines: PipelineLite[]; readonly onTriggerRun: (id: number) => void; readonly onSyncFromRepo?: () => void }>(
  ({ pipelines, onTriggerRun, onSyncFromRepo }, ref) => {
    return (
      <Card ref={ref} className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GitCommit className="h-5 w-5 text-primary" />
            Pipelines du projet
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span>Liste des pipelines configurés pour ce projet</span>
            <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={onSyncFromRepo}>
              <Download className="mr-2 h-4 w-4" /> Synchroniser depuis le dépôt
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pipelines.length === 0 && (
            <div className="text-sm text-muted-foreground">Aucun pipeline configuré</div>
          )}
          {pipelines.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/60 px-4 py-3 backdrop-blur-sm">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">v{p.version}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" className="rounded-lg bg-primary hover:bg-primary/90" onClick={() => onTriggerRun(p.id)}>
                  <Play className="mr-2 h-4 w-4" /> Déclencher
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }
)


