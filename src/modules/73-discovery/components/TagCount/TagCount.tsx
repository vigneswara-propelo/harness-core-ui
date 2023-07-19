/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Icon, IconName, Layout, Tag, Text } from '@harness/uicore'
import { Color, Intent } from '@harness/design-system'
import React from 'react'
import { PopoverInteractionKind, Tooltip } from '@blueprintjs/core'
import { cloneDeep } from 'lodash-es'
import css from './TagCount.module.scss'

export interface TagCountProps {
  tagItems: string[]
  icon?: IconName
  tagCount: number
  tooltipHeader: string
}
export default function TagCount({ tagItems, icon, tagCount, tooltipHeader }: TagCountProps): React.ReactElement {
  const deepClonedItems = cloneDeep(tagItems)
  const splicedItems = deepClonedItems.splice(0, tagCount)
  return (
    <Layout.Horizontal>
      {splicedItems.map(item => {
        return (
          <div key={item} className={css.tag}>
            <Tag intent={Intent.PRIMARY}>{item}</Tag>
          </div>
        )
      })}
      {deepClonedItems.length > 0 && (
        <Tooltip
          interactionKind={PopoverInteractionKind.HOVER}
          hoverCloseDelay={500}
          content={
            <Layout.Vertical spacing={'small'} style={{ padding: 10 }}>
              <Text color={Color.WHITE} font={{ weight: 'bold' }}>
                {tooltipHeader}
              </Text>
              {deepClonedItems.map(item => {
                return (
                  <div key={item} style={{ display: 'flex', alignItems: 'center' }}>
                    {icon && (
                      <div className={css.iconDiv}>
                        <Icon name={icon} size={14} className={css.moduleIcons} />
                      </div>
                    )}
                    <Text color={Color.WHITE} margin={{ left: 'small' }}>
                      {item}
                    </Text>
                  </div>
                )
              })}
            </Layout.Vertical>
          }
        >
          <Tag intent={Intent.NONE} style={{ marginRight: 10 }}>
            {`+${deepClonedItems.length}`}
          </Tag>
        </Tooltip>
      )}
    </Layout.Horizontal>
  )
}
