import React from 'react'
import { Container, Text } from '@harness/uicore'
import moment from 'moment'
import { Popover, PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core'
import type { TimelineDataPoint } from '../../TimelineRow.types'
import { DATE_FORMAT } from '../../TimelineRow.constants'
import { getInitialPositionOfWidget } from '../../TimelineRow.utils'
import { DIAMOND_ICON_TYPE } from './DefaultWidget.constants'
import css from './DefaultWidget.module.scss'

export interface DefaultWidgetProps {
  widget: TimelineDataPoint
  index: number
}

export default function DefaultWidget(props: DefaultWidgetProps): JSX.Element {
  const { widget, index } = props
  const { icon, leftOffset: position, startTime, tooltip } = widget
  const { height, width, fillColor, url } = icon
  const initialPosition = getInitialPositionOfWidget(position, height, width)

  return (
    <Container key={`${startTime}-${position}-${index}`} className={css.event} style={initialPosition}>
      <Popover
        interactionKind={PopoverInteractionKind.HOVER}
        popoverClassName={css.timelineRowPopover}
        position={PopoverPosition.TOP}
        minimal
        content={
          <Container className={css.tooltipContainer}>
            <Container className={css.colorSidePanel} style={{ backgroundColor: tooltip?.sideBorderColor }} />
            <Text>{tooltip?.message}</Text>
            <Text>{moment(new Date(startTime)).format(DATE_FORMAT)}</Text>
          </Container>
        }
      >
        {url === DIAMOND_ICON_TYPE ? (
          <Container
            className={css.singleEvent}
            style={{ background: fillColor, width: width, height: height }}
            data-testid="diamondIcon"
          />
        ) : (
          <svg height={height} width={width} data-testid="defaultWidgetIcon">
            <image href={url} height={height} width={width} fill={fillColor} />
          </svg>
        )}
      </Popover>
    </Container>
  )
}
