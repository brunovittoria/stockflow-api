import { FieldsErrors } from '../validators/validator-fields.interface'

export class EntityValidationError extends Error {
  constructor(public errors: FieldsErrors) {
    super('Entity validation failed')
    this.name = 'EntityValidationError'
  }
}
