import { VerificationOverview } from 'services/cv'
import { getInitialClustersFilterValue } from '../LogAnalysisView.container.utils'
import { overviewDataWithBaselineDataWithTimestamp } from './LogAnalysisContainer.mocks'

describe('getInitialClustersFilterValue', () => {
  test('should return correct cluster types if filter anomalous', () => {
    const result = getInitialClustersFilterValue({
      getString: a => a,
      filterAnomalous: 'true',
      overviewData: overviewDataWithBaselineDataWithTimestamp as VerificationOverview,
      overviewLoading: false
    })

    expect(result).toEqual(['UNKNOWN_EVENT', 'UNEXPECTED_FREQUENCY'])
  })

  test('should return correct empty array if overview data is null', () => {
    const result = getInitialClustersFilterValue({
      getString: a => a,
      filterAnomalous: 'true',
      overviewData: null,
      overviewLoading: false
    })

    expect(result).toEqual([])
  })
})
