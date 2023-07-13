import { VerificationTypes } from './constants'

const NodeFilteringEnabledTypes = [VerificationTypes.Bluegreen, VerificationTypes.Canary, VerificationTypes.Rolling]

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
  return Boolean((isRegexNodeFilterFFEnabled || isFilterFromCDEnabled) && isValidNodeFilteringType(analysisType))
}
