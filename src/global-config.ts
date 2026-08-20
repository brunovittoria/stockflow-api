import { INestApplication } from '@nestjs/common'
import { WrapperDataInterceptor } from './shared/infrastructure/interceptors/wrapper-data.interceptor'
import { NotFoundErrorFilter } from './shared/infrastructure/exception-filters/not-found-error.filter'
import { ConflictErrorFilter } from './shared/infrastructure/exception-filters/conflict-error.filter'

export function applyGlobalConfig(app: INestApplication): void {
  app.useGlobalInterceptors(new WrapperDataInterceptor())
  app.useGlobalFilters(new NotFoundErrorFilter(), new ConflictErrorFilter())
}
