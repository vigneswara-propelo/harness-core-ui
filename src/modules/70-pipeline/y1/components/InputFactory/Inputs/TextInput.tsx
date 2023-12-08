/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput } from '@harness/uicore'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { PrimitiveInputType } from '../InputComponentType'
import { InputComponent, InputProps } from '../InputComponent'
import { InputsFormValues } from '../../InputsForm/InputsForm'

function TextInputInternal(props: InputProps<InputsFormValues>): JSX.Element {
  const { allowableTypes, readonly, path, input } = props
  const { label = '' } = input
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  return (
    <FormInput.MultiTextInput
      name={path}
      label={label}
      disabled={readonly}
      multiTextInputProps={{
        newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
        defaultValueToReset: '',
        expressions,
        textProps: {
          disabled: readonly,
          type: 'text'
        },
        allowableTypes
      }}
    />
  )
}

export class TextInput extends InputComponent<InputsFormValues> {
  public internalType = PrimitiveInputType.string

  constructor() {
    super()
  }

  renderComponent(props: InputProps<InputsFormValues>): JSX.Element {
    return <TextInputInternal {...props} />
  }
}
