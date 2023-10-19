import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import CommandBlock from '@modules/10-common/CommandBlock/CommandBlock'
import { AccountPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import { String, useStrings } from 'framework/strings'
import { InstallCLIInfo } from './CLISetupStep'
import ApiKeySetup from './ApiKeySetup'
import { PipelineSetupState } from '../../types'
import VerifyGitopsEntities from '../VerificationComponents/VerifyGitopsEntities'
import css from '../../CDOnboardingWizardWithCLI.module.scss'
interface GitopsDeploymentSetupProps {
  state: PipelineSetupState
  onKeyGenerate: (data: PipelineSetupState) => void
  saveProgress: (stepId: string, data: unknown) => void
}
export default function GitopsDeploymentSetup({
  onKeyGenerate,
  state,
  saveProgress
}: GitopsDeploymentSetupProps): JSX.Element {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  return (
    <Layout.Vertical spacing="xlarge">
      <Text color={Color.BLACK}>
        <String
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.gitopsTitle"
          useRichText
        />
      </Text>
      <Layout.Vertical spacing={'large'}>
        <Text color={Color.BLACK} className={css.bold}>
          <String
            stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.title"
            vars={{ titleIndex: '1. ' }}
          />
        </Text>
        <InstallCLIInfo />

        <Text className={css.bold} color={Color.BLACK}>
          <String
            stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.setupEntites"
            vars={{ titleIndex: '2. ' }}
          />
        </Text>
        <Layout.Vertical margin={{ left: 'large' }}>
          <ApiKeySetup
            onKeyGenerate={onKeyGenerate}
            state={state}
            title={getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.prepareStep.gitopsTitle')}
          />
        </Layout.Vertical>
        <Layout.Vertical spacing="large" margin={{ left: 'large' }}>
          <Text color={Color.BLACK} margin={{ bottom: 'small' }}>
            <String stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.prepareStep.gitopsLogin" />
          </Text>
          <CommandBlock
            allowCopy
            ignoreWhiteSpaces={false}
            commandSnippet={getString(
              'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.logincmd',
              {
                accId: accountId,
                apiKey: state?.apiKey
              }
            )}
            downloadFileProps={{ downloadFileName: 'harness-cli-install-steps', downloadFileExtension: 'xdf' }}
            copyButtonText={getString('common.copy')}
          />

          <Text color={Color.BLACK} margin={{ bottom: 'small' }}>
            <String
              useRichText
              stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.prepareStep.gitopsClone"
            />
          </Text>
          <CommandBlock
            allowCopy
            ignoreWhiteSpaces={false}
            commandSnippet={getString(
              'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.clonecmd'
            )}
            downloadFileProps={{ downloadFileName: 'harness-cli-install-steps', downloadFileExtension: 'xdf' }}
            copyButtonText={getString('common.copy')}
          />

          <Text color={Color.BLACK} margin={{ bottom: 'small' }}>
            <String
              useRichText
              stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createGitopsCluster"
            />
          </Text>
          <CommandBlock
            allowCopy
            ignoreWhiteSpaces={false}
            commandSnippet={getString(
              'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.gitops.createCluster',
              {
                accId: accountId,
                apiKey: state?.apiKey
              }
            )}
            downloadFileProps={{ downloadFileName: 'harness-cli-install-steps', downloadFileExtension: 'xdf' }}
            copyButtonText={getString('common.copy')}
          />

          <Text color={Color.BLACK} margin={{ bottom: 'small' }}>
            <String
              useRichText
              stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createGitopsRepo"
            />
          </Text>
          <CommandBlock
            allowCopy
            ignoreWhiteSpaces={false}
            commandSnippet={getString(
              'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.gitops.createRepo',
              {
                accId: accountId,
                apiKey: state?.apiKey
              }
            )}
            downloadFileProps={{ downloadFileName: 'harness-cli-install-steps', downloadFileExtension: 'xdf' }}
            copyButtonText={getString('common.copy')}
          />

          <Text color={Color.BLACK} margin={{ bottom: 'small' }}>
            <String
              useRichText
              stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createGitopsApp"
            />
          </Text>
          <CommandBlock
            allowCopy
            ignoreWhiteSpaces={false}
            commandSnippet={getString(
              'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.gitops.createApplication',
              {
                accId: accountId,
                apiKey: state?.apiKey
              }
            )}
            downloadFileProps={{ downloadFileName: 'harness-cli-install-steps', downloadFileExtension: 'xdf' }}
            copyButtonText={getString('common.copy')}
          />
        </Layout.Vertical>

        <VerifyGitopsEntities saveProgress={saveProgress} />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
