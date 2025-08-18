import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

export function StatsCard({ icon: Icon, title, value, trend, color }: { readonly icon: LucideIcon; readonly title: string; readonly value: string; readonly trend: string; readonly color: string }) {
  const colorClasses = {
    green: 'text-green-600 bg-green-500/10',
    blue: 'text-blue-600 bg-blue-500/10',
    purple: 'text-purple-600 bg-purple-500/10',
    emerald: 'text-emerald-600 bg-emerald-500/10',
  } as const

  return (
    <motion.div whileHover={{ y: -2, scale: 1.01 }} transition={{ duration: 0.2 }}>
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


