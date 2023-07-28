/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { FontVariation, Color } from '@harness/design-system'
import { Layout, CardSelect, Text, Icon, IconName } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { SERVICE_TYPES, INFRA_TYPES } from '../Constants'
import { useOnboardingStore } from '../Store/OnboardingStore'
import { CDOnboardingSteps, EntityType, WhatToDeployType } from '../types'
import css from '../CDOnboardingWizardWithCLI.module.scss'
interface WhatToDeployProps {
  saveProgress: (stepId: string, data: any) => void
}
function WhatToDeploy({ saveProgress }: WhatToDeployProps): JSX.Element {
  const { stepsProgress } = useOnboardingStore()
  const [state, setState] = React.useState<WhatToDeployType>(() => {
    return stepsProgress?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData || {}
  })

  const { getString } = useStrings()
  const setSvc = (selected: EntityType): void => {
    selected !== state.svcType && setState({ ...state, svcType: selected, artifactType: undefined })
  }
  const setInfra = (selected: EntityType): void => {
    setState({ ...state, artifactType: selected })
  }
  const svcTypes = React.useMemo((): EntityType[] => {
    return Object.values(SERVICE_TYPES).map((data: EntityType) => {
      return data
    })
  }, [])

  const infraTypes = React.useMemo((): EntityType[] => {
    let infraTypesList: EntityType[] = []
    if (!state.svcType) return infraTypesList
    const infraTypeObj = INFRA_TYPES[state?.svcType?.id]
    infraTypesList = INFRA_TYPES[state?.svcType?.id]
      ? Object.values(infraTypeObj)?.map((data: EntityType) => {
          return data
        })
      : infraTypesList
    return infraTypesList
  }, [state.svcType])

  React.useEffect(() => {
    saveProgress(CDOnboardingSteps.WHAT_TO_DEPLOY, state)
  }, [state])
  return (
    <Layout.Vertical>
      <Text color={Color.BLACK} margin={{ bottom: 'xlarge' }}>
        {getString('cd.getStartedWithCD.flowByQuestions.what.samplesvc')}
      </Text>
      <Text color={Color.BLACK} className={css.bold} margin={{ bottom: 'xxlarge' }}>
        {getString('cd.getStartedWithCD.flowByQuestions.what.aboutSvc')}
      </Text>

      <CardSelect<EntityType>
        data={svcTypes}
        cornerSelected
        className={cx(css.serviceTypeCards, css.infraCards)}
        renderItem={(item: EntityType) => (
          <Layout.Vertical flex spacing={'xlarge'}>
            <Icon name={item?.icon as IconName} size={30} />
            <Text
              font={{
                variation: FontVariation.BODY
              }}
              color={state.artifactType?.id === item.id ? Color.PRIMARY_7 : Color.GREY_800}
            >
              {item.label}
            </Text>
          </Layout.Vertical>
        )}
        selected={state.svcType}
        onChange={setSvc}
      />
      {state.svcType && !isEmpty(infraTypes) && (
        <>
          <Text color={Color.BLACK} className={css.bold} margin={{ bottom: 'large' }}>
            {getString('cd.getStartedWithCD.flowByQuestions.what.K8sSteps.k8sSvcRep')}
          </Text>
          <Text color={Color.BLACK} margin={{ bottom: 'xxlarge' }}>
            {getString('cd.getStartedWithCD.flowByQuestions.what.K8sSteps.artifact')}
          </Text>
          <CardSelect<EntityType>
            data={infraTypes}
            cornerSelected
            className={cx(css.serviceTypeCards, css.infraCards)}
            renderItem={(item: EntityType) => (
              <Layout.Vertical flex spacing={'xlarge'}>
                <Icon name={item?.icon as IconName} size={30} />
                <Text
                  font={{
                    variation: FontVariation.BODY
                  }}
                  color={state.artifactType?.id === item.id ? Color.PRIMARY_7 : Color.GREY_800}
                >
                  {item.label}
                </Text>
              </Layout.Vertical>
            )}
            selected={state.artifactType}
            onChange={setInfra}
          />
        </>
      )}
    </Layout.Vertical>
  )
}

export default WhatToDeploy
