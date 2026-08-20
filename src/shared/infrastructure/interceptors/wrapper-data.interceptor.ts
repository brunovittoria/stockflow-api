import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable, map } from 'rxjs'

@Injectable()
export class WrapperDataInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((body: unknown) => {
        if (!body || typeof body !== 'object') return body
        if ('accessToken' in body) return body
        return { data: body }
      }),
    )
  }
}
