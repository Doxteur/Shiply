import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Rocket, Shield, Activity, GitBranch } from 'lucide-react'

const FeatureItem: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => {
  return (
    <div className="group relative rounded-xl border bg-card/70 backdrop-blur-sm overflow-hidden">
      {/* animated background */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-700"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, color-mix(in oklab, var(--color-primary), transparent 92%) 50%, transparent 70%)',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 3s ease-in-out infinite',
        }}
      />
      <div className="relative flex items-start gap-4 p-4 transition-all duration-300 group-hover:-translate-y-0.5">
        <div className="mt-1 text-primary">{icon}</div>
        <div>
          <div className="text-base font-semibold tracking-tight">{title}</div>
          <div className="mt-1 text-sm text-muted-foreground leading-relaxed">{desc}</div>
        </div>
      </div>
    </div>
  )
}

const Landing: React.FC = () => {
  return (
    <main className="relative min-h-[100dvh] bg-gradient-to-b from-background via-background to-primary/5">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-40 dark:opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(120,120,120,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,120,120,0.08) 1px, transparent 1px)",
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(75% 55% at 50% 10%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(75% 55% at 50% 10%, black 40%, transparent 100%)',
          }}
        />
        {/* Conic gradient spinner */}
        <div
          className="absolute left-1/2 top-1/2 h-[60rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl motion-safe:animate-[spin_24s_linear_infinite]"
          style={{
            background:
              'conic-gradient(from 0deg, color-mix(in oklab, var(--color-primary), transparent 75%), transparent 25%, color-mix(in oklab, var(--color-secondary), transparent 80%), transparent 50%, color-mix(in oklab, var(--color-primary), transparent 80%), transparent 75%, color-mix(in oklab, var(--color-secondary), transparent 75%))',
          }}
        />
        {/* Glow */}
        <div className="absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        {/* Orbs */}
        <div className="absolute -top-16 -left-12 h-72 w-72 rounded-full bg-primary/30 blur-3xl opacity-70 motion-safe:animate-pulse" />
        <div className="absolute -bottom-20 -right-12 h-80 w-80 rounded-full bg-secondary/30 blur-3xl opacity-60 motion-safe:animate-pulse" />
        {/* Noise overlay */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{
          backgroundImage:
            'url("data:image/svg+xml;utf8,<?xml version=\'1.0\' encoding=\'UTF-8\'?><svg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\' viewBox=\'0 0 160 160\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.35\'/></svg>")',
          backgroundSize: '160px 160px',
        }} />
      </div>

      {/* Nav (minimal) */}
      <header className="container mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <Rocket className="size-5 text-primary" />
          <span className="text-sm font-semibold tracking-wide">Shiply</span>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Button variant="ghost" asChild>
            <a href="/login">Se connecter</a>
          </Button>
          <Button asChild>
            <a href="/projects">Ouvrir l’app</a>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 pb-16 pt-6 sm:pb-24 sm:pt-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <Badge className="rounded-full">MVP</Badge>
            <span className="text-xs text-muted-foreground">CI/CD self‑hostable</span>
          </div>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Piloter vos pipelines avec un workflow simple et moderne
          </h1>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            Shiply permet de créer, exécuter et suivre des pipelines DevOps, avec logs en temps réel,
            drivers de déploiement et intégration Docker. Le tout en TypeScript strict.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <a href="/login" className="">Commencer</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/about">Découvrir</a>
            </Button>
          </div>
        </div>

                 {/* Feature highlights */}
         <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2">
          <FeatureItem
            icon={<Activity className="size-5" />}
            title="Exécutions en temps réel"
            desc="Logs en streaming SSE, statut agrégé des jobs et annulation coopérative."
          />
          <FeatureItem
            icon={<GitBranch className="size-5" />}
            title="Synchronisation Git"
            desc="Pipelines YAML versionnés dans le dépôt, auto‑sync à la création."
          />
          <FeatureItem
            icon={<Shield className="size-5" />}
            title="Qualité & sécurité"
            desc="Lint, tests, scans et bonnes pratiques intégrés au flux CI."
          />
          <FeatureItem
            icon={<Rocket className="size-5" />}
            title="Déploiement flexible"
            desc="Drivers compose, dockerfile ou command, adaptés à vos environnements."
          />
        </div>
      </section>
    </main>
  )
}

export default Landing


