export type FieldsErrors = {
  [field: string]: string[]
}

export interface ValidatorFieldsInterface<ValidatedProps> {
  errors: FieldsErrors
  validatedData: ValidatedProps | null
  validate(data: any): boolean
}
