import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Activity } from 'lucide-react'
import { RunItem } from './RunItem'

type RunLite = { id: number; pipelineId: number; status: 'queued'|'running'|'success'|'failed'|'canceled'; createdAt?: string; finishedAt?: string | null }
type PipelineMap = Map<number, { id: number; name: string }>

export function LatestRunsSection({ runs, pipelineById, onRunClick }: { readonly runs: RunLite[]; readonly pipelineById: PipelineMap; readonly onRunClick?: (id: number) => void }) {
  return (
    <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" />
          Derniers runs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {runs.length === 0 && (
          <div className="text-sm text-muted-foreground">Aucun run récent</div>
        )}
        {runs.map((r) => {
          const pipeName = pipelineById.get(r.pipelineId)?.name ?? `pipeline #${r.pipelineId}`
          const status: 'success' | 'failed' | 'running' = r.status === 'failed' ? 'failed' : (r.status === 'running' || r.status === 'queued') ? 'running' : 'success'
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onRunClick?.(r.id)}
              aria-label={`Voir les détails du run #${r.id} du pipeline ${pipeName}`}
              className={`w-full rounded-lg text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${onRunClick ? 'hover:bg-card/60' : ''}`}
            >
              <RunItem status={status} pipeline={pipeName} time={r.createdAt ? new Date(r.createdAt).toLocaleString() : ''} duration={'—'} />
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}


