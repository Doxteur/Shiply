import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

export function QuickActionCard({ icon: Icon, title, description, onClick }: { readonly icon: LucideIcon; readonly title: string; readonly description: string; readonly onClick?: () => void }) {
  return (
    <motion.div whileHover={{ y: -2, scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Card onClick={onClick} className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-sm shadow-lg transition-all hover:shadow-xl cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
        <CardContent className="relative flex items-center gap-3 p-4">
          <div className="rounded-lg bg-primary/10 p-2 text-primary transition-all group-hover:bg-primary/20 group-hover:scale-110">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm">{title}</div>
            <div className="text-xs text-muted-foreground">{description}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}


