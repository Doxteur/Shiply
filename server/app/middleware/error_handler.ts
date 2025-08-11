import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { errors } from '@vinejs/vine'

export default class ErrorHandlerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    try {
      await next()
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        const messages = error.messages
        return ctx.response.status(422).json({
          success: false,
          error: {
            code: 'E_VALIDATION_ERROR',
            messages,
          },
        })
      }

      return ctx.response.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Une erreur est survenue',
        },
      })
    }
  }
}
