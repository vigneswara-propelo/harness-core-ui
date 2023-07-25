/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { Text, Popover, TextProps, Layout, IconName } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Classes, IPopoverProps, PopoverInteractionKind, Position } from '@blueprintjs/core'

import ReactTimeago from 'react-timeago'
import moment from 'moment'
import css from './ExecutionCard.module.scss'

export interface TimePopoverProps extends TextProps, React.ComponentProps<typeof ReactTimeago> {
  time: number
  popoverProps?: IPopoverProps
  icon?: IconName
  className?: string
}
export const DATE_PARSE_FORMAT = 'MMM DD, YYYY hh:mm:ss A'

enum TimeZone {
  UTC = 'UTC',
  LOCAL = 'LOCAL'
}

export function DateTimeWithLocalContent({ time }: { time: number }): JSX.Element {
  return (
    <Layout.Vertical>
      <Layout.Horizontal spacing={'small'} className={css.timeWrapper}>
        <Text
          color={Color.PRIMARY_1}
          font={{ variation: FontVariation.SMALL_BOLD }}
          margin={0}
          className={css.timezone}
        >
          {TimeZone.UTC}
        </Text>
        <Text color={Color.PRIMARY_1} className={css.time} font={{ variation: FontVariation.SMALL_BOLD }}>
          {moment(time).utc().format(DATE_PARSE_FORMAT)}
        </Text>
      </Layout.Horizontal>

      <Layout.Horizontal spacing={'small'} className={css.timeWrapper}>
        <Text
          color={Color.PRIMARY_1}
          font={{ variation: FontVariation.SMALL_BOLD }}
          margin={0}
          className={css.timezone}
        >
          {TimeZone.LOCAL}
        </Text>
        <Text color={Color.PRIMARY_1} className={css.time} font={{ variation: FontVariation.SMALL_BOLD }}>
          {moment(time).format(DATE_PARSE_FORMAT)}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export function TimePopoverWithLocal(props: TimePopoverProps): ReactElement {
  const { time, popoverProps, icon, className, ...textProps } = props
  return (
    <Popover
      interactionKind={PopoverInteractionKind.HOVER}
      position={Position.TOP}
      className={Classes.DARK}
      {...popoverProps}
    >
      <Text inline {...textProps} icon={icon} className={className}>
        <ReactTimeago date={time} live title={''} />
      </Text>
      <Layout.Vertical padding="medium">
        <DateTimeWithLocalContent time={time} />
      </Layout.Vertical>
    </Popover>
  )
}
