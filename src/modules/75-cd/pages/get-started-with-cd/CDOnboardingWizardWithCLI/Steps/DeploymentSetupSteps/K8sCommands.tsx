/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { String, useStrings } from 'framework/strings'
import { PipelineType, ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import { CDOnboardingSteps, PipelineSetupState, WhereAndHowToDeployType } from '../../types'
import { useOnboardingStore } from '../../Store/OnboardingStore'
import { DEPLOYMENT_TYPE_TO_DIR_MAP, DEPLOYMENT_TYPE_TO_FILE_MAPS } from '../../Constants'
import { getProjAndOrgId } from '../../utils'
import CodeBaseSetup, { GitPatSetup } from './CodeBaseSetup'
import CommandRow from './CommandRow'
import css from '../../CDOnboardingWizardWithCLI.module.scss'

export default function K8sCommands({
  onUpdate,
  state
}: {
  state: PipelineSetupState
  onUpdate: (data: PipelineSetupState) => void
}): JSX.Element {
  const { getString } = useStrings()
  const { stepsProgress } = useOnboardingStore()
  const deploymentData = stepsProgress?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData
  const artifactSubType = deploymentData?.artifactSubType?.id
  const dirPath = artifactSubType
    ? DEPLOYMENT_TYPE_TO_DIR_MAP[artifactSubType]
    : DEPLOYMENT_TYPE_TO_DIR_MAP[deploymentData?.artifactType?.id as string]
  const { service, infrastructure, env } = DEPLOYMENT_TYPE_TO_FILE_MAPS[artifactSubType as string] || {}
  const { orgIdentifier, projectIdentifier } = useParams<PipelineType<ProjectPathProps>>()

  return (
    <Layout.Vertical className={css.deploymentSteps}>
      <Layout.Vertical margin={{ bottom: 'xlarge' }}>
        <CodeBaseSetup state={state} onUpdate={onUpdate} />
        <GitPatSetup state={state} onUpdate={onUpdate} />
        <CommandRow
          classname={css.commandGap}
          commandSnippet={getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.k8s.createGithubcon',
            {
              gitUser:
                state?.githubUsername ||
                getString(
                  'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.gitusernamePlaceholder'
                ),
              type: dirPath,
              ...getProjAndOrgId(projectIdentifier, orgIdentifier)
            }
          )}
          title={
            <>
              <String
                stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createGitcon"
                vars={{ num: '6.' }}
              />
              &nbsp;
              <String
                stringID="common.learnMoreWithURL"
                vars={{
                  link: 'https://developer.harness.io/docs/platform/connectors/code-repositories/ref-source-repo-provider/git-hub-connector-settings-reference/'
                }}
                useRichText
              />
            </>
          }
        />

        <CommandRow
          classname={css.commandGap}
          commandSnippet={getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.k8s.createk8scon',
            {
              delegateName: (
                stepsProgress?.[CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY]?.stepData as WhereAndHowToDeployType
              )?.delegateName,
              type: dirPath,
              ...getProjAndOrgId(projectIdentifier, orgIdentifier)
            }
          )}
          title={
            <>
              <String
                stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createK8scon"
                vars={{ num: '7.' }}
                useRichText
              />
              &nbsp;
              <String
                stringID="common.learnMoreWithURL"
                vars={{
                  link: 'https://developer.harness.io/docs/platform/connectors/cloud-providers/ref-cloud-providers/kubernetes-cluster-connector-settings-reference/'
                }}
                useRichText
              />
            </>
          }
        />

        <CommandRow
          classname={css.commandGap}
          commandSnippet={getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.k8s.createsvccmd',
            {
              type: dirPath,
              service: service || 'service',
              ...getProjAndOrgId(projectIdentifier, orgIdentifier)
            }
          )}
          title={
            <>
              <String
                stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createSvc"
                vars={{ num: '8.' }}
                useRichText
              />
              &nbsp;
              <String
                stringID="common.learnMoreWithURL"
                vars={{
                  link: 'https://developer.harness.io/docs/continuous-delivery/x-platform-cd-features/services/services-overview'
                }}
                useRichText
              />
            </>
          }
        />

        <CommandRow
          classname={css.commandGap}
          commandSnippet={getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.k8s.createenvcmd',
            {
              type: dirPath,
              environment: env || 'environment',
              ...getProjAndOrgId(projectIdentifier, orgIdentifier)
            }
          )}
          title={
            <>
              <String
                stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createEnv"
                vars={{ num: '9.' }}
                useRichText
              />
              &nbsp;
              <String
                stringID="common.learnMoreWithURL"
                vars={{
                  link: 'https://developer.harness.io/docs/continuous-delivery/x-platform-cd-features/environments/environment-overview/'
                }}
                useRichText
              />
            </>
          }
        />

        <CommandRow
          classname={css.commandGap}
          commandSnippet={getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.k8s.createinfracmd',
            {
              type: dirPath,
              infrastructureDefinition: infrastructure || 'infrastructure-definition',
              ...getProjAndOrgId(projectIdentifier, orgIdentifier)
            }
          )}
          title={
            <>
              <String
                stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createInfra"
                vars={{ num: '10.' }}
                useRichText
              />
              &nbsp;
              <String
                stringID="common.learnMoreWithURL"
                vars={{
                  link: 'https://developer.harness.io/docs/continuous-delivery/x-platform-cd-features/environments/environment-overview/#defining-environment-settings'
                }}
                useRichText
              />
            </>
          }
        />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
