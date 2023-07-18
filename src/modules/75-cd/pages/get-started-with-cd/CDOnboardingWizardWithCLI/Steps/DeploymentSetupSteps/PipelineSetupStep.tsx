/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Text, TextInput, Label, Button, ButtonVariation, ButtonSize } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
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
      <Layout.Vertical margin={{ top: 'xxlarge', bottom: 'xlarge' }}>
        <Text color={Color.BLACK} margin={{ bottom: 'large' }}>
          <String
            useRichText
            color={Color.BLACK}
            className={css.marginBottomLarge}
            stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step4.title"
            vars={{ guestBookURL: 'https://github.com/harness-community/harnesscd-example-apps/tree/master/guestbook' }}
          />
        </Text>
        <Layout.Vertical margin={{ top: 'medium' }}>
          <Layout.Vertical width={400}>
            <Label>{getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step4.githubusername')}</Label>
            <TextInput
              id="githubusername"
              name="githubusername"
              defaultValue={state.githubUsername}
              placeholder={getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step4.githubusername')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value
                onUpdate({ ...state, githubUsername: value })
              }}
            />
          </Layout.Vertical>
          <Layout.Vertical width={400}>
            <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
              <Label>{getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step4.githubpat')}</Label>
              <Button
                target="_blank"
                className={css.alignTitle}
                variation={ButtonVariation.LINK}
                size={ButtonSize.SMALL}
                href="https://docs.github.com/en/enterprise-server@3.6/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
              >
                {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step4.whereToFindGitPat')}
              </Button>
            </Layout.Horizontal>

            <TextInput
              defaultValue={state.githubPat}
              id="githubpat"
              name="githubpat"
              placeholder={getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step4.githubpat')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value
                onUpdate({ ...state, githubPat: value })
              }}
            />
          </Layout.Vertical>
        </Layout.Vertical>
      </Layout.Vertical>
      <Text color={Color.BLACK} font={{ variation: FontVariation.FORM_TITLE }} margin={{ bottom: 'large' }}>
        <String
          color={Color.BLACK}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.headsteps.createEntities"
        />
      </Text>
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
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.comments.cloneRepo'),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.clonecmd', {
        gitUser:
          state.githubUsername ||
          getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.gitusernamePlaceholder')
      }),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.comments.cdDir'),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.cddir'),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.comments.login'),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.logincmd', {
        accId: accountId,
        apiKey: state.apiKey
      }),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.comments.createSecret'),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.createsecret', {
        gitPat:
          state.githubPat ||
          getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.gitpatPlaceholder')
      }),

      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.comments.createGitIcon'),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.createGithubIcon', {
        gitUser:
          state.githubUsername ||
          getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.gitusernamePlaceholder')
      }),

      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.comments.createK8scon'),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.createk8scon', {
        delegateName
      }),

      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.comments.createSvc'),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.createsvccmd'),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.comments.createEnv'),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.createenvcmd'),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.comments.createInfra'),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step5.commands.createinfracmd')
    ])
  }, [state])

  return (
    <Layout.Vertical margin={{ bottom: 'xlarge' }}>
      <Text color={Color.BLACK} padding={{ bottom: 'large' }}>
        <String
          useRichText
          color={Color.BLACK}
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.createEntitytitle"
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
