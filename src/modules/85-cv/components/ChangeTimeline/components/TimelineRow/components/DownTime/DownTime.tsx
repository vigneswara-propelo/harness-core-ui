import React from 'react'
import { Container, Text } from '@harness/uicore'
import moment from 'moment'
import { Popover, PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { TimelineDataPoint } from '../../TimelineRow.types'
import { DATE_FORMAT } from '../../TimelineRow.constants'
import { getInitialPositionOfWidget } from '../../TimelineRow.utils'
import css from './DownTime.module.scss'

export interface DownTimeProps {
  widget: TimelineDataPoint
  index: number
  fetchSecondaryEvents?: () => Promise<void>
}

export default function DownTime(props: DownTimeProps): JSX.Element {
  const { widget, index } = props
  const { getString } = useStrings()
  const { icon, leftOffset: position, startTime, endTime } = widget
  const { height, width, url } = icon
  const initialPosition = getInitialPositionOfWidget(position, height, width)

  return (
    <Container key={`${startTime}-${position}-${index}`} className={css.event} style={initialPosition}>
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        popoverClassName={css.downTimeWidgetsPopover}
        position={PopoverPosition.TOP}
        content={
          <Container className={css.downTimeContainer} padding={'small'}>
            <Text className={css.downTimeTextElements} padding={{ bottom: 'small' }}>
              {getString('cv.sloDowntime.label')}
            </Text>
            <Container flex={{ justifyContent: 'flex-start' }}>
              <Text className={css.downTimeTextElements}>{moment(new Date(startTime)).format(DATE_FORMAT)}</Text>
              <Text className={css.downTimeTextElements}>{' - '}</Text>
              <Text className={css.downTimeTextElements}>{`${moment(new Date(endTime)).format(DATE_FORMAT)}`}</Text>
            </Container>
          </Container>
        }
      >
        <svg height={height} width={width} className={css.downTimeIcon} data-testid="downtimeIcon">
          <image href={url} height={height} width={width} />
        </svg>
      </Popover>
    </Container>
  )
}
