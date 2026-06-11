import { v4 as uuidv4 } from 'uuid'

export abstract class Entity<Props> {
  public readonly _id: string
  public readonly props: Props

  constructor(props: Props, id?: string) {
    this.props = props
    this._id = id ?? uuidv4()
  }

  get id(): string {
    return this._id
  }
}