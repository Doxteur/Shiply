/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const ProjectsController = () => import('#controllers/projects_controller')
const PipelinesController = () => import('#controllers/pipelines_controller')
const RunsController = () => import('#controllers/runs_controller')
const RunnersController = () => import('#controllers/runners_controller')
const JobsController = () => import('#controllers/jobs_controller')
const MetricsController = () => import('#controllers/metrics_controller')
const JobLogsController = () => import('#controllers/job_logs_controller')
const GithubIntegrationsController = () => import('#controllers/github_integrations_controller')

router.group(() => {
  //test
  router.get('/test', () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    }
  })
  router.post('/auth/login', [AuthController, 'login'])

  router.post('/auth/register', [AuthController, 'register'])

  // health check
  router.get('/health', () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    }
  })

  // Projects
  router.get('/projects', [ProjectsController, 'index']).use(middleware.auth())
  router.post('/projects', [ProjectsController, 'store']).use(middleware.auth())
  router.patch('/projects/:id/config', [ProjectsController, 'updateConfig']).use(middleware.auth())

  // Pipelines
  router.get('/projects/:id/pipelines', [PipelinesController, 'index']).use(middleware.auth())
  router.post('/projects/:id/pipelines', [PipelinesController, 'store']).use(middleware.auth())

  // Runs
  router.get('/runs/:id', [RunsController, 'show']).use(middleware.auth())
  router.post('/pipelines/:id/run', [RunsController, 'trigger']).use(middleware.auth())
  router.get('/runs/:id/jobs', [RunsController, 'jobs']).use(middleware.auth())
  router
    .get('/projects/:id/runs/latest', [RunsController, 'latestByProject'])
    .use(middleware.auth())
  router.get('/projects/:id/runs/stats', [RunsController, 'statsByProject']).use(middleware.auth())

  // Runners
  router.post('/runners/heartbeat', [RunnersController, 'heartbeat'])
  router.post('/runners/claim', [RunnersController, 'claim'])

  // Metrics
  router.get('/metrics', [MetricsController, 'index'])

  // Jobs
  router.post('/jobs/:id/finish', [JobsController, 'finish'])
  router.post('/jobs/:id/logs', [JobLogsController, 'append'])
  router.get('/jobs/:id/logs', [JobLogsController, 'show'])
  router.get('/jobs/:id/logs/stream', [JobLogsController, 'stream'])

  // Integrations: GitHub OAuth
  router
    .get('/integrations/github/authorize', [GithubIntegrationsController, 'authorize'])
    .use(middleware.auth())
  // callback ne doit pas exiger l'auth côté client; on valide via state signé
  router.get('/integrations/github/callback', [GithubIntegrationsController, 'callback'])
  router
    .get('/integrations/github/status', [GithubIntegrationsController, 'status'])
    .use(middleware.auth())
  router
    .get('/integrations/github/repos', [GithubIntegrationsController, 'repos'])
    .use(middleware.auth())
})
