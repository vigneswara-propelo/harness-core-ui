/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React from 'react'
import { useStrings } from 'framework/strings'
import type { NotificationRuleResponse } from 'services/cv'
import { getEventTypes } from './NotificationConditions.utils'
import css from './NotificationConditions.module.scss'

interface NotificationConditionsProps {
  notificationDetails: NotificationRuleResponse
}
export default function NotificationConditions(props: NotificationConditionsProps): JSX.Element {
  const { notificationDetails } = props
  const { conditions } = notificationDetails?.notificationRule || {}
  const { getString } = useStrings()

  return (
    <Container className={css.notificationDetails}>
      <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'normal' }} padding={{ bottom: 'small' }}>
        {getString('conditions')}
      </Text>
      {conditions.map((condition, conditionIndex) => {
        const { type, spec } = condition
        const { threshold, period, lookBackDuration } = spec
        switch (type) {
          case 'HealthScore':
            return (
              <Layout.Vertical
                key={`notification-condition-${conditionIndex}`}
                padding={{ top: 'small', bottom: 'small' }}
              >
                <Layout.Horizontal>
                  <Text color={Color.BLACK}>{`${getString('common.triggerLabel')} : `}</Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>{`${type} is below`}</Text>
                </Layout.Horizontal>
                <Layout.Horizontal>
                  <Text color={Color.BLACK}>{`${getString(
                    'cv.notifications.notificationConditions.thresholdValue'
                  )} : `}</Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>
                    {threshold}
                  </Text>
                </Layout.Horizontal>
                <Layout.Horizontal>
                  <Text color={Color.BLACK}>{getString('common.durationPrefix')}</Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>
                    {period.replace(new RegExp('m', 'g'), ' minutes')}
                  </Text>
                </Layout.Horizontal>
              </Layout.Vertical>
            )
          case 'DeploymentImpactReport':
            return (
              <Layout.Vertical
                key={`notification-condition-${conditionIndex}`}
                padding={{ top: 'small', bottom: 'small' }}
              >
                <Layout.Horizontal>
                  <Text color={Color.BLACK}>{`${getString('common.triggerLabel')} :`}</Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>
                    {getString('cv.changeSource.DeploymentImpactAnalysis')}
                  </Text>
                </Layout.Horizontal>
              </Layout.Vertical>
            )
          case 'ChangeImpact':
            return (
              <Layout.Vertical
                key={`notification-condition-${conditionIndex}`}
                padding={{ top: 'small', bottom: 'small' }}
              >
                <Layout.Horizontal>
                  <Text color={Color.BLACK}>{`${getString('common.triggerLabel')} :`}</Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>
                    {getString('cv.monitoredServices.monitoredServiceTabs.changeImpact')}
                  </Text>
                </Layout.Horizontal>
                <Layout.Horizontal>
                  <Text color={Color.BLACK}>{`${getString(
                    'cv.notifications.notificationConditions.eventTypes'
                  )} : `}</Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>
                    {getEventTypes(condition)}
                  </Text>
                </Layout.Horizontal>
                <Layout.Horizontal>
                  <Text color={Color.BLACK}>{`${getString(
                    'cv.notifications.notificationConditions.thresholdValue'
                  )} : `}</Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>
                    {threshold}
                  </Text>
                </Layout.Horizontal>
                <Layout.Horizontal>
                  <Text color={Color.BLACK}>{getString('common.durationPrefix')}</Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>
                    {period.replace(new RegExp('m', 'g'), ' minutes')}
                  </Text>
                </Layout.Horizontal>
              </Layout.Vertical>
            )
          case 'ChangeObserved':
            return (
              <Layout.Vertical
                key={`notification-condition-${conditionIndex}`}
                padding={{ top: 'small', bottom: 'small' }}
              >
                <Layout.Horizontal>
                  <Text color={Color.BLACK}>{`${getString('common.triggerLabel')} :`}</Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>
                    {getString('cv.notifications.notificationConditions.changeObserved')}
                  </Text>
                </Layout.Horizontal>
                <Layout.Horizontal>
                  <Text color={Color.BLACK}>{`${getString(
                    'cv.notifications.notificationConditions.eventTypes'
                  )} : `}</Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>
                    {getEventTypes(condition)}
                  </Text>
                </Layout.Horizontal>
              </Layout.Vertical>
            )
          case 'ErrorBudgetRemainingPercentage':
            return (
              <Layout.Vertical
                key={`notification-condition-${conditionIndex}`}
                padding={{ top: 'small', bottom: 'small' }}
              >
                <Layout.Horizontal>
                  <Text color={Color.BLACK}>{`${getString('common.triggerLabel')} : `}</Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>
                    {getString('cv.notifications.notificationConditions.errorBudgetRemainingPercentage')}
                  </Text>
                </Layout.Horizontal>
                <Layout.Horizontal>
                  <Text color={Color.BLACK}>{`${getString(
                    'cv.notifications.notificationConditions.thresholdValue'
                  )} : `}</Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>
                    {threshold} %
                  </Text>
                </Layout.Horizontal>
              </Layout.Vertical>
            )
          case 'ErrorBudgetRemainingMinutes':
            return (
              <Layout.Vertical
                key={`notification-condition-${conditionIndex}`}
                padding={{ top: 'small', bottom: 'small' }}
              >
                <Layout.Horizontal>
                  <Text color={Color.BLACK}>{`${getString('common.triggerLabel')} :`}</Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>
                    {getString('cv.notifications.notificationConditions.errorBudgetRemainingMinutes')}
                  </Text>
                </Layout.Horizontal>
                <Layout.Horizontal>
                  <Text color={Color.BLACK}>{`${getString(
                    'cv.notifications.notificationConditions.thresholdValue'
                  )} : `}</Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>
                    {threshold} mins
                  </Text>
                </Layout.Horizontal>
              </Layout.Vertical>
            )
          case 'ErrorBudgetBurnRate':
            return (
              <Layout.Vertical
                key={`notification-condition-${conditionIndex}`}
                padding={{ top: 'small', bottom: 'small' }}
              >
                <Layout.Horizontal>
                  <Text color={Color.BLACK}>{`${getString('common.triggerLabel')} :`}</Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>
                    {getString('cv.notifications.notificationConditions.errorBudgetBurnRate')}
                  </Text>
                </Layout.Horizontal>
                <Layout.Horizontal>
                  <Text color={Color.BLACK}>{`${getString(
                    'cv.notifications.notificationConditions.thresholdValue'
                  )} : `}</Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>
                    {threshold} %
                  </Text>
                </Layout.Horizontal>
                <Layout.Horizontal>
                  <Text color={Color.BLACK}>
                    {getString('cv.notifications.notificationConditions.lookBackDuration')}
                  </Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>
                    {lookBackDuration.replace(new RegExp('m', 'g'), ' minutes')}
                  </Text>
                </Layout.Horizontal>
              </Layout.Vertical>
            )
          default:
            return <></>
        }
      })}
    </Container>
  )
}
