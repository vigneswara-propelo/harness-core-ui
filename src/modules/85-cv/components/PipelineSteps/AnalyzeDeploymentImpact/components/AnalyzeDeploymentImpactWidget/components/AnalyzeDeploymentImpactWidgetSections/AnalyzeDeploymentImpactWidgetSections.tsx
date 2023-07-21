/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useToaster, Icon } from '@harness/uicore'
import { isUndefined } from 'lodash-es'
import { useGetCdDeployStageMetadata } from 'services/cd-ng'
import Card from '@cv/components/Card/Card'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import type { AnalyzeDeploymentImpactWidgetSectionsProps } from './types'
import BaseAnalyzeDeploymentImpact from './components/BaseAnalyzeDeploymentImpact/BaseAnalyzeDeploymentImpact'
import ConfiguredMonitoredService from './components/ConfiguredMonitoredService/ConfiguredMonitoredService'
import { getStageServiceAndEnv } from './AnalyzeDeploymentImpactWidgetSections.utils'

export function AnalyzeDeploymentImpactWidgetSections({
  formik,
  isNewStep,
  stepViewType,
  allowableTypes
}: AnalyzeDeploymentImpactWidgetSectionsProps): JSX.Element {
  const { showError } = useToaster()

  const [hasMultiServiceOrEnv, setHasMultiServiceOrEnv] = useState<boolean | undefined>(undefined)
  const [serviceAndEnvironment, setServiceAndEnvironment] = useState({
    serviceIdentifier: '',
    environmentIdentifier: ''
  })

  const { serviceIdentifier, environmentIdentifier } = serviceAndEnvironment
  const isServiceEnvironmentFetched = !isUndefined(hasMultiServiceOrEnv)

  const {
    state: {
      selectionState: { selectedStageId },
      pipeline
    },
    getStageFromPipeline
  } = usePipelineContext()

  const selectedStage = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId as string)?.stage

  const { mutate: getDeploymentStageMeta, loading: stageMetaLoading } = useGetCdDeployStageMetadata({})

  useEffect(() => {
    async function setStageServiceAndEnv(): Promise<void> {
      const data = await getStageServiceAndEnv({
        pipeline,
        selectedStage,
        selectedStageId,
        getDeploymentStageMeta
      })

      const {
        errorInfo,
        serviceIdentifier: serviceIdentifierValue,
        environmentIdentifier: environmentIdentifierValue,
        hasMultiServiceOrEnv: hasMultiServiceOrEnvVaue
      } = data

      if (errorInfo) {
        showError(errorInfo)
      }
      setHasMultiServiceOrEnv(hasMultiServiceOrEnvVaue)
      setServiceAndEnvironment({
        serviceIdentifier: serviceIdentifierValue,
        environmentIdentifier: environmentIdentifierValue
      })
    }

    if (!isServiceEnvironmentFetched) {
      setStageServiceAndEnv()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipeline, selectedStage, selectedStageId, isServiceEnvironmentFetched])

  return (
    <>
      <BaseAnalyzeDeploymentImpact isNewStep={isNewStep} stepViewType={stepViewType} allowableTypes={allowableTypes} />
      {stageMetaLoading || !isServiceEnvironmentFetched ? (
        <Card>
          <Icon name="spinner" />
        </Card>
      ) : (
        <ConfiguredMonitoredService
          formik={formik}
          stepViewType={stepViewType}
          allowableTypes={allowableTypes}
          serviceIdentifier={serviceIdentifier}
          environmentIdentifier={environmentIdentifier}
          hasMultiServiceOrEnv={Boolean(hasMultiServiceOrEnv)}
        />
      )}
    </>
  )
}
