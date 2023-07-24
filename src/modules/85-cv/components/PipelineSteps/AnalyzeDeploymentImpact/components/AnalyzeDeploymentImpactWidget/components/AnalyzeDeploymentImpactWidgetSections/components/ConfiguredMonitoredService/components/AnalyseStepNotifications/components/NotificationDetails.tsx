import { Container, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React from 'react'
import { AnalyseStepNotificationsData } from '../AnalyseStepNotifications.types'
import css from './NotificationDetails.module.scss'

interface NotificationDetailsProps {
  notificationDetails: AnalyseStepNotificationsData
}
export default function NotificationDetails(props: NotificationDetailsProps): JSX.Element {
  const { notificationDetails } = props
  const { conditions } = notificationDetails
  return (
    <Container className={css.notificationDetails}>
      <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'normal' }} padding={{ bottom: 'small' }}>
        {'Conditions'}
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
                  <Text color={Color.BLACK}>{'Trigger : '}</Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>{`${type} is below`}</Text>
                </Layout.Horizontal>
                <Layout.Horizontal>
                  <Text color={Color.BLACK}>{'Threshold Value : '}</Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>
                    {threshold}
                  </Text>
                </Layout.Horizontal>
                <Layout.Horizontal>
                  <Text color={Color.BLACK}>{'Duration : '}</Text>
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
                  <Text color={Color.BLACK}>{'Trigger : '}</Text>
                  <Text color={Color.BLACK} padding={{ left: 'small' }}>
                    {'Deployment Impact'}
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
