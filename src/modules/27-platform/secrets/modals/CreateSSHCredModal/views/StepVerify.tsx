/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepProps, Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { SecretValidationMetaData } from 'services/cd-ng'

import VerifyConnection from './VerifyConnection'
import type { SSHCredSharedObj } from '../CreateSSHCredWizard'

import css from './StepDetails.module.scss'

export type SecretValidationType = SecretValidationMetaData['type']

interface StepVerifyProps {
  closeModal?: () => void
  type: SecretValidationType
}
const StepVerify: React.FC<StepProps<SSHCredSharedObj> & StepVerifyProps> = ({ prevStepData, closeModal, type }) => {
  const { getString } = useStrings()
  return (
    <Container padding="small" className={css.sshConnectionContainer}>
      <Text margin={{ bottom: 'xlarge' }} font={{ size: 'medium' }} color={Color.BLACK}>
        {getString('platform.secrets.stepTitleVerify')}
      </Text>
      <VerifyConnection
        closeModal={closeModal}
        identifier={prevStepData?.detailsData?.identifier as string}
        showFinishBtn={true}
        type={type}
      />
    </Container>
  )
}

export default StepVerify
