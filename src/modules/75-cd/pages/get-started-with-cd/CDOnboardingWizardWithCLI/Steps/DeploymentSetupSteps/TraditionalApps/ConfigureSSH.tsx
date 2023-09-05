import React, { useEffect, useState } from 'react'
import { Label, Layout, Text, TextInput } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import { useOnboardingStore } from '../../../Store/OnboardingStore'
import { PipelineSetupState, CDOnboardingSteps, WhatToDeployType } from '../../../types'
import AWSInputs from './AWSInputs'

export default function ConfigureSSH({ onUpdate }: { onUpdate: (data: PipelineSetupState) => void }): JSX.Element {
  const { stepsProgress } = useOnboardingStore()
  const { getString } = useStrings()
  const isAWS = React.useMemo((): boolean => {
    return (
      stepsProgress[CDOnboardingSteps.WHAT_TO_DEPLOY].stepData as WhatToDeployType
    )?.artifactSubType?.id?.includes('AWS') as boolean
  }, [stepsProgress])
  const pipelineState = React.useMemo((): PipelineSetupState => {
    return stepsProgress[CDOnboardingSteps.DEPLOYMENT_STEPS].stepData as PipelineSetupState
  }, [stepsProgress])

  const [state, setState] = useState<PipelineSetupState['infraInfo']>(() => {
    const prevState = pipelineState?.infraInfo
    return prevState
  })
  const updateState = (key: string, value: string): void => {
    setState(prevState => ({ ...prevState, [key]: value }))
  }
  useEffect(() => {
    onUpdate({ ...pipelineState, infraInfo: state })
  }, [state])
  return (
    <Layout.Vertical margin={{ top: 'large', bottom: 'xlarge' }}>
      <Text color={Color.BLACK} margin={{ bottom: 'xlarge' }} font={{ variation: FontVariation.FORM_TITLE }}>
        <String
          useRichText
          color={Color.BLACK}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureAWSStep.inputSSHInfo"
        />
      </Text>
      <Layout.Vertical width={400} margin={{ left: 'xlarge' }}>
        <Label>
          {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureTraditionalStep.sshUsername')}
        </Label>
        <TextInput
          id="sshUsername"
          name="sshUsername"
          defaultValue={state?.username || ''}
          placeholder={getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureTraditionalStep.sshUsername'
          )}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            updateState('username', value)
          }}
        />
      </Layout.Vertical>
      <Layout.Vertical width={400} margin={{ left: 'xlarge' }}>
        <Label>
          {getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureTraditionalStep.sshPrivateKey'
          )}
        </Label>
        <TextInput
          id="sshPrivateKey"
          name="sshPrivateKey"
          defaultValue={state?.privateKeyFile || ''}
          placeholder={getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureTraditionalStep.sshPrivateKeyFilePlaceholder'
          )}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            updateState('privateKeyFile', value)
          }}
        />
      </Layout.Vertical>
      <Layout.Vertical width={400} margin={{ left: 'xlarge' }}>
        <Label>{getString('common.smtp.port')}</Label>
        <TextInput
          id="port"
          name="port"
          defaultValue={state?.port || ''}
          placeholder={getString('common.smtp.port')}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            updateState('port', value)
          }}
        />
      </Layout.Vertical>
      <Layout.Vertical width={400} margin={{ left: 'xlarge' }}>
        <Label>{getString('common.smtp.hostipfqdn')}</Label>
        <TextInput
          id="hostipfqdn"
          name="hostipfqdn"
          defaultValue={state?.hostIP || ''}
          placeholder={getString('common.smtp.hostipfqdn')}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            updateState('hostIP', value)
          }}
        />
      </Layout.Vertical>
      {isAWS && <AWSInputs state={state} updateState={updateState} />}
    </Layout.Vertical>
  )
}
