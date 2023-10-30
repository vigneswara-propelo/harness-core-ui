/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes } from '@harness/uicore'
import { InputComponentType } from './InputComponentType'
import { InputFactory } from './InputFactory'
import { UIRuntimeInput } from '../InputsForm/types'

export interface InputProps<T> {
  initialValues?: T
  onUpdate?: (data: T) => void
  onChange?: (data: T) => void
  factory: InputFactory
  path: string
  readonly?: boolean
  allowableTypes: AllowedTypes
  input: UIRuntimeInput
}

export abstract class InputComponent<T> {
  public abstract internalType: InputComponentType

  getType(): string {
    return this.internalType
  }

  abstract renderComponent(props: InputProps<T>): JSX.Element
}
