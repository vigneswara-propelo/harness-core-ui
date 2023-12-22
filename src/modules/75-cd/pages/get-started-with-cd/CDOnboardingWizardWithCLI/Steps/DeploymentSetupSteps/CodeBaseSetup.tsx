/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Button, ButtonSize, ButtonVariation, Label, Layout, Text, TextInput } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { PipelineType, ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import { String, useStrings } from 'framework/strings'
import CommandBlock from '@modules/10-common/CommandBlock/CommandBlock'
import { getCommandStrWithNewline, getProjAndOrgId } from '../../utils'
import { PipelineSetupState } from '../../types'
import TextWithIndex from './TextWithIndex'
import css from '../../CDOnboardingWizardWithCLI.module.scss'

export interface CodeBaseSetupProps {
  state: PipelineSetupState
  onUpdate: (data: PipelineSetupState) => void
}

export default function CodeBaseSetup({ state, onUpdate }: CodeBaseSetupProps): JSX.Element {
  const { getString } = useStrings()

  return (
    <>
      <Text color={Color.BLACK} className={css.commandGap}>
        <String
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.gitStep.cloneAndSetup"
          vars={{ num: '4.' }}
        />
      </Text>
      <div className={cx(css.inputLength, css.inputMargins)}>
        <Label>{getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.gitStep.githubusername')}</Label>
        <TextInput
          id="githubusername"
          name="githubusername"
          defaultValue={state.githubUsername}
          placeholder={getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.gitStep.githubusername')}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            onUpdate({ ...state, githubUsername: value })
          }}
        />
      </div>
      <div className={cx(css.commandBlock, css.commandGap)}>
        <CommandBlock
          allowCopy
          ignoreWhiteSpaces={false}
          commandSnippet={getCommandStrWithNewline([
            `${getString(
              'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.clonecmd',
              { gitUser: isEmpty(state.githubUsername) ? 'GITHUB_USERNAME' : state.githubUsername }
            )} && ${getString(
              'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.cddir'
            )}`
          ])}
          downloadFileProps={{ downloadFileName: 'harness-cli-clone-codebase', downloadFileExtension: 'xdf' }}
          copyButtonText={getString('common.copy')}
        />
      </div>
    </>
  )
}

export function GitPatSetup({ onUpdate, state }: CodeBaseSetupProps): JSX.Element {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier } = useParams<PipelineType<ProjectPathProps>>()

  return (
    <>
      <TextWithIndex index="5. " className={css.commandGap}>
        <Text color={Color.BLACK}>
          <String
            stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.gitStep.createGitPat"
            useRichText
          />
        </Text>
      </TextWithIndex>
      <div className={cx(css.inputLength, css.inputMargins)}>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Label>{getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.gitStep.githubpat')}</Label>
          <Button
            target="_blank"
            className={css.alignTitle}
            variation={ButtonVariation.LINK}
            size={ButtonSize.SMALL}
            href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
          >
            {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.gitStep.whereToFindGitPat')}
          </Button>
        </Layout.Horizontal>

        <TextInput
          defaultValue={state.githubPat}
          id="githubpat"
          name="githubpat"
          placeholder={getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.gitStep.githubpat')}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            onUpdate({ ...state, githubPat: value })
          }}
        />
      </div>
      <div className={cx(css.commandBlock, css.commandGap)}>
        <CommandBlock
          allowCopy
          ignoreWhiteSpaces={false}
          commandSnippet={getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.createsecret',
            {
              gitPat:
                state.githubPat ||
                getString(
                  'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.gitpatPlaceholder'
                ),
              ...getProjAndOrgId(projectIdentifier, orgIdentifier)
            }
          )}
          downloadFileProps={{ downloadFileName: 'harness-cli-clone-codebase', downloadFileExtension: 'xdf' }}
          copyButtonText={getString('common.copy')}
        />
      </div>
    </>
  )
}
