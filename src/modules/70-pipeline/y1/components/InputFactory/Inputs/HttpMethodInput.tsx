/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput, SelectOption } from '@harness/uicore'
import { InputsFormValues } from '../../InputsForm/InputsForm'
import { InputComponent, InputProps } from '../InputComponent'
import { DerivedInputType } from '../InputComponentType'

export const httpStepType: SelectOption[] = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'HEAD', label: 'HEAD' },
  { value: 'OPTIONS', label: 'OPTIONS' },
  { value: 'PATCH', label: 'PATCH' }
]

function HttpMethodInputInternal(props: InputProps<InputsFormValues>): JSX.Element {
  const { allowableTypes, readonly, path, input } = props
  const { label = '' } = input
  return (
    <FormInput.MultiTypeInput
      selectItems={httpStepType}
      useValue
      disabled={readonly}
      multiTypeInputProps={{
        expressions: [],
        disabled: readonly,
        allowableTypes
      }}
      label={label}
      name={path}
    />
  )
}

export class HttpMethodInput extends InputComponent<InputsFormValues> {
  public internalType = DerivedInputType.http_method

  constructor() {
    super()
  }

  renderComponent(props: InputProps<InputsFormValues>): JSX.Element {
    return <HttpMethodInputInternal {...props} />
  }
}
