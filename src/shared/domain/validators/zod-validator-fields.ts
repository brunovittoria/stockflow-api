import { ZodSchema, ZodError } from 'zod'
import {
  FieldsErrors,
  ValidatorFieldsInterface,
} from './validator-fields.interface'

export class ZodValidatorFields<
  ValidatedProps,
> implements ValidatorFieldsInterface<ValidatedProps> {
  errors: FieldsErrors = {}
  validatedData: ValidatedProps | null = null

  constructor(private schema: ZodSchema) {}

  validate(data: any): boolean {
    const result = this.schema.safeParse(data)

    if (!result.success) {
      this.errors = this.formatErrors(result.error)
      return false
    }

    this.validatedData = result.data as ValidatedProps
    return true
  }

  private formatErrors(error: ZodError): FieldsErrors {
    const formatted: FieldsErrors = {}

    for (const issue of error.issues) {
      const field = issue.path.join('.')
      if (!formatted[field]) formatted[field] = []
      formatted[field].push(issue.message)
    }

    return formatted
  }
}
