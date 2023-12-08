/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput } from '@harness/uicore'
import { PrimitiveInputType } from '../InputComponentType'
import { InputComponent, InputProps } from '../InputComponent'
import { InputsFormValues } from '../../InputsForm/InputsForm'

function TextAreaInternal(props: InputProps<InputsFormValues>): JSX.Element {
  const { readonly, path, input } = props
  const { label = '' } = input

  return <FormInput.TextArea label={label} name={path} disabled={readonly} />
}

export class TextAreaInput extends InputComponent<InputsFormValues> {
  public internalType = PrimitiveInputType.text_area

  constructor() {
    super()
  }

  renderComponent(props: InputProps<InputsFormValues>): JSX.Element {
    return <TextAreaInternal {...props} />
  }
}
