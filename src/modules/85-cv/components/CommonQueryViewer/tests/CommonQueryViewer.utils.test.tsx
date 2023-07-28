import { FIELD_ENUM } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import {
  getIsQueryButtonDisabledWhenFieldsPresent,
  getIsQueryButtonDisabled,
  getAreAllFieldsNotPopulated
} from '../CommonQueryViewer.utils'

describe('Unit tests for CommonQueryViewer ', () => {
  test('getIsQueryButtonDisabledWhenFieldsPresent returns true when loading is true', () => {
    const result = getIsQueryButtonDisabledWhenFieldsPresent({ loading: true, areAllFieldsNotPopulated: false })
    expect(result).toBe(true)
  })

  test('getIsQueryButtonDisabledWhenFieldsPresent returns true when areAllFieldsNotPopulated is true', () => {
    const result = getIsQueryButtonDisabledWhenFieldsPresent({ loading: false, areAllFieldsNotPopulated: true })
    expect(result).toBe(true)
  })

  test('getIsQueryButtonDisabledWhenFieldsPresent returns false when loading and areAllFieldsNotPopulated are false', () => {
    const result = getIsQueryButtonDisabledWhenFieldsPresent({ loading: false, areAllFieldsNotPopulated: false })
    expect(result).toBe(false)
  })

  test('getIsQueryButtonDisabled returns true when query is empty', () => {
    const result = getIsQueryButtonDisabled({
      query: '',
      loading: false,
      queryFieldIdentifier: 'metric-1',
      values: {
        identifier: 'metric-1',
        metricName: 'metric-1',
        groupName: 'group-1',
        query: ''
      }
    })
    expect(result).toBe(true)
  })

  test('getIsQueryButtonDisabled returns true when loading is true', () => {
    const result = getIsQueryButtonDisabled({
      query: 'query',
      loading: true,
      queryFieldIdentifier: 'metric-1',
      values: {
        identifier: 'metric-1',
        metricName: 'metric-1',
        groupName: 'group-1',
        query: 'query'
      }
    })
    expect(result).toBe(true)
  })

  test('getIsQueryButtonDisabled returns true when queryFieldIdentifier is not present in values', () => {
    const result = getIsQueryButtonDisabled({
      query: 'some query',
      loading: false,
      queryFieldIdentifier: 'someField',
      values: {
        identifier: 'metric-1',
        metricName: 'metric-1',
        groupName: 'group-1',
        query: 'query'
      }
    })
    expect(result).toBe(true)
  })

  test('getIsQueryButtonDisabled returns false when none of the conditions are met', () => {
    const result = getIsQueryButtonDisabled({
      query: 'query',
      loading: false,
      queryFieldIdentifier: 'field1',
      values: {
        identifier: 'metric-1',
        metricName: 'metric-1',
        groupName: 'group-1',
        query: 'query',
        field1: 'value'
      } as CommonCustomMetricFormikInterface
    })
    expect(result).toBe(false)
  })
})

describe('Unit tests for getAreAllFieldsNotPopulated ', () => {
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
    },
    {
      type: FIELD_ENUM.TEXT_INPUT,
      label: 'label',
      isTemplateSupportEnabled: true,
      identifier: 'field3' as keyof CommonCustomMetricFormikInterface
    }
  ]
  const values = {
    identifier: 'metric-1',
    metricName: 'metric-1',
    groupName: 'group-1',
    query: 'query'
  }

  test('getAreAllFieldsNotPopulated returns true when all fields are not populated', () => {
    const result = getAreAllFieldsNotPopulated(fieldsToFetchRecords, values)
    expect(result).toBe(true)
  })

  test('getAreAllFieldsNotPopulated returns false when all fields are populated', () => {
    const newValues = {
      ...values,
      field2: 'some value',
      field3: 'some value',
      field1: 'some value'
    }

    const result = getAreAllFieldsNotPopulated(fieldsToFetchRecords, newValues)
    expect(result).toBe(false)
  })

  test('getAreAllFieldsNotPopulated returns true when one of the field is not populated', () => {
    const newValues = {
      ...values,
      field2: 'some value',
      field3: 'some value'
    }

    const result = getAreAllFieldsNotPopulated(fieldsToFetchRecords, newValues)
    expect(result).toBe(true)
  })
})
