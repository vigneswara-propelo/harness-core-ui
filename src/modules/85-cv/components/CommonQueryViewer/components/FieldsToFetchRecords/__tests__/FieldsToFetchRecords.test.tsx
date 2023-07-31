import { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { getIsAnyFieldNonFixed, getIsFetchRecordsHidden } from '../FieldsToFetchRecords.utils'
import { fieldsToFetchRecords } from './FieldsToFetchRecords.mock'

// Test getIsAnyFieldNonFixed function
test('getIsAnyFieldNonFixed should return true when there is at least one non-fixed field', () => {
  const values: CommonCustomMetricFormikInterface = {
    healthSourceMetricName: 'value1',
    healthSourceMetricNamespace: '<+input>',
    identifier: 'identifier',
    metricName: 'identifier',
    groupName: 'g1' // A non-fixed field, as it's not a MultiTypeInputType.FIXED value
  }

  const result = getIsAnyFieldNonFixed(fieldsToFetchRecords, values)
  expect(result).toBe(true)
})

test('getIsAnyFieldNonFixed should return false when all fields are fixed', () => {
  const values: CommonCustomMetricFormikInterface = {
    healthSourceMetricName: 'value1',
    healthSourceMetricNamespace: 'value2',
    identifier: 'identifier',
    metricName: 'identifier',
    groupName: 'g1' // A fixed field, as it's a MultiTypeInputType.FIXED value
  }

  const result = getIsAnyFieldNonFixed(fieldsToFetchRecords, values)
  expect(result).toBe(false)
})

// Test getIsFetchRecordsHidden function
test('getIsFetchRecordsHidden should return true when isConnectorRuntimeOrExpression is true', () => {
  const values: CommonCustomMetricFormikInterface = {
    healthSourceMetricName: 'value1',
    healthSourceMetricNamespace: 'value2',
    identifier: 'identifier',
    metricName: 'identifier',
    groupName: 'g1'
  }

  const isConnectorRuntimeOrExpression = true

  const result = getIsFetchRecordsHidden(fieldsToFetchRecords, values, isConnectorRuntimeOrExpression)
  expect(result).toBe(true)
})

test('getIsFetchRecordsHidden should return false when isConnectorRuntimeOrExpression is false and there are non-fixed fields', () => {
  const values: CommonCustomMetricFormikInterface = {
    healthSourceMetricName: 'value1',
    healthSourceMetricNamespace: '',
    identifier: 'identifier',
    metricName: 'identifier',
    groupName: 'g1' // A non-fixed field, as it's not a MultiTypeInputType.FIXED value
  }

  const isConnectorRuntimeOrExpression = false

  const result = getIsFetchRecordsHidden(fieldsToFetchRecords, values, isConnectorRuntimeOrExpression)
  expect(result).toBe(false)
})
