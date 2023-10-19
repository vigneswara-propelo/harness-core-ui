/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, Layout, Text, Icon, Popover, Container } from '@harness/uicore'
import { Position, PopoverInteractionKind, Classes } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import PercentageBar from './PercentageBar'
import css from './SubscriptionUsageCard.module.scss'

export function getInfoIcon(tooltip: string | undefined): React.ReactElement {
  return (
    <Popover
      popoverClassName={Classes.DARK}
      position={Position.BOTTOM}
      interactionKind={PopoverInteractionKind.HOVER}
      content={
        <Text width={200} padding="medium" color={Color.WHITE}>
          {tooltip}
        </Text>
      }
    >
      <Icon name="info" size={15} className={css.infoIcon} />
    </Popover>
  )
}

interface PercentageBarReturn {
  width: number
  color: Color
  percentage: number
  overPercentage?: number
}

function getPercentageBarProps(
  creditsAvailable?: number,
  usage?: number,
  credits?: number,
  subscribed?: number
): PercentageBarReturn {
  const dividend = credits ? creditsAvailable : usage
  let divisor = credits ? credits : subscribed
  if (divisor === 0) {
    divisor = 1
  }
  let width = 0,
    color = Color.PRIMARY_6,
    percentage = 0,
    overPercentage = undefined
  if (divisor && divisor > 0 && dividend && dividend >= 0) {
    percentage = (dividend * 100) / divisor
    width = percentage > 100 ? 100 : percentage
    color = percentage >= 90 ? Color.ORANGE_500 : color
    const isOverSubscribed = percentage > 100
    if (isOverSubscribed) {
      overPercentage = Math.round(percentage - 100)
    }
    percentage = Math.round(percentage)
  }
  return { width, color, percentage, overPercentage }
}

const PercentageSubscribedLabel: React.FC<{
  creditsAvailable: number
  overPercentage?: number
  percentage: number
  color: string
  label: string
}> = ({ percentage, label, creditsAvailable }) => {
  return creditsAvailable ? (
    <Text font={{ size: 'xsmall' }} color={percentage > 90 ? Color.ORANGE_500 : ''}>
      {label}
    </Text>
  ) : (
    <Text font={{ size: 'xsmall' }} color={percentage > 90 ? Color.ORANGE_500 : ''}>
      {percentage}% {label}
    </Text>
  )
}

interface UsageInfoCardProps {
  leftBottomFooter?: string
  creditsUsed?: number
  subscribed?: number
  usage?: number
  leftHeader: string
  tooltip: string
  tooltipExpiry?: string
  rightHeader?: string | JSX.Element
  hasBar?: boolean
  leftFooter?: string
  rightFooter?: string
  prefix?: string
  credits?: number
  useCredits?: boolean
}

export const ErrorContainer = ({ children }: { children: React.ReactElement }): React.ReactElement => {
  return <Container width={300}>{children}</Container>
}

const UsageInfoCard: React.FC<UsageInfoCardProps> = ({
  leftBottomFooter,
  creditsUsed,
  subscribed,
  usage,
  leftHeader,
  tooltip,
  rightHeader,
  hasBar,
  leftFooter,
  rightFooter,
  prefix,
  credits,
  useCredits
}) => {
  let creditsAvailable =
    credits !== undefined && creditsUsed !== undefined && creditsUsed >= 0 ? credits - creditsUsed : 0
  if (creditsAvailable < 0) {
    creditsAvailable = 0
  }
  const { overPercentage, percentage, width, color } = getPercentageBarProps(
    creditsAvailable,
    usage,
    credits,
    subscribed
  )

  const { getString } = useStrings()

  function getLabel(value: number | undefined): string | number | undefined {
    if (value && value >= 1000000) {
      let roundValue = Math.round(value / 10000)
      roundValue = Math.trunc(roundValue) / 100
      return `${roundValue}M`
    }
    if (value && value >= 1000) {
      let roundValue = Math.round(value / 10)
      roundValue = Math.trunc(roundValue) / 100
      return `${roundValue}K`
    }
    if (value && value < 0) {
      return getString('common.unlimited')
    }
    return value
  }

  return (
    <Card className={css.innerCard}>
      <Layout.Vertical>
        <Layout.Horizontal flex={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'baseline' }}>
            <Text font={{ size: 'small' }} color={Color.GREY_700}>
              {leftHeader}
            </Text>
            {getInfoIcon(tooltip)}
          </Layout.Horizontal>
          {useCredits ? (
            creditsAvailable > 0 ? (
              rightFooter && (
                <Text tooltip={<Text padding={'small'}>{getString('common.creditsExpiresToolltip')}</Text>}>
                  <PercentageSubscribedLabel
                    creditsAvailable={creditsAvailable}
                    overPercentage={overPercentage}
                    percentage={percentage}
                    color={color}
                    label={rightFooter}
                  />
                </Text>
              )
            ) : null
          ) : (
            <Text font={{ size: 'small' }} color={Color.GREY_500}>
              {rightHeader}
            </Text>
          )}
        </Layout.Horizontal>
        {useCredits ? (
          <div>
            <Text font={{ size: 'large', weight: 'bold' }} color={Color.BLACK}>
              {`${getLabel(creditsAvailable)} `}
            </Text>
          </div>
        ) : (
          <Text font={{ size: 'large', weight: 'bold' }} color={Color.BLACK}>
            {prefix}
            {getLabel(usage)}
          </Text>
        )}
        {hasBar && <PercentageBar width={width} />}
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          {useCredits ? (
            <Text font={{ size: 'xsmall' }}>
              {`${getLabel(credits)} `}
              {leftBottomFooter}
            </Text>
          ) : (
            <Text font={{ size: 'xsmall' }}>
              {getLabel(subscribed)} {leftFooter}
            </Text>
          )}
          {useCredits ? (
            creditsAvailable >= 0 ? (
              <Text font={{ size: 'xsmall' }}>
                {`${Math.round(width * 100) / 100}%`} {leftFooter}
              </Text>
            ) : null
          ) : (
            rightFooter && (
              <PercentageSubscribedLabel
                creditsAvailable={creditsAvailable}
                overPercentage={overPercentage}
                percentage={percentage}
                color={color}
                label={rightFooter}
              />
            )
          )}
        </Layout.Horizontal>
      </Layout.Vertical>
    </Card>
  )
}

export default UsageInfoCard
