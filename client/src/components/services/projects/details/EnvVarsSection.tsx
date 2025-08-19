import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Code, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

export function EnvVarsSection({ envVars }: { readonly envVars?: Array<{ key: string; value: string }> }) {
  return (
    <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Code className="h-5 w-5 text-primary" />
          Variables d'environnement
        </CardTitle>
        <CardDescription>Configuration des variables pour le déploiement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {Array.isArray(envVars) && envVars.length > 0 ? (
            envVars.map((v, idx) => (
              <motion.div key={`${v.key}-${idx}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/60 px-4 py-3 backdrop-blur-sm">
                <span className="font-mono text-sm font-medium text-muted-foreground">{v.key}</span>
                <span className="font-mono text-sm text-foreground">{v.value}</span>
              </motion.div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border/40 bg-background/30 p-8 text-center">
              <Code className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <div className="mt-2 text-sm text-muted-foreground">Aucune variable configurée</div>
              <Button variant="outline" size="sm" className="mt-3 rounded-lg">
                <Plus className="mr-2 h-4 w-4" /> Ajouter une variable
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


