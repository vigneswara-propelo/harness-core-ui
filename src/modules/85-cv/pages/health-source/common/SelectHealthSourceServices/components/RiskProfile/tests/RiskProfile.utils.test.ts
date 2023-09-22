import { HealthSourceTypes } from '@cv/pages/health-source/types'
import { getCanShowServiceInstanceNames } from '../RiskProfile.utils'

describe('getCanShowServiceInstanceNames', () => {
  test('should getCanShowServiceInstanceNames return false when query is not present', () => {
    const result = getCanShowServiceInstanceNames({
      sourceType: HealthSourceTypes.DatadogMetrics,
      isConnectorRuntimeOrExpression: false,
      showServiceInstanceNames: true,
      serviceInstance: 'test'
    })

    expect(result).toBe(false)
  })

  test('should getCanShowServiceInstanceNames return false when service instance is not present', () => {
    const result = getCanShowServiceInstanceNames({
      sourceType: HealthSourceTypes.DatadogMetrics,
      showServiceInstanceNames: true,
      isConnectorRuntimeOrExpression: false,
      query: '*'
    })

    expect(result).toBe(false)
  })

  test('should getCanShowServiceInstanceNames return false when connetor is runtime', () => {
    const result = getCanShowServiceInstanceNames({
      sourceType: HealthSourceTypes.DatadogMetrics,
      isConnectorRuntimeOrExpression: true,
      showServiceInstanceNames: true,
      query: '*'
    })

    expect(result).toBe(false)
  })

  test('should getCanShowServiceInstanceNames return false when query is runtime', () => {
    const result = getCanShowServiceInstanceNames({
      sourceType: HealthSourceTypes.DatadogMetrics,
      isConnectorRuntimeOrExpression: false,
      showServiceInstanceNames: true,
      query: '<+input>'
    })

    expect(result).toBe(false)
  })

  test('should getCanShowServiceInstanceNames return false when service instance is runtime', () => {
    const result = getCanShowServiceInstanceNames({
      sourceType: HealthSourceTypes.DatadogMetrics,
      isConnectorRuntimeOrExpression: false,
      showServiceInstanceNames: true,
      query: '*',
      serviceInstance: '<+input>'
    })

    expect(result).toBe(false)
  })

  test('should getCanShowServiceInstanceNames return false when source type is other than prometheus or datadog', () => {
    const result = getCanShowServiceInstanceNames({
      sourceType: HealthSourceTypes.NewRelic,
      isConnectorRuntimeOrExpression: false,
      query: '*',
      serviceInstance: 'host',
      showServiceInstanceNames: true
    })

    expect(result).toBe(false)
  })

  test('should getCanShowServiceInstanceNames return true all conditions are satisfied', () => {
    const result = getCanShowServiceInstanceNames({
      sourceType: HealthSourceTypes.DatadogMetrics,
      isConnectorRuntimeOrExpression: false,
      showServiceInstanceNames: true,
      query: '*',
      serviceInstance: 'host'
    })

    expect(result).toBe(true)
  })
})
