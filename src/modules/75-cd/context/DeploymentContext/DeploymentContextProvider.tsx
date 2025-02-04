/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useEffect, useState } from 'react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import { get, compact, isEmpty, map, merge } from 'lodash-es'
import type { EntityGitDetails, TemplateSummaryResponse } from 'services/template-ng'
import { sanitize } from '@common/utils/JSONUtils'
import type { GetPipelineQueryParams, TemplateStepNode, StepElementConfig } from 'services/pipeline-ng'
import { getResolvedTemplateDetailsByRef } from '@pipeline/utils/templateUtils'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { DeploymentConfig } from '@pipeline/components/PipelineStudio/PipelineVariables/types'

export const FETCH_INSTANCE_SCRIPT_DEFAULT_TEXT = `#
# Script is expected to query Infrastructure and dump json
# in $INSTANCE_OUTPUT_PATH file path
#
# Harness is expected to initialize \${INSTANCE_OUTPUT_PATH}
# environment variable - a random unique file path on delegate,
# so script execution can save the result.
#
`
export interface DrawerData {
  type: DrawerTypes
  data?: {
    stepConfig?: {
      node: TemplateStepNode | StepElementConfig
    }
    drawerConfig?: {
      shouldShowApplyChangesBtn: boolean
    }
    templateDetails?: TemplateSummaryResponse
    isDrawerOpen?: boolean
  }
}

export interface DeploymentContextProps {
  onDeploymentConfigUpdate: (configValues: DeploymentConfig) => Promise<void>
  deploymentConfigInitialValues: DeploymentConfig
  isReadOnly: boolean
  gitDetails: EntityGitDetails
  queryParams: GetPipelineQueryParams
  stepsFactory: AbstractStepFactory
}

export interface DeploymentConfigValues
  extends Omit<DeploymentContextProps, 'queryParams' | 'deploymentConfigInitialValues' | 'onDeploymentConfigUpdate'> {
  deploymentConfig: DeploymentConfig
  updateDeploymentConfig: (configValues: DeploymentConfig) => Promise<void>
  templateDetailsByRef: TemplateDetailsByRef
  allowableTypes: AllowedTypesWithRunTime[]
  setTemplateDetailsByRef: (_templateDetailsByRef: TemplateDetailsByRef) => void
  drawerData: DrawerData
  setDrawerData: (values: DrawerData) => void
}
const initialValues = {
  infrastructure: {
    variables: [],
    fetchInstancesScript: {
      store: {
        type: 'Inline',
        spec: {
          content: FETCH_INSTANCE_SCRIPT_DEFAULT_TEXT
        }
      }
    },
    instanceAttributes: [{ name: 'instancename', jsonPath: '', description: '' }]
  },
  execution: {
    stepTemplateRefs: []
  }
}

const allowableTypes: AllowedTypesWithRunTime[] = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.RUNTIME,
  MultiTypeInputType.EXPRESSION
]

const DeploymentContext = React.createContext<DeploymentConfigValues>({
  deploymentConfig: initialValues,
  isReadOnly: false,
  allowableTypes: allowableTypes,
  gitDetails: {},
  templateDetailsByRef: {},
  updateDeploymentConfig: (_configValues: DeploymentConfig) => new Promise<void>(() => undefined),
  /* istanbul ignore next */
  setTemplateDetailsByRef: (_templateDetailsByRef: TemplateDetailsByRef) => undefined,
  drawerData: { type: DrawerTypes.AddStep },
  setDrawerData: (_values: DrawerData) => undefined,
  stepsFactory: {} as AbstractStepFactory
})

export type TemplateDetailsByRef = { [p: string]: TemplateSummaryResponse }

export function DeploymentContextProvider(props: React.PropsWithChildren<DeploymentContextProps>): React.ReactElement {
  const { onDeploymentConfigUpdate, deploymentConfigInitialValues, gitDetails, queryParams, stepsFactory, isReadOnly } =
    props

  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>(
    deploymentConfigInitialValues || initialValues
  )
  const [drawerData, setDrawerData] = React.useState<DrawerData>({ type: DrawerTypes.AddStep })

  const [templateDetailsByRef, setTemplateDetailsByRef] = useState<TemplateDetailsByRef>({})

  const handleConfigUpdate = useCallback(
    async (configValues: DeploymentConfig) => {
      const sanitizedDeploymentConfig = sanitize(configValues, {
        removeEmptyArray: false,
        removeEmptyObject: false,
        removeEmptyString: false
      }) as DeploymentConfig

      // update in local state
      setDeploymentConfig(sanitizedDeploymentConfig)

      // update in context
      await onDeploymentConfigUpdate(sanitizedDeploymentConfig)
    },
    [deploymentConfig, onDeploymentConfigUpdate]
  )

  // Template ref resolving for rendering in execution tab

  useEffect(() => {
    const allTemplateRefs = compact(
      map(get(deploymentConfig, 'execution.stepTemplateRefs'), (stepTemplateRef: string) => stepTemplateRef)
    ) as string[]
    const unresolvedTemplateRefs = allTemplateRefs.filter(templateRef => {
      return isEmpty(get(templateDetailsByRef, templateRef))
    })
    if (unresolvedTemplateRefs.length > 0) {
      getResolvedTemplateDetailsByRef(
        {
          accountIdentifier: queryParams.accountIdentifier,
          orgIdentifier: queryParams.orgIdentifier,
          projectIdentifier: queryParams.projectIdentifier,
          templateListType: 'Stable',
          repoIdentifier: gitDetails.repoIdentifier,
          branch: gitDetails.branch,
          getDefaultFromOtherRepo: true
        },
        unresolvedTemplateRefs
      ).then(resp => {
        setTemplateDetailsByRef(merge({}, templateDetailsByRef, resp.templateDetailsByRef))
      })
    }
  }, [deploymentConfig])

  return (
    <DeploymentContext.Provider
      value={{
        updateDeploymentConfig: handleConfigUpdate,
        deploymentConfig,
        isReadOnly,
        gitDetails,
        templateDetailsByRef,
        allowableTypes,
        setTemplateDetailsByRef,
        drawerData,
        setDrawerData,
        stepsFactory
      }}
    >
      {props.children}
    </DeploymentContext.Provider>
  )
}

export function useDeploymentContext(): DeploymentConfigValues {
  return useContext(DeploymentContext)
}
