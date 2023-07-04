import { VerificationJobType } from '@cv/constants'
import { VerificationStatus } from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/components/ChangeEventCard/ChangeEventCard.constant'
import type { UseStringsReturn } from 'framework/strings'
import type { BaselineOverview, VerificationOverview, VerificationSpec } from 'services/cv'

export const canShowBaselineElements = ({
  applicableForBaseline,
  isBaselineEnabled,
  isConsoleView
}: {
  applicableForBaseline?: boolean
  isBaselineEnabled?: boolean
  isConsoleView?: boolean
}): boolean => {
  return Boolean(isBaselineEnabled && applicableForBaseline && isConsoleView)
}

export const getStatusMessage = ({
  analysisType,
  verificationStatus,
  getString
}: {
  analysisType: VerificationSpec['analysisType']
  verificationStatus: VerificationOverview['verificationStatus']
  getString: UseStringsReturn['getString']
}): string | null => {
  if (analysisType !== VerificationJobType.SIMPLE) {
    return null
  }

  if (verificationStatus === VerificationStatus.VERIFICATION_PASSED) {
    return getString('pipeline.verification.simpleVerificationMessages.passed')
  } else if (verificationStatus === VerificationStatus.VERIFICATION_FAILED) {
    return getString('pipeline.verification.simpleVerificationMessages.failed')
  }

  return null
}

export const canShowExpiryDateDetails = (baselineData?: BaselineOverview): boolean => {
  if (!baselineData) {
    return false
  }

  const { baselineExpired, baselineVerificationJobInstanceId } = baselineData
  return Boolean(!baselineExpired && baselineVerificationJobInstanceId)
}
