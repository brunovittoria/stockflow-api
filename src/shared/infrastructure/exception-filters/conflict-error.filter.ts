import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { Response } from 'express'
import { ConflictError } from '@/shared/domain/errors'

@Catch(ConflictError)
export class ConflictErrorFilter implements ExceptionFilter {
  catch(exception: ConflictError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()
    response.status(409).json({
      statusCode: 409,
      error: 'Conflict',
      message: exception.message,
    })
  }
}
