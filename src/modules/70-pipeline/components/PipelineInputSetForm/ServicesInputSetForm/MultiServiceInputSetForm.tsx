/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState } from 'react'
import cx from 'classnames'
import { useFormikContext } from 'formik'
import { defaultTo, get, isEmpty, isNil, pick } from 'lodash-es'

import { Container, getMultiTypeFromValue, MultiTypeInputType, SelectOption, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'

import type { DeploymentStageConfig, ServiceSpec, ServiceYamlV2 } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { getStepTypeByDeploymentType, StageType } from '@pipeline/utils/stageHelpers'
// eslint-disable-next-line no-restricted-imports
import PropagateFromServiceV2 from '@cd/components/PipelineStudio/DeployServiceSpecifications/PropagateWidget/PropagateFromServiceV2'
// eslint-disable-next-line no-restricted-imports
import { setupMode } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import { StageElementWrapperConfig } from 'services/pipeline-ng'
import {
  getFlattenedStages,
  getStageIndexFromPipeline
} from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

import type { StageInputSetFormProps } from '../StageInputSetForm'
import type { DeployServiceEntityData } from './ServicesInputSetForm'

import css from '../PipelineInputSetForm.module.scss'

export default function MultiServiceInputSetForm({
  // This is the resolved pipeline yaml
  deploymentStage,
  // This is the resolved/updated template yaml
  deploymentStageTemplate,
  path,
  readonly,
  viewType,
  stageIdentifier,
  allowableTypes,
  childPipelineMetadata,
  viewTypeMetadata
}: Omit<StageInputSetFormProps, 'formik' | 'executionIdentifier' | 'stageType'>): React.ReactElement | null {
  const { getString } = useStrings()
  const formik = useFormikContext<DeploymentStageConfig>()

  const {
    state: { pipeline, templateTypes },
    isReadonly
  } = usePipelineContext()

  const { index: stageIndex } = getStageIndexFromPipeline(pipeline, stageIdentifier)

  const deploymentStageInputSet = get(formik?.values, path, {})

  const useFromStageInputSetValue = get(deploymentStageInputSet, 'services.useFromStage.stage')

  const [setupModeType, setSetupMode] = useState(
    isNil(useFromStageInputSetValue) ? setupMode.DIFFERENT : setupMode.PROPAGATE
  )

  const getStagesAllowedforPropogate = useCallback(
    (stageItem: StageElementWrapperConfig): boolean => {
      if (stageItem?.stage?.template) {
        const stageType = get(templateTypes, stageItem.stage.template.templateRef)
        return (
          stageType === StageType.DEPLOY &&
          !(stageItem?.stage?.template?.templateInputs?.spec as DeploymentStageConfig)?.service?.useFromStage &&
          !(stageItem?.stage?.template?.templateInputs?.spec as DeploymentStageConfig)?.services?.useFromStage
        )
      } else {
        const stageType = stageItem?.stage?.type
        return (
          stageType === StageType.DEPLOY &&
          !(stageItem?.stage?.spec as DeploymentStageConfig)?.service?.useFromStage &&
          !(stageItem?.stage?.spec as DeploymentStageConfig)?.services?.useFromStage
        )
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const previousStageList = useMemo(() => {
    const { stages } = getFlattenedStages(pipeline)
    if (stages.length && stageIndex > 0) {
      // all stages are allowed
      const filteredStages = stages.slice(0, stageIndex).filter(getStagesAllowedforPropogate)

      return filteredStages.map(stageItem => {
        if (stageItem.stage?.template) {
          return {
            label: `Stage [${stageItem.stage?.name}] - Template [${stageItem.stage.template.templateRef}]`,
            value: defaultTo(stageItem.stage?.identifier, '')
          }
        } else {
          const singleServiceRef = (stageItem.stage as DeploymentStageElementConfig)?.spec?.service?.serviceRef
          const isMultiServiceConfigurationPresent = !isEmpty(
            (stageItem.stage as DeploymentStageElementConfig)?.spec?.services?.values
          )
          const serviceLabelVal =
            isEmpty(singleServiceRef) && isMultiServiceConfigurationPresent
              ? getString('multipleService')
              : `Service [${singleServiceRef}]`
          return {
            label: `Stage [${stageItem.stage?.name}] - ${serviceLabelVal}`,
            value: stageItem.stage?.identifier
          }
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageIndex])

  // This is for prefilling the selected value in the field
  const [selectedPropagatedState, setSelectedPropagatedState] = useState<SelectOption | string>(
    previousStageList?.find(v => v?.value === useFromStageInputSetValue) as SelectOption
  )

  const isMultiServiceConfigRuntime =
    getMultiTypeFromValue(deploymentStageTemplate?.services?.values as unknown as string) ===
      MultiTypeInputType.RUNTIME ||
    (Array.isArray(deploymentStageTemplate?.services?.values) &&
      deploymentStageTemplate?.services?.values?.some(
        svc => getMultiTypeFromValue(svc.serviceRef) === MultiTypeInputType.RUNTIME
      ))

  const onPropogatedStageSelect = (value: SelectOption): void => {
    setSelectedPropagatedState(value)
    formik.setFieldValue(`${path}.services`, { useFromStage: { stage: value.value } })
  }

  const onStageServiceChange = (mode: string): void => {
    if (!isReadonly) {
      setSetupMode(mode)
      setSelectedPropagatedState('')

      if (mode === setupMode.DIFFERENT) {
        formik.setFieldValue(`${path}.services`, { values: [] })
      } else {
        formik.setFieldValue(`${path}.services`, {
          useFromStage: {
            stage: ''
          }
        })
      }
    }
  }

  const shouldShowPropagateFromStage = !isEmpty(previousStageList) && isMultiServiceConfigRuntime

  if (!deploymentStageTemplate?.services) return null

  return (
    <div id={`Stage.${path}.${stageIdentifier}.Services`} className={cx(css.accordionSummary)}>
      <div className={css.inputheader}>{getString('services')}</div>
      {shouldShowPropagateFromStage && (
        <Container margin={{ left: 'xxlarge', bottom: 'large' }}>
          <PropagateFromServiceV2
            setupModeType={setupModeType}
            selectedPropagatedState={selectedPropagatedState}
            previousStageList={previousStageList as SelectOption[]}
            isReadonly={!!readonly}
            onStageServiceChange={onStageServiceChange}
            onPropogatedStageSelect={onPropogatedStageSelect}
            subscribeToForm={false}
          />
        </Container>
      )}

      <div className={css.nestedAccordions}>
        {isMultiServiceConfigRuntime && setupModeType === setupMode.DIFFERENT ? (
          <StepWidget<DeployServiceEntityData>
            factory={factory}
            initialValues={pick(deploymentStageInputSet, ['services'])}
            template={pick(deploymentStageTemplate, ['services'])}
            type={StepType.DeployServiceEntity}
            stepViewType={viewType}
            path={`${path}.services`}
            allowableTypes={allowableTypes}
            readonly={readonly}
            customStepProps={{
              stageIdentifier,
              deploymentType: deploymentStage?.deploymentType,
              gitOpsEnabled: deploymentStage?.gitOpsEnabled,
              deploymentMetadata: deploymentStage?.deploymentMetadata,
              allValues: pick(deploymentStage, ['services']),
              customDeploymentData: deploymentStage?.customDeploymentRef,
              childPipelineMetadata
            }}
            onUpdate={data => formik?.setFieldValue(`${path}.services`, get(data, 'services'))}
            viewTypeMetadata={viewTypeMetadata}
          />
        ) : null}

        {Array.isArray(deploymentStageTemplate.services.values) && setupModeType === setupMode.DIFFERENT ? (
          <>
            {deploymentStageTemplate.services.values.map((serviceTemplate, i) => {
              const deploymentType = serviceTemplate.serviceInputs?.serviceDefinition?.type
              const service: ServiceYamlV2 = get(deploymentStageInputSet, `services.values[${i}]`, {})

              if (deploymentType) {
                return (
                  <React.Fragment key={`${service.serviceRef}_${i}`}>
                    <Text
                      font={{ size: 'normal', weight: 'bold' }}
                      margin={{ top: 'medium', bottom: 'medium' }}
                      color={Color.GREY_800}
                      lineClamp={1}
                    >
                      {getString('common.servicePrefix', { name: service.serviceRef })}
                    </Text>
                    <StepWidget<ServiceSpec>
                      factory={factory}
                      initialValues={get(service, `serviceInputs.serviceDefinition.spec`, {})}
                      allowableTypes={allowableTypes}
                      template={defaultTo(serviceTemplate?.serviceInputs?.serviceDefinition?.spec, {})}
                      type={getStepTypeByDeploymentType(deploymentType)}
                      stepViewType={viewType}
                      path={`${path}.services.values[${i}].serviceInputs.serviceDefinition.spec`}
                      readonly={readonly}
                      customStepProps={{
                        stageIdentifier,
                        serviceIdentifier: defaultTo(service.serviceRef, ''),
                        serviceBranch: service.gitBranch,
                        allValues: service.serviceInputs?.serviceDefinition?.spec,
                        childPipelineMetadata
                      }}
                      viewTypeMetadata={viewTypeMetadata}
                    />
                  </React.Fragment>
                )
              }

              return null
            })}
          </>
        ) : null}
      </div>
    </div>
  )
}
