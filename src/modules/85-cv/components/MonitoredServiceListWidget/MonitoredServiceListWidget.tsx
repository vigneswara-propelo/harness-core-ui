import React from 'react'
import MonitoredService from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService'
import type { MonitoredServiceConfig } from './MonitoredServiceListWidget.types'

interface MonitoredServiceListWidgetProps {
  config: MonitoredServiceConfig
  calledFromSettings?: boolean
}

export default function MonitoredServiceListWidget(props: MonitoredServiceListWidgetProps): JSX.Element {
  const { config, calledFromSettings } = props

  return <MonitoredService config={config} calledFromSettings={calledFromSettings} />
}
