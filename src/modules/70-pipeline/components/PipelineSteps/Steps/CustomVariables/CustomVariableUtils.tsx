/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import { Layout, SelectOption, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { StringKeys, useStrings } from 'framework/strings'
import css from './CustomVariables.module.scss'

export enum VariableType {
  String = 'String',
  Secret = 'Secret',
  Number = 'Number',
  Connector = 'Connector'
}

export const labelStringMap: Record<VariableType, StringKeys> = {
  [VariableType.String]: 'string',
  [VariableType.Secret]: 'secretType',
  [VariableType.Number]: 'number',
  [VariableType.Connector]: 'connector'
}

export const getVaribaleTypeOptions = (
  allowedVarialblesTypes: VariableType[] | undefined,
  getString: (key: StringKeys) => string
): SelectOption[] =>
  defaultTo(allowedVarialblesTypes, [VariableType.String, VariableType.Secret, VariableType.Number]).map(type => ({
    label: getString(labelStringMap[type]),
    value: type
  }))

export function NameTypeColumn(props: { name: string; type: string; required?: boolean }): React.ReactElement {
  const { name, type, required } = props
  const { getString } = useStrings()

  return (
    <Layout.Vertical className={css.nameTypeColumn}>
      <Layout.Horizontal spacing={'xsmall'} style={{ display: 'flex', alignItems: 'baseline' }}>
        <Text font={{ variation: FontVariation.SMALL_BOLD, size: 'normal' }} color={Color.BLACK} lineClamp={2}>
          {name}
        </Text>
        {!required && (
          <Text color={Color.GREY_500} font={{ size: 'small', weight: 'semi-bold' }}>
            {getString('common.optionalLabel')}
          </Text>
        )}
      </Layout.Horizontal>
      <Text font={{ size: 'small' }} color={Color.GREY_600}>
        {type}
      </Text>
    </Layout.Vertical>
  )
}
