/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, ReactElement } from 'react'
import { Layout, MultiSelectOption, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { IItemRendererProps } from '@blueprintjs/select'
import { Menu } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import css from './MultiSelectListItem.module.scss'

export interface MultiSelectListItemProps {
  label: MultiSelectOption['label']
  value: MultiSelectOption['value']
  handleClick: IItemRendererProps['handleClick']
}

const MultiSelectListItem: FC<MultiSelectListItemProps> = ({ label, value, handleClick }) => {
  const { getString } = useStrings()

  return (
    <Menu.Item
      className={css.item}
      text={
        <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
          <input type="checkbox" readOnly value={value.toString()} className={css.checkbox} />
          <div>
            <Text lineClamp={1} font={{ variation: FontVariation.FORM_INPUT_TEXT }}>
              {label}
            </Text>
            <Text lineClamp={1} font={{ variation: FontVariation.FORM_INPUT_TEXT }} color={Color.GREY_400}>
              {getString('idLabel')}
              {value}
            </Text>
          </div>
        </Layout.Horizontal>
      }
      onClick={handleClick}
    />
  )
}

export const renderMultiSelectListItem = (item: MultiSelectOption, itemProps: IItemRendererProps): ReactElement => (
  <MultiSelectListItem {...item} {...itemProps} key={item.value.toString()} />
)

export default MultiSelectListItem
