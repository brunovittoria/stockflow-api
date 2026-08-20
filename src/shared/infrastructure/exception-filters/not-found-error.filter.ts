import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { Response } from 'express'
import { NotFoundError } from '@/shared/domain/errors'

@Catch(NotFoundError)
export class NotFoundErrorFilter implements ExceptionFilter {
  catch(exception: NotFoundError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()
    response.status(404).json({
      statusCode: 404,
      error: 'Not Found',
      message: exception.message,
    })
  }
}
