import { forwardRef } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { GitBranch, Folder } from 'lucide-react'
import { ConfigItem } from './ConfigItem'

export const RepoSection = forwardRef<HTMLDivElement, { readonly defaultBranch?: string; readonly rootPath?: string }>(
  ({ defaultBranch, rootPath }, ref) => {
    return (
      <Card ref={ref} className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GitBranch className="h-5 w-5 text-primary" />
            Configuration du référentiel
          </CardTitle>
          <CardDescription>Paramètres du dépôt Git et organisation du code</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ConfigItem icon={GitBranch} label="Branche par défaut" value={defaultBranch ?? 'main'} />
          <ConfigItem icon={Folder} label="Chemin racine" value={rootPath ?? '/'} />
        </CardContent>
      </Card>
    )
  }
)


