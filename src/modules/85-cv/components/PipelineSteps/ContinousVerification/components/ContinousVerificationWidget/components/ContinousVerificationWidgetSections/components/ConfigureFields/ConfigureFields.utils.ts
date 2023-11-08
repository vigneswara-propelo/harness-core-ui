import { VerificationTypes } from './constants'

const NodeFilteringEnabledTypes = [
  VerificationTypes.Bluegreen,
  VerificationTypes.Canary,
  VerificationTypes.Rolling,
  VerificationTypes.Auto
]

export function isValidNodeFilteringType(type?: string): boolean {
  if (!type) {
    return false
  }

  return NodeFilteringEnabledTypes.includes(type as VerificationTypes)
}

export function canShowNodeFilterOptions({
  isRegexNodeFilterFFEnabled,
  isFilterFromCDEnabled,
  analysisType,
  isFailOnNoCustomMetricsAnalysisEnabled
}: {
  isRegexNodeFilterFFEnabled?: boolean
  isFilterFromCDEnabled?: boolean
  isFailOnNoCustomMetricsAnalysisEnabled?: boolean
  analysisType?: string
}): boolean {
  if (analysisType === VerificationTypes.Auto && !isFilterFromCDEnabled && !isFailOnNoCustomMetricsAnalysisEnabled) {
    return false
  }

  if (isFailOnNoCustomMetricsAnalysisEnabled) {
    return true
  }

  return Boolean((isRegexNodeFilterFFEnabled || isFilterFromCDEnabled) && isValidNodeFilteringType(analysisType))
}
