import { Validation } from '@common/components/ConfigureOptions/ConfigureOptionsUtils'

export enum RuntimeInputType {
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  object = 'object'
}

export const DEFAULT_RUNTIME_INPUT = {
  name: '',
  type: 'string',
  selected: false,
  validator: {
    validation: Validation.None,
    allowed: []
  }
}
