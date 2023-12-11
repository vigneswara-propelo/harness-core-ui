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
