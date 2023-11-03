import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  DropDown,
  Label,
  Layout,
  SelectOption,
  Text,
  TextInput
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { String, useStrings } from 'framework/strings'
import { useListAwsRegions } from 'services/portal'
import { CDOnboardingSteps, PipelineSetupState } from '../../../types'
import { useOnboardingStore } from '../../../Store/OnboardingStore'
import css from '../../../CDOnboardingWizardWithCLI.module.scss'
export default function ConfigureServerless({
  onUpdate
}: {
  onUpdate: (data: PipelineSetupState) => void
}): JSX.Element {
  const { stepsProgress } = useOnboardingStore()
  const { getString } = useStrings()
  const pipelineState = React.useMemo((): PipelineSetupState => {
    return stepsProgress[CDOnboardingSteps.DEPLOYMENT_STEPS].stepData as PipelineSetupState
  }, [stepsProgress])

  const [state, setState] = useState<PipelineSetupState['infraInfo']>(() => {
    const prevState = pipelineState?.infraInfo
    return prevState
  })
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

  const updateState = (key: string, value: string): void => {
    setState(prevState => ({ ...prevState, [key]: value }))
  }
  useEffect(() => {
    onUpdate({ ...pipelineState, infraInfo: state })
  }, [state])
  return (
    <Layout.Vertical margin={{ top: 'large', bottom: 'xlarge' }}>
      <Text color={Color.BLACK} margin={{ bottom: 'large' }} font={{ variation: FontVariation.FORM_TITLE }}>
        <String
          useRichText
          color={Color.BLACK}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.headsteps.configureAws"
        />
      </Text>

      <Text color={Color.BLACK} margin={{ bottom: 'xlarge' }}>
        <String
          useRichText
          color={Color.BLACK}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureAWSStep.getPermissions"
        />
      </Text>
      <Text color={Color.BLACK} margin={{ bottom: 'xlarge' }}>
        <String
          useRichText
          color={Color.BLACK}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureAWSStep.createBucket"
        />
      </Text>
      <Text color={Color.BLACK} margin={{ bottom: 'xlarge' }}>
        <String
          useRichText
          color={Color.BLACK}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureAWSStep.downloadArtifact"
        />
      </Text>
      <Button
        margin={{ bottom: 'xlarge', left: 'xlarge' }}
        variation={ButtonVariation.PRIMARY}
        width={180}
        icon="arrow-down"
        text={getString('cd.getStartedWithCD.downloadZipFile')}
      />
      <Text color={Color.BLACK} margin={{ bottom: 'xlarge' }}>
        <String
          useRichText
          color={Color.BLACK}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureAWSStep.inputAWSInfo"
        />
      </Text>
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
      <Layout.Vertical width={400} margin={{ left: 'xlarge' }}>
        <Label>{getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureAWSStep.awsARN')}</Label>
        <TextInput
          id="awsArn"
          name="awsArn"
          defaultValue={state?.awsArn || ''}
          placeholder={getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureAWSStep.awsARN')}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            updateState('awsArn', value)
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
          value={pipelineState?.infraInfo?.region}
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
    </Layout.Vertical>
  )
}
