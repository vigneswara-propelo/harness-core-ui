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
  analysisType
}: {
  isRegexNodeFilterFFEnabled?: boolean
  isFilterFromCDEnabled?: boolean
  analysisType?: string
}): boolean {
  if (analysisType === VerificationTypes.Auto && !isFilterFromCDEnabled) {
    return false
  }

  return Boolean((isRegexNodeFilterFFEnabled || isFilterFromCDEnabled) && isValidNodeFilteringType(analysisType))
}
