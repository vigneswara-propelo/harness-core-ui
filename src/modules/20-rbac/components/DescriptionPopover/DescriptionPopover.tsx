/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { PopoverInteractionKind, Position } from '@blueprintjs/core'
import { Icon, Layout, Popover, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'

export default function DescriptionPopover({ description }: { description: string }): React.ReactElement | null {
  const { getString } = useStrings()
  if (!description) return null
  return (
    <Popover position={Position.TOP} interactionKind={PopoverInteractionKind.HOVER}>
      <Icon name="description" width={16} height={20} />
      <Layout.Vertical spacing="small" padding="medium" style={{ maxWidth: 400 }}>
        <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL_SEMI, weight: 'bold' }}>
          {getString('description')}
        </Text>
        <Text color={Color.PRIMARY_9} font={{ variation: FontVariation.SMALL }}>
          {description}
        </Text>
      </Layout.Vertical>
    </Popover>
  )
}
