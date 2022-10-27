import { getConnectorPlaceholderText } from '../DefineHealthSource.utils'

describe('DefineHealthSource.utils.test', () => {
  test('should return correct connector placeholder text', () => {
    const result = getConnectorPlaceholderText('Aws')
    expect(result).toBe('AWS')
  })

  test('should return empty string, if invalid value is passed', () => {
    const result = getConnectorPlaceholderText()
    expect(result).toBe('')
  })

  test('should return correct value, if valid value is passed', () => {
    const result = getConnectorPlaceholderText('Dynatrace')
    expect(result).toBe('Dynatrace')
  })

  test('should return correct value, if data source type is AWS_PROMETHEUS', () => {
    const result = getConnectorPlaceholderText('Prometheus', 'AWS_PROMETHEUS')
    expect(result).toBe('AWS')
  })
})
