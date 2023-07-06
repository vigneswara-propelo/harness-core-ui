import { isValidNodeFilteringType } from '../ConfigureFields.utils'

describe('ConfigureFields utils', () => {
  test('isValidNodeFilteringType should return false if type is not passed', () => {
    const result = isValidNodeFilteringType()

    expect(result).toBe(false)
  })
})
