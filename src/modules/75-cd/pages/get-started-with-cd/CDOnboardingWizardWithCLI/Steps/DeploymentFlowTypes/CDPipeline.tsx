/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color } from '@harness/design-system'
import { Layout, Text, Button, ButtonVariation } from '@harness/uicore'
import { String, useStrings } from 'framework/strings'
import VerifyDelegateConnection from '@delegates/pages/delegates/delegateCommandLineCreation/components/VerifyDelegateConnection'
import { DelegateCommonProblemTypes } from '@delegates/constants'
import DelegateModal, { DelgateDetails } from '../../DelegateModal'
import { CLOUD_FUNCTION_TYPES, WhatToDeployType, WhereAndHowToDeployType } from '../../types'
import { getDelegateTypeString } from '../../utils'

export interface CDPipelineProps {
  state: WhereAndHowToDeployType
  closeDelegateDialog: (data: DelgateDetails) => void
  openDelagateDialog: () => void
  isDrawerOpen: boolean
  onDelegateFail: () => void
  onDelegateSuccess: () => void
  onVerificationStart?: () => void
  delegateTypes?: string[]
  deploymentTypeDetails: WhatToDeployType
}
export default function CDPipeline({
  state,
  isDrawerOpen,
  closeDelegateDialog,
  openDelagateDialog,
  onDelegateFail,
  onDelegateSuccess,
  onVerificationStart,
  delegateTypes,
  deploymentTypeDetails
}: CDPipelineProps): JSX.Element {
  const { getString } = useStrings()
  const showServerlessImage = deploymentTypeDetails.artifactSubType?.id === CLOUD_FUNCTION_TYPES.ServerLessLambda

  return (
    <Layout.Vertical spacing="large">
      <Text color={Color.BLACK}>
        <String stringID="cd.getStartedWithCD.flowByQuestions.what.nonK8sStep" useRichText />
      </Text>

      <Layout.Vertical spacing="large">
        {!state.isDelegateVerified && (
          <Button
            variation={ButtonVariation.PRIMARY}
            width={'fit-content'}
            onClick={openDelagateDialog}
            margin={{ bottom: 'large' }}
          >
            {getString('cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdPipeline.installButton', {
              type: getDelegateTypeString(deploymentTypeDetails, getString)
            })}
          </Button>
        )}

        <DelegateModal
          delegateName={state.delegateName}
          onClose={closeDelegateDialog}
          enabledDelegateTypes={delegateTypes}
          isOpen={isDrawerOpen}
          checkAndSuggestDelegateName
          customImageName={showServerlessImage ? 'harnesscommunity/serverless-delegate:latest' : undefined}
        />
        {state?.delegateName && state?.delegateType && !isDrawerOpen && (
          <VerifyDelegateConnection
            delegateType={state?.delegateProblemType as DelegateCommonProblemTypes}
            name={state.delegateName as string}
            onSuccessHandler={onDelegateSuccess}
            showDoneButton={false}
            onDone={() => {
              //
            }}
            onErrorHandler={onDelegateFail}
            onVerificationStart={onVerificationStart}
          />
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
