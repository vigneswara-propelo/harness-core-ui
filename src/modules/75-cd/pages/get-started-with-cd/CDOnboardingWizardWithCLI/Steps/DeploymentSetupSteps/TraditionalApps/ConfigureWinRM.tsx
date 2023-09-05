import React, { useEffect, useState } from 'react'
import { Label, Layout, Text, TextInput } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import { useOnboardingStore } from '../../../Store/OnboardingStore'
import { PipelineSetupState, CDOnboardingSteps } from '../../../types'

export default function ConfigureWinRM({ onUpdate }: { onUpdate: (data: PipelineSetupState) => void }): JSX.Element {
  const { stepsProgress } = useOnboardingStore()
  const { getString } = useStrings()
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
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureAWSStep.inputWINRMInfo"
        />
      </Text>
      <Layout.Vertical width={400} margin={{ left: 'xlarge' }}>
        <Label>
          {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureTraditionalStep.winrmDomain')}
        </Label>
        <TextInput
          id="winrmDomain"
          name="winrmDomain"
          defaultValue={state?.domain || ''}
          placeholder={getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureTraditionalStep.winrmDomain'
          )}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            updateState('domain', value)
          }}
        />
      </Layout.Vertical>
      <Layout.Vertical width={400} margin={{ left: 'xlarge' }}>
        <Label>
          {getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureTraditionalStep.winrmUsername'
          )}
        </Label>
        <TextInput
          id="winrmUsername"
          name="winrmUsername"
          defaultValue={state?.username || ''}
          placeholder={getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureTraditionalStep.winrmUsername'
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
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureTraditionalStep.winrmPassword'
          )}
        </Label>
        <TextInput
          id="winrmPassword"
          name="winrmPassword"
          defaultValue={state?.privateKeyFile || ''}
          placeholder={getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureTraditionalStep.winrmPassword'
          )}
          type="password"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            updateState('password', value)
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
    </Layout.Vertical>
  )
}
