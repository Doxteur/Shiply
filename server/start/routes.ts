/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const AuthController = () => import('#controllers/auth_controller')
const ProjectsController = () => import('#controllers/projects_controller')
const PipelinesController = () => import('#controllers/pipelines_controller')
const RunsController = () => import('#controllers/runs_controller')
const RunnersController = () => import('#controllers/runners_controller')
const JobsController = () => import('#controllers/jobs_controller')
const MetricsController = () => import('#controllers/metrics_controller')
const JobLogsController = () => import('#controllers/job_logs_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router.group(() => {
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

  // Pipelines
  router.post('/projects/:id/pipelines', [PipelinesController, 'store']).use(middleware.auth())

  // Runs
  router.get('/runs/:id', [RunsController, 'show']).use(middleware.auth())
  router.post('/pipelines/:id/run', [RunsController, 'trigger']).use(middleware.auth())

  // Runners
  router.post('/runners/heartbeat', [RunnersController, 'heartbeat'])
  router.post('/runners/claim', [RunnersController, 'claim'])

  // Metrics
  router.get('/metrics', [MetricsController, 'index'])

  // Jobs
  router.post('/jobs/:id/finish', [JobsController, 'finish'])
  router.post('/jobs/:id/logs', [JobLogsController, 'append'])
  router.get('/jobs/:id/logs', [JobLogsController, 'show'])
})
