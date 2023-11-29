import React, { useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Button, ButtonSize, ButtonVariation, Layout } from '@harness/uicore'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { CDOnboardingSteps, WhatToDeployType, WhereAndHowToDeployType } from '../types'
import { GITOPS_ENTITY_IDS_BY_DEPLOYMENT_TYPE } from '../Constants'
import { useOnboardingStore } from '../Store/OnboardingStore'

export default function ViewGitopsApp(): JSX.Element {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { stepsProgress } = useOnboardingStore()

  const entityIds = useMemo((): { application: string; cluster: string; repo: string } => {
    const data = stepsProgress?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData as WhatToDeployType
    const artifactId = data.artifactSubType ? data.artifactSubType?.id : (data.artifactType?.id as string)

    return GITOPS_ENTITY_IDS_BY_DEPLOYMENT_TYPE[artifactId]
  }, [])

  const gotoGitopsApplication = (): void => {
    const routeUrl = routes.toGitOpsApplication({
      orgIdentifier,
      projectIdentifier,
      accountId,
      module: 'cd',
      applicationId: entityIds.application as string,
      agentId: (stepsProgress?.[CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY]?.stepData as WhereAndHowToDeployType)
        ?.agentInfo?.identifier
    })

    history.push(`${routeUrl}&tab=ResourceView`)
  }

  return (
    <Layout.Vertical>
      <Button
        margin={{ bottom: 'large' }}
        width={300}
        onClick={gotoGitopsApplication}
        variation={ButtonVariation.SECONDARY}
        size={ButtonSize.SMALL}
      >
        {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGitopsStep.viewGitopsApp')}
      </Button>
    </Layout.Vertical>
  )
}
