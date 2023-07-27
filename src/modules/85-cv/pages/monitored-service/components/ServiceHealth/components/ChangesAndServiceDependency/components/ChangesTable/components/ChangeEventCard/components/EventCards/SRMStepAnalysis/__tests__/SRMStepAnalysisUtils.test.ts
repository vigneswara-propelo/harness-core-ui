/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
    const result = calculateEndtime(endTime)
    expect(result).toBe(endTime + 2 * 60 * 60 * 1000)
  })

  test('should return current + 2 * HOUR_IN_MILLISECONDS when endtime is more than current time', () => {
    const endTime = 1630000000010
    const result = calculateEndtime(endTime)
    expect(result).toBe(1630007200000)
  })
})
