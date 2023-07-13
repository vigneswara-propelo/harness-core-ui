import { VerificationTypesOptionsType } from '../SelectVerificationType.types'

export function getInitialValue(
  verificationOptions: VerificationTypesOptionsType[],
  type?: string
): VerificationTypesOptionsType | null {
  if (!type) {
    return null
  }

  return verificationOptions.find(verificationOption => verificationOption.value === type) || null
}
