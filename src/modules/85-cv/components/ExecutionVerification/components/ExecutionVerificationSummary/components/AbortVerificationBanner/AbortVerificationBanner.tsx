import React from 'react'
import { Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { VerificationOverview } from 'services/cv'
import { ExecutionNode } from 'services/pipeline-ng'
import { isExecutionWaitingForIntervention } from '@pipeline/utils/statusHelpers'
import { isAbortVerification } from '@cv/components/ExecutionVerification/ExecutionVerificationView.utils'
import { VerificationStatus } from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/components/ChangeEventCard/ChangeEventCard.constant'
import styles from './AbortVerificationBanner.module.scss'

interface AbortVerificationBannerProps {
  verificationStatus?: VerificationOverview['verificationStatus']
  step: ExecutionNode
}

const AbortVerificationBanner = ({ verificationStatus, step }: AbortVerificationBannerProps): JSX.Element | null => {
  const { getString } = useStrings()

  const isAbortedVerification = isAbortVerification(verificationStatus)

  const isManualInterruption = isExecutionWaitingForIntervention(step?.status)

  if (!isAbortedVerification || isManualInterruption) {
    return null
  }

  const displayStatusText =
    verificationStatus === VerificationStatus.ABORTED_AS_SUCCESS ? getString('success') : getString('failed')

  return (
    <Container margin={{ bottom: 'small' }} className={styles.banner} data-testid="abortVerificationBanner">
      <Text color={Color.BLACK} icon="info-messaging" iconProps={{ size: 20, margin: { right: 'small' } }}>
        {getString('cv.abortVerification.bannerMessage', {
          type: displayStatusText?.toLocaleLowerCase()
        })}
      </Text>
    </Container>
  )
}

export default AbortVerificationBanner
