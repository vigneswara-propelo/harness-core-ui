import React from 'react'
import { Layout, TextInput, Label, Button, ButtonVariation, ButtonSize, SelectOption, DropDown } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useListAwsRegions } from 'services/portal'
import { PipelineSetupState } from '../../../types'
import css from '../../../CDOnboardingWizardWithCLI.module.scss'
export default function AWSInputs({
  state,
  updateState
}: {
  state: PipelineSetupState['infraInfo']
  updateState: (key: string, value: string) => void
}): JSX.Element {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { data: awsRegionsData, loading } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })
  const regions: SelectOption[] = React.useMemo(() => {
    return defaultTo(awsRegionsData?.resource, []).map(region => ({
      value: region.value,
      label: region.name as string
    }))
  }, [awsRegionsData?.resource])

  return (
    <>
      <Layout.Vertical width={400} margin={{ left: 'xlarge' }}>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Label>{getString('platform.connectors.aws.awsAccessKey')}</Label>
          <Button
            target="_blank"
            className={css.alignTitle}
            variation={ButtonVariation.LINK}
            size={ButtonSize.SMALL}
            href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html"
          >
            {getString('common.learnMore')}
          </Button>
        </Layout.Horizontal>
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
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Label>
            {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureAWSStep.awsSVCKey')}
          </Label>
          <Button
            target="_blank"
            className={css.alignTitle}
            variation={ButtonVariation.LINK}
            size={ButtonSize.SMALL}
            href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html"
          >
            {getString('common.learnMore')}
          </Button>
        </Layout.Horizontal>

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
      <Layout.Vertical width={400} margin={{ left: 'xlarge' }} padding={{ bottom: 'large' }}>
        <Label>
          {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureAWSStep.awsRegion')}
        </Label>
        <DropDown
          className={css.dropdownBg}
          items={regions}
          disabled={loading}
          value={state?.region}
          buttonTestId="aws-regions"
          onChange={selected => updateState('region', selected.value.toString())}
          placeholder={getString('pipeline.regionPlaceholder')}
          addClearBtn
          usePortal
          resetOnClose
          resetOnSelect
          minWidth={400}
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
