import React from 'react'
import { Layout, TextInput, Label } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { PipelineSetupState } from '../../../types'

export default function AWSInputs({
  state,
  updateState
}: {
  state: PipelineSetupState['infraInfo']
  updateState: (key: string, value: string) => void
}): JSX.Element {
  const { getString } = useStrings()
  return (
    <>
      <Layout.Vertical width={400} margin={{ left: 'xlarge' }}>
        <Label>{getString('platform.connectors.aws.awsAccessKey')}</Label>
        <TextInput
          id="awsAccessKey"
          name="awsAccessKey"
          defaultValue={state?.accessKey || ''}
          placeholder={getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGCPStep.placholders.accessKeyPlaceholderAws'
          )}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            updateState('accessKey', value)
          }}
        />
      </Layout.Vertical>
      <Layout.Vertical width={400} margin={{ left: 'xlarge' }}>
        <Label>
          {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureAWSStep.awsSVCKey')}
        </Label>
        <TextInput
          id="awsSvcKey"
          name="awsSvcKey"
          defaultValue={state?.svcKeyOrSecretKey || ''}
          placeholder={getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGCPStep.placholders.svckeyPlaceholderAws'
          )}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            updateState('svcKeyOrSecretKey', value)
          }}
        />
      </Layout.Vertical>
      <Layout.Vertical width={400} margin={{ left: 'xlarge' }}>
        <Label>
          {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureAWSStep.awsRegion')}
        </Label>
        <TextInput
          id="region"
          name="region"
          defaultValue={state?.region || ''}
          placeholder={getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureAWSStep.awsRegion'
          )}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            updateState('region', value)
          }}
        />
      </Layout.Vertical>

      <Layout.Vertical width={400} margin={{ left: 'xlarge' }}>
        <Label>
          {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureAWSStep.awsInstance')}
        </Label>
        <TextInput
          id="instanceName"
          name="instanceName"
          defaultValue={state?.instanceName || ''}
          placeholder={getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureAWSStep.awsInstance'
          )}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            updateState('instanceName', value)
          }}
        />
      </Layout.Vertical>
    </>
  )
}
