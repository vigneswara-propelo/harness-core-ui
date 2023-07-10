import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Text, TextInput, Label } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { UseStringsReturn } from 'framework/strings'
import { String, useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import CommandBlock from '@common/CommandBlock/CommandBlock'
import { getCommandStrWithNewline } from '../../utils'
import { CDOnboardingSteps, PipelineSetupState, WhereAndHowToDeployType } from '../../types'
import { useOnboardingStore } from '../../Store/OnboardingStore'
import css from '../../CDOnboardingWizardWithCLI.module.scss'

export default function PipelineSetupStep({
  onUpdate,
  state
}: {
  state: PipelineSetupState
  onUpdate: (data: PipelineSetupState) => void
}): JSX.Element {
  const { getString } = useStrings()
  const { stepsProgress } = useOnboardingStore()
  return (
    <Layout.Vertical className={css.deploymentSteps}>
      <Layout.Vertical margin={{ top: 'xxlarge' }}>
        <Text color={Color.BLACK} margin={{ bottom: 'large' }}>
          <String
            useRichText
            color={Color.BLACK}
            className={css.marginBottomLarge}
            stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.title"
            vars={{ guestBookURL: 'https://github.com/harness-community/harnesscd-example-apps/tree/master/guestbook' }}
          />
        </Text>
        <Layout.Vertical margin={{ top: 'medium' }}>
          <Layout.Vertical width={400}>
            <Label>
              {getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.githubusername')}
            </Label>
            <TextInput
              id="githubusername"
              name="githubusername"
              defaultValue={state.githubUsername}
              placeholder={getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.githubusername')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value
                onUpdate({ ...state, githubUsername: value })
              }}
            />
          </Layout.Vertical>
          <Layout.Vertical width={400}>
            <Label>{getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.githubpat')}</Label>
            <TextInput
              defaultValue={state.githubPat}
              id="githubpat"
              name="githubpat"
              placeholder={getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step3.githubpat')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value
                onUpdate({ ...state, githubPat: value })
              }}
            />
          </Layout.Vertical>
        </Layout.Vertical>
      </Layout.Vertical>
      <CLISteps
        getString={getString}
        state={state}
        delegateName={
          (stepsProgress[CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY].stepData as WhereAndHowToDeployType)?.delegateName
        }
      />
    </Layout.Vertical>
  )
}

function CLISteps({
  getString,
  state,
  delegateName
}: {
  getString: UseStringsReturn['getString']
  state: PipelineSetupState
  delegateName?: string
}): JSX.Element {
  const { accountId } = useParams<AccountPathProps>()

  const commandSnippet = React.useMemo((): string => {
    return getCommandStrWithNewline([
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step4.commands.clonecmd', {
        gitUser: state.githubUsername
      }),
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step4.commands.cddir'),
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step4.commands.logincmd', {
        accId: accountId,
        apiKey: state.apiKey
      }),
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step4.commands.createsecret', {
        gitPat: state.githubPat
      }),
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step4.commands.creategithubcon', {
        gitUser: state.githubUsername
      }),
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step4.commands.createk8scon', {
        delegateName
      }),
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step4.commands.createsvccmd'),
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step4.commands.createenvcmd'),
      getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step4.commands.createinfracmd')
    ])
  }, [state])

  return (
    <Layout.Vertical>
      <Text color={Color.BLACK} padding={{ top: 'large' }}>
        <String
          useRichText
          color={Color.BLACK}
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step4.title"
        />
      </Text>
      <Text color={Color.BLACK} padding={{ top: 'large' }}>
        <String
          useRichText
          color={Color.BLACK}
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step4.description1"
          vars={{ guestBookURL: 'https://github.com/harness-community/harnesscd-example-apps/tree/master/guestbook' }}
        />
      </Text>
      <Text color={Color.BLACK} padding={{ bottom: 'xlarge' }}>
        <String
          useRichText
          color={Color.BLACK}
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step4.description2"
        />
      </Text>
      <CommandBlock
        darkmode
        allowCopy={true}
        commandSnippet={commandSnippet}
        ignoreWhiteSpaces={false}
        downloadFileProps={{ downloadFileName: 'harness-cli-setup', downloadFileExtension: 'xdf' }}
        copyButtonText={getString('common.copy')}
      />
    </Layout.Vertical>
  )
}
