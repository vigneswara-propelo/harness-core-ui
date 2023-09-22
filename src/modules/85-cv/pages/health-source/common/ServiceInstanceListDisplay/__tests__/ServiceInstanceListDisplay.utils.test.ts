import { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { getLogRecordsRequestBody, getRecordsRequestBodyWithServiceInstance } from '../ServiceInstanceListDisplay.utils'
import { FormikValuesType } from '../ServiceInstanceList.types'

describe('ServiceInstanceListDisplay.utils.ts', () => {
  test('getRecordsRequestBodyWithServiceInstance should give correct payload', () => {
    const result = getRecordsRequestBodyWithServiceInstance({
      connectorIdentifier: 'testConnector',
      healthSourceType: 'Prometheus',
      query: '*',
      values: {
        serviceInstanceField: 'testSI'
      } as CommonCustomMetricFormikInterface
    })

    expect(result).toEqual({
      connectorIdentifier: 'testConnector',
      endTime: expect.any(Number),
      healthSourceQueryParams: { serviceInstanceField: 'testSI' },
      healthSourceType: 'Prometheus',
      query: '*',
      startTime: expect.any(Number)
    })
  })
  test('getLogRecordsRequestBody should give correct payload', () => {
    const result = getLogRecordsRequestBody({
      connectorIdentifier: 'testConnector',
      healthSourceType: 'Prometheus',
      query: '*',
      formValues: {
        serviceInstanceField: 'testSI',
        serviceInstanceIdentifierTag: 'SITagTest'
      } as FormikValuesType
    })

    expect(result).toEqual({
      connectorIdentifier: 'testConnector',
      endTime: expect.any(Number),
      healthSourceQueryParams: { serviceInstanceField: 'testSI' },
      healthSourceType: 'Prometheus',
      query: '*',
      startTime: expect.any(Number)
    })
  })
})
