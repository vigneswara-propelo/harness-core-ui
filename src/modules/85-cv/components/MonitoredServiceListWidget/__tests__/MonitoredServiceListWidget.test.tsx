import { render, screen } from '@testing-library/react'
import React from 'react'
import MonitoredServiceListWidget from '../MonitoredServiceListWidget'
import { CD_MONITORED_SERVICE_CONFIG, PROJECT_MONITORED_SERVICE_CONFIG } from '../MonitoredServiceListWidget.constants'
import { getIfModuleIsCD } from '../MonitoredServiceListWidget.utils'

jest.mock('@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService', () => {
  return jest.fn(() => <div data-testid="mock-monitored-service" />)
})

describe('MonitoredServiceListWidget', () => {
  test('renders MonitoredService component with the provided config', () => {
    const config = PROJECT_MONITORED_SERVICE_CONFIG

    render(<MonitoredServiceListWidget config={config} />)

    expect(screen.getByTestId('mock-monitored-service')).toBeInTheDocument()
  })
})

describe('getIfModuleIsCD', () => {
  test('returns true when config.module is "cd"', () => {
    const config = CD_MONITORED_SERVICE_CONFIG

    const result = getIfModuleIsCD(config)

    expect(result).toBe(true)
  })

  test('returns false when config is undefined', () => {
    const config = undefined

    const result = getIfModuleIsCD(config)

    expect(result).toBe(false)
  })

  test('returns false when config.module is not "cd"', () => {
    const config = PROJECT_MONITORED_SERVICE_CONFIG

    const result = getIfModuleIsCD(config)

    expect(result).toBe(false)
  })
})
