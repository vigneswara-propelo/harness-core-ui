import { getCanShowServiceInstanceNames } from '../DatadogLogsMapToService.utils'

describe('DatadogLogsMapToService.utils.ts', () => {
  test('getCanShowServiceInstanceNames should return true when all condition matches', () => {
    const result = getCanShowServiceInstanceNames({ query: '*', serviceInstanceIdentifierTag: 'test' })

    expect(result).toBe(true)
  })
})
