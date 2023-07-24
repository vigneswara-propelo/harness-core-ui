import { convertToDays, calculateEndtime } from '../SRMStepAnalysis.utils'

const mockGetString = jest.fn((key, params) => {
  if (key === 'cv.oneDay') return '1 Day'
  if (key === 'cv.nDays') return `${params.n} Days`
  if (key === 'cv.analyzeDeploymentImpact.duration') return 'Duration'
}) as any

jest.spyOn(Date, 'now').mockReturnValue(1630000000000)

describe('Test convertToDays', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should return "cv.analyzeDeploymentImpact.duration: 1 Day" when duration is 1', () => {
    const result5Days = convertToDays(mockGetString, 432000)
    expect(result5Days).toBe('Duration: 5 Days')

    const result1Day = convertToDays(mockGetString, 86400)
    expect(result1Day).toBe('Duration: 1 Day')

    const resultNoDuration = convertToDays(mockGetString)
    expect(resultNoDuration).toBe('Duration: ')
  })
})

describe('Test calculateEndtime', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should return endTime + TWO_HOURS_IN_MILLISECONDS when endTime is before the current time', () => {
    const endTime = 1629999999999
    const duration = 1000
    const result = calculateEndtime(endTime, duration)
    expect(result).toBe(endTime + 2 * 60 * 60 * 1000)
  })

  test('should return current + 12 * HOUR_IN_MILLISECONDS when duration is ONE_DAY_DURATION', () => {
    const endTime = 1630000000010
    const duration = 86400000
    const result = calculateEndtime(endTime, duration)
    expect(result).toBe(1630086400000)
  })

  test('should return current + 24 * HOUR_IN_MILLISECONDS when duration is greater than ONE_DAY_DURATION', () => {
    const endTime = 1630000000010
    const duration = 172800000
    const result = calculateEndtime(endTime, duration)
    expect(result).toBe(1630086400000)
  })
})
