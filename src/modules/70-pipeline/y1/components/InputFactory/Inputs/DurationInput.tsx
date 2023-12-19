/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useRuntimeInput } from '@modules/70-pipeline/y1/hooks/useRuntimeInput'
import { InputsFormValues } from '../../InputsForm/InputsForm'
import { InputComponent, InputProps } from '../InputComponent'
import { PrimitiveInputType } from '../InputComponentType'
import { RuntimeInputType } from '../../InputsForm/types'

function DurationInputInternal(props: InputProps<InputsFormValues>): JSX.Element {
  const { allowableTypes, readonly, path, input } = props
  const { label = '' } = input
  const { renderRuntimeInput } = useRuntimeInput({ type: RuntimeInputType.string })

  return (
    <FormMultiTypeDurationField
      name={path}
      label={label}
      disabled={readonly}
      multiTypeDurationProps={{
        enableConfigureOptions: false,
        expressions: [],
        disabled: readonly,
        allowableTypes,
        renderRuntimeInput
      }}
    />
  )
}

export class DurationInput extends InputComponent<InputsFormValues> {
  public internalType = PrimitiveInputType.duration

  constructor() {
    super()
  }

  renderComponent(props: InputProps<InputsFormValues>): JSX.Element {
    return <DurationInputInternal {...props} />
  }
}
