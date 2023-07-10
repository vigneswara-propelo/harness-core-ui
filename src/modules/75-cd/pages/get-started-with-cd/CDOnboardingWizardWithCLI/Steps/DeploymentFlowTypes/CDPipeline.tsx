import React from 'react'
import { Color } from '@harness/design-system'
import { Layout, Text, Button, ButtonVariation } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import VerifyDelegateConnection from '@delegates/pages/delegates/delegateCommandLineCreation/components/VerifyDelegateConnection'
import { DelegateCommonProblemTypes } from '@delegates/constants'
import DelegateModal, { DelgateDetails } from '../../DelegateModal'
import type { WhereAndHowToDeployType } from '../../types'
import css from '../../CDOnboardingWizardWithCLI.module.scss'
export interface CDPipelineProps {
  state: WhereAndHowToDeployType
  closeDelegateDialog: (data: DelgateDetails) => void
  openDelagateDialog: () => void
  isDrawerOpen: boolean
  onDelegateFail: () => void
  onDelegateSuccess: () => void
}
export default function CDPipeline({
  state,
  isDrawerOpen,
  closeDelegateDialog,
  openDelagateDialog,
  onDelegateFail,
  onDelegateSuccess
}: CDPipelineProps): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      <Text color={Color.BLACK} className={css.bold} margin={{ bottom: 'large' }}>
        {getString('cd.getStartedWithCD.flowbyquestions.howNwhere.K8s.cdPipeline.title')}
      </Text>
      <Text color={Color.BLACK} margin={{ bottom: 'large' }}>
        {getString('cd.getStartedWithCD.flowbyquestions.howNwhere.K8s.cdPipeline.description1')}
      </Text>
      <Text color={Color.BLACK} margin={{ bottom: 'xxlarge' }}>
        {getString('cd.getStartedWithCD.flowbyquestions.howNwhere.K8s.cdPipeline.delegateDescription2')}
      </Text>
      {!state.isDelegateVerified && (
        <Button variation={ButtonVariation.PRIMARY} width={'fit-content'} onClick={openDelagateDialog}>
          {getString('cd.getStartedWithCD.flowbyquestions.howNwhere.K8s.cdPipeline.installButton')}
        </Button>
      )}
      <Layout.Vertical margin={{ bottom: 'large' }}>
        <DelegateModal
          delegateName={state.delegateName}
          delegateProblemType={state?.delegateProblemType as string}
          onClose={closeDelegateDialog}
          hideDocker
          isOpen={isDrawerOpen}
          checkAndSuggestDelegateName
        />
      </Layout.Vertical>

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
        />
      )}
    </Layout.Vertical>
  )
}
