import { randomUUID } from 'crypto'

export abstract class Entity<Props> {
  public readonly _id: string
  public readonly props: Props

  constructor(props: Props, id?: string) {
    this.props = props
    this._id = id ?? randomUUID()
  }

  get id(): string {
    return this._id
  }
}