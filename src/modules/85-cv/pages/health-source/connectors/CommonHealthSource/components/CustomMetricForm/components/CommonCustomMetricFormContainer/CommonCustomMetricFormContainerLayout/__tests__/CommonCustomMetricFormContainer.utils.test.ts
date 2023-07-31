import { MultiTypeInputType } from '@harness/uicore'
import type { LogFieldsMultiTypeState } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/CustomMetricForm.types'
import { FIELD_ENUM } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import {
  generateRequestBodyForParamValues,
  getCanShowSampleLogButton,
  getListOptionsFromParams,
  getRecordsRequestBody
} from '../CommonCustomMetricFormContainer.utils'

describe('CommonCustomMetricFormContainer utils test', () => {
  test('getCanShowSampleLogButton should return true if it is a template and connector and query is fixed', () => {
    const result = getCanShowSampleLogButton({
      isTemplate: true,
      isConnectorRuntimeOrExpression: false,
      isQueryRuntimeOrExpression: false,
      multiTypeRecord: { serviceInstanceField: MultiTypeInputType.FIXED } as LogFieldsMultiTypeState
    })
    expect(result).toBe(true)
  })

  test('getCanShowSampleLogButton should return false if it is a template and connector and query is not fixed', () => {
    const result = getCanShowSampleLogButton({
      isTemplate: true,
      isConnectorRuntimeOrExpression: true,
      isQueryRuntimeOrExpression: false,
      multiTypeRecord: { serviceInstanceField: MultiTypeInputType.FIXED } as LogFieldsMultiTypeState
    })
    expect(result).toBe(false)
  })

  test('getCanShowSampleLogButton should return false if it is a template and connector and query is fixed and one of the log field is runtime', () => {
    const result = getCanShowSampleLogButton({
      isTemplate: true,
      isConnectorRuntimeOrExpression: false,
      isQueryRuntimeOrExpression: false,
      multiTypeRecord: { serviceInstanceField: MultiTypeInputType.RUNTIME } as LogFieldsMultiTypeState
    })
    expect(result).toBe(false)
  })

  test('getCanShowSampleLogButton should return false if it is a template and connector and query is fixed and one of the log field is expression', () => {
    const result = getCanShowSampleLogButton({
      isTemplate: true,
      isConnectorRuntimeOrExpression: false,
      isQueryRuntimeOrExpression: false,
      multiTypeRecord: { serviceInstanceField: MultiTypeInputType.EXPRESSION } as LogFieldsMultiTypeState
    })
    expect(result).toBe(false)
  })

  test('getCanShowSampleLogButton should return true if it is not a template', () => {
    const result = getCanShowSampleLogButton({
      isTemplate: false,
      isConnectorRuntimeOrExpression: false,
      isQueryRuntimeOrExpression: false,
      multiTypeRecord: null
    })
    expect(result).toBe(true)
  })

  test('Test getRecordsRequestBody with optional parameters', () => {
    const fieldsToFetchRecords = [
      {
        type: FIELD_ENUM.TEXT_INPUT,
        label: 'label',
        isTemplateSupportEnabled: true,
        identifier: 'field1' as keyof CommonCustomMetricFormikInterface
      },
      {
        type: FIELD_ENUM.TEXT_INPUT,
        label: 'label',
        isTemplateSupportEnabled: true,
        identifier: 'field2' as keyof CommonCustomMetricFormikInterface
      }
    ]

    const values = {
      identifier: 'metric-1',
      metricName: 'metric-1',
      groupName: 'group-1',
      query: 'query',
      field1: 'value1',
      field2: 'value2'
    }

    const requestBody = getRecordsRequestBody({
      connectorIdentifier: 'someConnectorId',
      healthSourceType: 'someHealthSourceType',
      query: 'someQuery',
      queryField: {
        identifier: 'identifier',
        type: FIELD_ENUM.TEXT_INPUT,
        label: 'label',
        isTemplateSupportEnabled: true
      },
      queryFieldValue: 'someValue',
      fieldsToFetchRecords,
      values
    })

    expect(requestBody).toEqual({
      startTime: expect.any(Number),
      connectorIdentifier: 'someConnectorId',
      healthSourceQueryParams: {
        field1: 'value1',
        field2: 'value2'
      },
      healthSourceType: 'someHealthSourceType',
      query: 'someQuery',
      endTime: expect.any(Number)
    })
  })

  test('Test getRecordsRequestBody with empty optional parameters', () => {
    const requestBody = getRecordsRequestBody({
      connectorIdentifier: 'someConnectorId',
      healthSourceType: 'someHealthSourceType',
      query: 'someQuery',
      queryField: {
        identifier: 'identifier',
        type: FIELD_ENUM.TEXT_INPUT,
        label: 'label',
        isTemplateSupportEnabled: true
      }
    })

    expect(requestBody).toEqual({
      connectorIdentifier: 'someConnectorId',
      endTime: expect.any(Number),
      startTime: expect.any(Number),
      healthSourceType: 'someHealthSourceType',
      query: 'someQuery',
      healthSourceQueryParams: {
        identifier: undefined,
        queryFieldValue: undefined,
        fieldsToFetchRecords: undefined,
        values: undefined
      }
    })
  })
})

