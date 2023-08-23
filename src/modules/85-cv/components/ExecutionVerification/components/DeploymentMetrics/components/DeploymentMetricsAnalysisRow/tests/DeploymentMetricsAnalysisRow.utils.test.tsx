import { RiskValues } from '@cv/utils/CommonUtils'
import { getVerificationType } from '../DeploymentMetricsAnalysisRow.utils'

describe('DeploymentMetricsAnalysisRow', () => {
  test('should test for warning risk correct message is being shown', () => {
    const result = getVerificationType(RiskValues.WARNING, key => key)

    expect(result).toBe('common.warning')
  })
  test('should test for failed risk correct message is being shown', () => {
    const result = getVerificationType(RiskValues.FAILED, key => key)

    expect(result).toBe('failed')
  })
})
