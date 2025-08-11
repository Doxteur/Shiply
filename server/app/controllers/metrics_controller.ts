import type { HttpContext } from '@adonisjs/core/http'

export default class MetricsController {
  async index({ response }: HttpContext) {
    const content = [
      '# HELP shiply_up Shiply API up',
      '# TYPE shiply_up gauge',
      'shiply_up 1',
    ].join('\n')
    response.header('Content-Type', 'text/plain; version=0.0.4')
    return response.ok(content)
  }
}


