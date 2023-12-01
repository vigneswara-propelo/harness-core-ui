import { getDisplayName, getInitialValue } from '../ApplicationIdDropdown.utils'

describe('ApplicationIdDropdown.utils.ts', () => {
  test('getInitialValue should return null if selectedValue is not passed', () => {
    const result = getInitialValue()

    expect(result).toBeNull()
  })

  test('getInitialValue should return correct result if selectedValue is not passed', () => {
    const result = getInitialValue('test')

    expect(result).toEqual({ label: 'test', value: 'test' })
  })

  test('getDisplayName should return loading text if applicationLoading param passed as loading', () => {
    const result = getDisplayName({ selectedOption: null, applicationLoading: true, getString: key => key })

    expect(result).toBe('loading')
  })
})
