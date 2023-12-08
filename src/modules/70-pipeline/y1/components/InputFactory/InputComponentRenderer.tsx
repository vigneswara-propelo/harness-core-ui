/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@harness/uicore'
import { defaultTo, get } from 'lodash-es'
import { InputProps } from './InputComponent'

export interface InputComponentRendererProps<T = unknown> extends InputProps<T> {
  children?: React.ReactNode
}

export function InputComponentRenderer<T = unknown>({
  path,
  factory,
  onUpdate,
  onChange,
  readonly,
  allowableTypes,
  initialValues,
  input
}: InputComponentRendererProps<T>): JSX.Element | null {
  const internalType = defaultTo(get(input, 'metadata.internal_type'), get(input, 'internal_type'))
  const primitiveType = input.type
  const inputComponent = factory?.getComponent<T>(internalType)
  // Fallback to primitive component
  const baseComponent = factory?.getComponent<T>(primitiveType)

  const commonProps = {
    path,
    initialValues,
    onUpdate,
    onChange,
    factory,
    readonly,
    allowableTypes,
    input
  }

  if (!inputComponent) {
    if (baseComponent) {
      return baseComponent.renderComponent(commonProps)
    }
    return __DEV__ ? <Text intent="warning">Input component not found</Text> : null
  } else {
    return inputComponent.renderComponent(commonProps)
  }
}
