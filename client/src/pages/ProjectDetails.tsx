import { useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import {
  fetchProjects,
  selectAllProjects,
} from "@/app/features/projects/projectsSlice";
import { fetchPipelines, syncPipelineFromRepo } from "@/app/features/pipelines/pipelinesSlice";
import {
  fetchLatestRunsByProject,
  fetchProjectRunStats,
  triggerRun,
} from "@/app/features/runs/runsSlice";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  GitBranch,
  Settings,
  Play,
  GitCommit,
  Activity,
  Clock,
  Code,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { QuickActionCard } from "@/components/services/projects/details/QuickActionCard";
import { StatsCard } from "@/components/services/projects/details/StatsCard";
import { RepoSection } from "@/components/services/projects/details/RepoSection";
import { PipelinesSection } from "@/components/services/projects/details/PipelinesSection";
import { ExecutionConfigSection } from "@/components/services/projects/details/ExecutionConfigSection";
import { EnvVarsSection } from "@/components/services/projects/details/EnvVarsSection";
import { LatestRunsSection } from "@/components/services/projects/details/LatestRunsSection";

export default function ProjectDetails() {
  const { id } = useParams();
  const projectId = Number(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const projects = useSelector(selectAllProjects);
  const loading = useSelector((s: RootState) => s.projects.loading);
  const pipelines = useSelector(
    (s: RootState) => s.pipelines.byProjectId[projectId] ?? []
  );
  const runsState = useSelector((s: RootState) => s.runs);
  const latestRunIds = runsState.latestByProjectId[projectId] ?? [];
  const latestRuns = latestRunIds
    .map((rid) => runsState.byId[rid])
    .filter(Boolean);
  const runStats = runsState.statsByProjectId[projectId];
  const pipelinesRef = useRef<HTMLDivElement | null>(null);
  const execConfigRef = useRef<HTMLDivElement | null>(null);

  const metrics = useMemo(() => {
    const completed = latestRuns.filter((r) => r.finishedAt && r.startedAt);
    const successCount = completed.filter((r) => r.status === "success").length;
    const failedCount = completed.filter((r) => r.status === "failed").length;
    const canceledCount = completed.filter(
      (r) => r.status === "canceled"
    ).length;
    const denominator = successCount + failedCount + canceledCount;
    const successRate =
      denominator > 0 ? Math.round((successCount / denominator) * 100) : null;

    const durationsMs = completed
      .map((r) => {
        const start = new Date(r.startedAt as string).getTime();
        const end = new Date(r.finishedAt as string).getTime();
        return Math.max(0, end - start);
      })
      .filter((v) => Number.isFinite(v) && v > 0);

    const avgMs =
      durationsMs.length > 0
        ? Math.round(
            durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length
          )
        : null;
    return { successRate, avgMs };
  }, [latestRuns]);

  const project = useMemo(
    () => projects.find((p: { id: number }) => p.id === projectId),
    [projects, projectId]
  );
  const repoUrl = (
    project as unknown as { config?: { repositoryUrl?: string } }
  )?.config?.repositoryUrl;

  useEffect(() => {
    if (!project) dispatch(fetchProjects());
  }, [dispatch, project]);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchPipelines({ projectId }));
      dispatch(fetchLatestRunsByProject({ projectId }));
      dispatch(fetchProjectRunStats({ projectId }));
    }
  }, [dispatch, projectId]);

  async function handleTriggerRun(pipelineId?: number) {
    const idToRun = pipelineId ?? pipelines[0]?.id;
    if (!idToRun) return;
    await dispatch(triggerRun({ pipelineId: idToRun }));
    dispatch(fetchLatestRunsByProject({ projectId }));
    dispatch(fetchProjectRunStats({ projectId }));
  }

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header avec navigation */}
      <div className="sticky top-0 z-10 border-b border-border/20 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <Button
            variant="outline"
            onClick={() => navigate("/projects")}
            className="rounded-xl border-border/40 bg-background/50 backdrop-blur-sm hover:bg-background/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Projets
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              {project?.name || (loading ? "Chargement…" : "Projet inconnu")}
            </h1>
            {project && (
              <div className="text-sm text-muted-foreground">
                <Badge
                  variant="outline"
                  className="mr-2 text-xs font-mono bg-background/50"
                >
                  {project.key}
                </Badge>
                Configuration et aperçu du projet
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleTriggerRun()}
              className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              <Play className="mr-2 h-4 w-4" /> Déclencher Run
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-border/40 bg-background/50 backdrop-blur-sm hover:bg-background/80"
            >
              <Settings className="mr-2 h-4 w-4" /> Configurer
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {/* Section Hero du projet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
            <CardContent className="relative p-8">
              {project?.description && (
                <div className="mb-6 rounded-xl border border-border/30 bg-background/60 p-4 text-muted-foreground backdrop-blur-sm">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground/80">
                    <Code className="h-4 w-4" />
                    Description
                  </div>
                  {project.description}
                </div>
              )}

              {/* Actions rapides */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <QuickActionCard
                  icon={Play}
                  title="Nouveau Run"
                  description="Déclencher pipeline"
                  onClick={() => handleTriggerRun()}
                />
                <QuickActionCard
                  icon={GitCommit}
                  title="Pipelines"
                  description={`${pipelines.length} configurés`}
                  onClick={() =>
                    pipelinesRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                />
                <QuickActionCard
                  icon={Activity}
                  title="Historique"
                  description={runStats ? `${runStats.total} runs` : "—"}
                  onClick={() => navigate(`/projects/${projectId}/runs`)}
                />
                <QuickActionCard
                  icon={Settings}
                  title="Configurer"
                  description="Modifier setup"
                  onClick={() =>
                    execConfigRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistiques rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatsCard
            icon={CheckCircle}
            title="Taux de succès"
            value={
              metrics.successRate !== null ? `${metrics.successRate}%` : "—"
            }
            trend="—"
            color="green"
          />
          <StatsCard
            icon={Clock}
            title="Durée moyenne"
            value={metrics.avgMs !== null ? formatDuration(metrics.avgMs) : "—"}
            trend="—"
            color="blue"
          />
          <StatsCard
            icon={GitCommit}
            title="Runs (total)"
            value={runStats ? String(runStats.total) : "—"}
            trend={
              runStats ? `${runStats.success} ok / ${runStats.failed} ko` : "—"
            }
            color="purple"
          />
          <StatsCard
            icon={Activity}
            title="Dernier run"
            value={latestRuns[0]?.status ?? "—"}
            trend={
              latestRuns[0]?.status === "success"
                ? "ok"
                : (latestRuns[0]?.status ?? "—")
            }
            color="emerald"
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Configuration principale */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <PipelinesSection
              ref={pipelinesRef}
              pipelines={
                pipelines as Array<{
                  id: number;
                  name: string;
                  version: string;
                }>
              }
              onTriggerRun={(id) => handleTriggerRun(id)}
              onSyncFromRepo={() => dispatch(syncPipelineFromRepo({ projectId }))}
            />

            <RepoSection
              ref={execConfigRef}
              defaultBranch={
                (project as unknown as { config: { defaultBranch?: string } })
                  ?.config?.defaultBranch
              }
              rootPath={
                (project as unknown as { config: { rootPath?: string } })
                  ?.config?.rootPath
              }
            />

            <ExecutionConfigSection
              runMode={
                (project as unknown as { config: { runMode?: string } })?.config
                  ?.runMode
              }
              startCommand={
                (project as unknown as { config: { startCommand?: string } })
                  ?.config?.startCommand
              }
              dockerfilePath={
                (project as unknown as { config: { dockerfilePath?: string } })
                  ?.config?.dockerfilePath
              }
              composePath={
                (project as unknown as { config: { composePath?: string } })
                  ?.config?.composePath
              }
            />

            <EnvVarsSection
              envVars={
                (
                  project as unknown as {
                    config: { envVars?: Array<{ key: string; value: string }> };
                  }
                )?.config?.envVars
              }
            />
          </motion.div>

          {/* Sidebar avec informations supplémentaires */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            <LatestRunsSection
              runs={
                latestRuns as Array<{
                  id: number;
                  pipelineId: number;
                  status:
                    | "queued"
                    | "running"
                    | "success"
                    | "failed"
                    | "canceled";
                  createdAt?: string;
                  finishedAt?: string | null;
                }>
              }
              pipelineById={
                new Map(
                  pipelines.map((p: { id: number; name: string }) => [
                    p.id,
                    { id: p.id, name: p.name },
                  ])
                )
              }
              onRunClick={(rid) => navigate(`/runs/${rid}`)}
            />

            {/* Actions rapides */}
            <Card className="border-0 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-lg border-border/40 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                  onClick={() => {
                    if (repoUrl) window.open(repoUrl, "_blank");
                  }}
                >
                  <GitBranch className="mr-2 h-4 w-4" /> Voir le dépôt
                </Button>
                <Button
                  onClick={() => navigate(`/projects/${projectId}/runs`)}
                  variant="outline"
                  className="w-full justify-start rounded-lg border-border/40 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                >
                  <Activity className="mr-2 h-4 w-4" /> Historique complet
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-lg border-border/40 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                >
                  <Settings className="mr-2 h-4 w-4" /> Modifier config
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}