describe('generateRequestBodyForParamValues', () => {
  const fieldsToFetchRecordsMock = [
    {
      identifier: 'field1' as keyof CommonCustomMetricFormikInterface,
      type: FIELD_ENUM.TEXT_INPUT,
      label: 'field1',
      isTemplateSupportEnabled: true
    },
    {
      identifier: 'field2' as keyof CommonCustomMetricFormikInterface,
      type: FIELD_ENUM.TEXT_INPUT,
      label: 'field2',
      isTemplateSupportEnabled: true
    }
  ]
  const valuesMock = {
    field1: 'Value 1',
    identifier: 'identifier',
    metricName: 'identifier',
    groupName: 'g1'
  }
  const connectorIdentifierMock = 'connector-123'
  const providerTypeMock = 'example-provider'
  const identifierMock = 'param-identifier'

  test('should return the correct request body with healthSourceQueryParams', () => {
    const requestBody = generateRequestBodyForParamValues({
      fieldsToFetchRecords: fieldsToFetchRecordsMock,
      values: valuesMock,
      connectorIdentifier: connectorIdentifierMock,
      providerType: providerTypeMock,
      identifier: identifierMock
    })

    expect(requestBody).toEqual({
      connectorIdentifier: 'connector-123',
      providerType: 'example-provider',
      paramName: 'param-identifier',
      healthSourceQueryParams: expect.any(Object)
    })
  })

  test('should return the correct request body without healthSourceQueryParams', () => {
    const requestBody = generateRequestBodyForParamValues({
      values: valuesMock,
      connectorIdentifier: connectorIdentifierMock,
      providerType: providerTypeMock,
      identifier: identifierMock
    })

    expect(requestBody).toEqual({
      connectorIdentifier: 'connector-123',
      providerType: 'example-provider',
      paramName: 'param-identifier',
      healthSourceQueryParams: {}
    })
  })
})

describe('getListOptionsFromParams', () => {
  const dataMock = {
    resource: {
      paramValues: [
        { name: 'Option 1', value: 'option1_value' },
        { name: 'Option 2', value: 'option2_value' }
      ]
    }
  }
  const emptyDataMock = {
    resource: {
      paramValues: []
    }
  }

  test('should return the correct list of options from data', () => {
    const listOptionsData = getListOptionsFromParams(dataMock)

    expect(listOptionsData).toEqual([
      { label: 'Option 1', value: 'option1_value' },
      { label: 'Option 2', value: 'option2_value' }
    ])
  })

  test('should return an empty array when data is empty', () => {
    const listOptionsData = getListOptionsFromParams(emptyDataMock)

    expect(listOptionsData).toEqual([])
  })

  test('should return an empty array when data is undefined', () => {
    const listOptionsData = getListOptionsFromParams(undefined)

    expect(listOptionsData).toEqual([])
  })
})
