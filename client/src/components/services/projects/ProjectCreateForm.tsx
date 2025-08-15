import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/app/store'
import { createProject } from '@/app/features/projects/projectsSlice'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type ProjectCreateFormProps = {
  readonly initialName?: string
  readonly initialKey?: string
  readonly initialDescription?: string
  readonly onCreated?: () => void
}

export default function ProjectCreateForm({ initialName, initialKey, initialDescription, onCreated }: ProjectCreateFormProps) {
  const dispatch = useDispatch<AppDispatch>()

  const [name, setName] = useState(initialName ?? '')
  const [key, setKey] = useState(initialKey ?? '')
  const [description, setDescription] = useState(initialDescription ?? '')
  const [formError, setFormError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (typeof initialName === 'string') setName(initialName)
  }, [initialName])

  useEffect(() => {
    if (typeof initialKey === 'string') setKey(initialKey)
  }, [initialKey])

  useEffect(() => {
    if (typeof initialDescription === 'string') setDescription(initialDescription)
  }, [initialDescription])

  const canSubmit = useMemo(() => name.trim().length > 1 && key.trim().length > 1, [name, key])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!canSubmit) {
      setFormError('Veuillez renseigner un nom et une clé (≥ 2 caractères)')
      return
    }
    try {
      setCreating(true)
      await dispatch(createProject({ name: name.trim(), key: key.trim(), description: description.trim() || undefined })).unwrap()
      if (onCreated) {
        onCreated()
        return
      }
      setName('')
      setKey('')
      setDescription('')
    } catch (err) {
      setFormError(String(err))
    } finally {
      setCreating(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle>Créer un projet</CardTitle>
          <CardDescription>Définissez un nom, une clé unique et une description optionnelle.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm text-muted-foreground">Nom</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Shiply Frontend"
                className="w-full rounded-lg border border-border/40 bg-background/50 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
              />
            </div>
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm text-muted-foreground">Clé</label>
              <input
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                placeholder="Ex: WEB"
                className="w-full rounded-lg border border-border/40 bg-background/50 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
              />
            </div>
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm text-muted-foreground">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optionnel"
                className="w-full rounded-lg border border-border/40 bg-background/50 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
              />
            </div>
            <div className="md:col-span-3 flex items-center justify-end gap-3 pt-2">
              {formError && <span className="text-xs text-destructive">{formError}</span>}
              <Button type="submit" disabled={!canSubmit || creating} className="rounded-xl">
                {creating ? 'Création…' : 'Créer le projet'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
