import type { LucideIcon } from 'lucide-react'

export function ConfigItem({ icon: Icon, label, value }: { readonly icon: LucideIcon; readonly label: string; readonly value: string }) {
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


