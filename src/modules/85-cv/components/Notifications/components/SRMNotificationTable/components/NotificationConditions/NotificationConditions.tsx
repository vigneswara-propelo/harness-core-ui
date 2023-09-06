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
        const { threshold, period } = spec
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
          default:
            return <></>
        }
      })}
    </Container>
  )
}
