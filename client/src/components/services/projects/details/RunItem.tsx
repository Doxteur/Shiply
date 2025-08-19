import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export function RunItem({ status, pipeline, time, duration }: { readonly status: 'success' | 'failed' | 'running'; readonly pipeline: string; readonly time: string; readonly duration: string }) {
  const statusConfig = {
    success: { icon: CheckCircle, className: 'text-green-600' },
    failed: { icon: XCircle, className: 'text-red-600' },
    running: { icon: AlertCircle, className: 'text-blue-600 animate-pulse' },
  } as const

  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/30 bg-background/60 p-3 backdrop-blur-sm">
      <StatusIcon className={`h-4 w-4 ${config.className}`} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{pipeline}</div>
        <div className="text-xs text-muted-foreground">
          {time} • {duration}
        </div>
      </div>
    </div>
  )
}


