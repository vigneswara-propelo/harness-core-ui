/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { capitalize } from 'lodash-es'
import { Button, ButtonVariation, Layout, Text, Popover, Icon } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { PopoverInteractionKind, Classes, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import css from './ResourceCenter.module.scss'

export const CommunitySubmitTicket: React.FC = () => {
  const { getString } = useStrings()

  const tooltip = (
    <Layout.Vertical className={css.communityTooltip} spacing={'medium'} padding={'medium'}>
      <Text
        icon="flash"
        color={Color.ORANGE_800}
        font={{ variation: FontVariation.FORM_MESSAGE_WARNING, weight: 'bold' }}
        iconProps={{ color: Color.ORANGE_800, size: 25 }}
        padding={{ bottom: 'xsmall' }}
      >
        {getString('common.levelUp')}
      </Text>
      <Text color={Color.WHITE}>{getString('common.resourceCenter.communityLevelUp')}</Text>
      <Button
        variation={ButtonVariation.PRIMARY}
        width={'fit-content'}
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          window.open('https://harness.io/pricing/?module=cd', '_blank')
        }}
      >
        {getString('common.explorePlans')}
      </Button>
    </Layout.Vertical>
  )

  return (
    <Popover
      openOnTargetFocus={false}
      fill
      usePortal
      hoverCloseDelay={50}
      interactionKind={PopoverInteractionKind.HOVER}
      content={tooltip}
      position={Position.RIGHT}
      className={Classes.DARK}
    >
      <Layout.Horizontal
        padding={'xlarge'}
        className={cx(css.middleregion, css.onHover)}
        flex={{ justifyContent: 'space-between' }}
      >
        <Layout.Vertical>
          <Text
            font={{ variation: FontVariation.H4 }}
            padding={{ bottom: 'xsmall' }}
            color={Color.GREY_300}
            icon="flash"
            iconProps={{ padding: { right: 'medium' }, size: 25 }}
          >
            {capitalize(getString('common.contactSupport'))}
          </Text>
          <Text font={{ variation: FontVariation.BODY2 }} padding={{ bottom: 'xsmall' }} color={Color.GREY_300}>
            {getString('common.resourceCenter.ticketmenu.submitDesc')}
          </Text>
        </Layout.Vertical>
        <Icon name="chevron-right" color={Color.GREY_300} />
      </Layout.Horizontal>
    </Popover>
  )
}
