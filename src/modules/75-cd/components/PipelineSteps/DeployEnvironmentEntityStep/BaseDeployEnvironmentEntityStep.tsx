/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { BaseSyntheticEvent, MutableRefObject, useCallback, useMemo, useState } from 'react'
import { get, isEmpty } from 'lodash-es'
import { useFormikContext } from 'formik'
import { RadioGroup } from '@blueprintjs/core'
import cx from 'classnames'

import {
  AllowedTypes,
  Container,
  FormikForm,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Text,
  Toggle
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'

import { useStrings } from 'framework/strings'

import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  getFlattenedStages,
  getStageIndexFromPipeline
} from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { getPropagateStageOptions } from '@pipeline/components/PipelineInputSetForm/EnvironmentsInputSetForm/utils'
import { StageType } from '@pipeline/utils/stageHelpers'

import type { DeployEnvironmentEntityCustomStepProps, DeployEnvironmentEntityFormState } from './types'
import DeployEnvironment from './DeployEnvironment/DeployEnvironment'
import DeployEnvironmentGroup from './DeployEnvironmentGroup/DeployEnvironmentGroup'
import { setupMode } from '../PipelineStepsUtil'

import {
  InlineEntityFiltersProps,
  InlineEntityFiltersRadioType
} from './components/InlineEntityFilters/InlineEntityFiltersUtils'
import PropagateFromEnvironment from './PropagateWidget/PropagateFromEnvironment'

import css from './DeployEnvironmentEntityStep.module.scss'

export interface BaseDeployEnvironmentEntityStepProps extends Required<DeployEnvironmentEntityCustomStepProps> {
  initialValues: DeployEnvironmentEntityFormState
  readonly: boolean
  allowableTypes: AllowedTypes
  onUpdate?: (data: DeployEnvironmentEntityFormState) => void
  handleMultiEnvironmentToggle(checked: boolean): void
  handleEnvironmentGroupToggle(event: BaseSyntheticEvent): void
  radioValue: string
  handleFilterRadio(selectedRadioValue: InlineEntityFiltersRadioType): void
  environmentsTypeRef?: MutableRefObject<MultiTypeInputType | null>
}

export default function BaseDeployEnvironmentEntityStep({
  initialValues,
  readonly,
  allowableTypes,
  serviceIdentifiers,
  stageIdentifier,
  deploymentType,
  customDeploymentRef,
  gitOpsEnabled,
  handleMultiEnvironmentToggle,
  handleEnvironmentGroupToggle,
  radioValue,
  handleFilterRadio,
  environmentsTypeRef
}: BaseDeployEnvironmentEntityStepProps): JSX.Element {
  const { getString } = useStrings()
  const { values, setFieldValue } = useFormikContext<DeployEnvironmentEntityFormState>()

  const {
    state: {
      pipeline,
      templateTypes,
      selectionState: { selectedStageId }
    },
    getStageFromPipeline,
    scope
  } = usePipelineContext()
  const { stages } = getFlattenedStages(pipeline)
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const { index: stageIndex } = getStageIndexFromPipeline(pipeline, selectedStageId || '')

  // Custom Stage only supports Env and Infra Inputs
  const isCustomStage = React.useMemo(() => stage?.stage?.type === StageType.CUSTOM, [stage])

  const getStagesAllowedforPropagate = useCallback(
    (stageItem): boolean => {
      const currentStageType = stage?.stage?.type
      if (stageItem.stage.template) {
        const stageType = get(templateTypes, stageItem.stage.template.templateRef)
        return !isEmpty(stageItem.stage.template.templateRef) && currentStageType === stageType
      } else {
        const isSingleEnvEmpty = isEmpty(
          (stageItem.stage as DeploymentStageElementConfig)?.spec?.environment?.environmentRef
        )
        return !isSingleEnvEmpty && currentStageType === stageItem?.stage?.type
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const getStageWithEnvV2 = useMemo(
    () => stages.slice(0, stageIndex).filter(getStagesAllowedforPropagate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stageIndex]
  )

  const propagateStageOptions: SelectOption[] = useMemo(() => {
    if (stages.length && stageIndex > 0) {
      return getPropagateStageOptions(stages, stageIndex, templateTypes)
    }
    return []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stages, stageIndex, templateTypes])

  const [setupModeType, setSetupMode] = useState(
    isEmpty(stage?.stage?.spec?.environment?.useFromStage) ? setupMode.DIFFERENT : setupMode.PROPAGATE
  )

  // This is for prefilling the selected value in the field
  const [selectedPropagatedState, setSelectedPropagatedState] = useState<SelectOption | string>(
    propagateStageOptions?.find(v => v?.value === stage?.stage?.spec?.environment?.useFromStage?.stage) as SelectOption
  )

  const onPropogatedStageSelect = useCallback(
    (value: SelectOption): void => {
      // Clears all environment details in formik to ensure fresh values are received
      setFieldValue('environment', undefined)
      setFieldValue('environmentInputs', undefined)
      setFieldValue('serviceOverrideInputs', undefined)
      setFieldValue('propagateFrom', value)
      setSelectedPropagatedState(value)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setSelectedPropagatedState]
  )

  const onStageEnvironmentChange = useCallback(
    (mode: string): void => {
      if (!readonly) {
        setSetupMode(mode)
        setSelectedPropagatedState('')
        // Clears all environment details in formik to ensure fresh values are received
        setFieldValue('environment', undefined)
        setFieldValue('environmentInputs', undefined)
        setFieldValue('serviceOverrideInputs', undefined)
        if (mode === setupMode.DIFFERENT) {
          setFieldValue('propagateFrom', undefined)
        } else {
          setFieldValue('propagateFrom', '')
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const isSingleEnvironment = values.category === 'single'
  const isMultiEnvironment = values.category === 'multi'
  const isEnvironmentGroup = values.category === 'group'
  const canPropagateFromStage = !!propagateStageOptions?.length && isSingleEnvironment && !isCustomStage

  const toggleLabel = getString('cd.pipelineSteps.environmentTab.multiEnvToggleText', {
    name: gitOpsEnabled ? getString('common.clusters') : getString('common.infrastructures')
  })

  const commonProps = {
    initialValues,
    readonly,
    allowableTypes,
    serviceIdentifiers,
    stageIdentifier,
    deploymentType,
    customDeploymentRef,
    gitOpsEnabled,
    environmentsTypeRef,
    isCustomStage
  }

  return (
    <FormikForm>
      <div className={cx(css.environmentEntityWidget)}>
        {canPropagateFromStage && (
          <Text className={css.inputField} font={{ variation: FontVariation.H5 }}>
            {getString('environment')}
          </Text>
        )}
        {!isCustomStage && (
          <Layout.Vertical className={css.toggle} flex={{ alignItems: 'flex-end', justifyContent: 'center' }}>
            <Layout.Vertical flex={{ alignItems: 'center' }}>
              <Toggle
                checked={isMultiEnvironment || isEnvironmentGroup}
                onToggle={handleMultiEnvironmentToggle}
                label={toggleLabel}
                tooltipId={'multiEnvInfraToggle'}
              />
              {(isMultiEnvironment || isEnvironmentGroup) && (
                <RadioGroup
                  onChange={handleEnvironmentGroupToggle}
                  options={[
                    {
                      label: getString('environments'),
                      value: getString('environments')
                    },
                    {
                      label: getString('common.environmentGroup.label'),
                      value: getString('common.environmentGroup.label')
                    }
                  ]}
                  selectedValue={radioValue}
                  disabled={readonly}
                  className={css.radioGroup}
                  inline
                />
              )}
            </Layout.Vertical>
          </Layout.Vertical>
        )}
        {isEnvironmentGroup ? (
          <DeployEnvironmentGroup {...commonProps} scope={scope} />
        ) : isMultiEnvironment ? (
          <StepWidget<InlineEntityFiltersProps>
            type={StepType.InlineEntityFilters}
            factory={factory}
            stepViewType={StepViewType.Edit}
            readonly={readonly}
            allowableTypes={allowableTypes}
            initialValues={{
              filterPrefix: 'environmentFilters.fixedScenario',
              entityStringKey: 'environments',
              onRadioValueChange: handleFilterRadio,
              baseComponent: <DeployEnvironment {...commonProps} isMultiEnvironment />,
              entityFilterProps: {
                entities: ['environments', gitOpsEnabled ? 'gitOpsClusters' : 'infrastructures']
              },
              gridAreaProps: {
                headerAndRadio: 'input-field',
                content: 'main-content'
              }
            }}
          />
        ) : canPropagateFromStage ? (
          <Container className={css.mainContent} padding={{ top: 'large' }}>
            <Container
              padding={{
                left: 'xxlarge',
                bottom: setupModeType === setupMode.DIFFERENT || !isEmpty(selectedPropagatedState) ? 'large' : 'none'
              }}
            >
              <PropagateFromEnvironment
                setupModeType={setupModeType}
                selectedPropagatedState={selectedPropagatedState}
                propagateStageOptions={propagateStageOptions as SelectOption[]}
                readonly={readonly}
                onStageEnvironmentChange={onStageEnvironmentChange}
                onPropogatedStageSelect={onPropogatedStageSelect}
              />
            </Container>
            {(setupModeType === setupMode.DIFFERENT ||
              (!isEmpty(values.propagateFrom?.value) && !isEmpty(initialValues.propagateFrom?.value))) && (
              <DeployEnvironment
                {...commonProps}
                isMultiEnvironment={false}
                canPropagateFromStage={canPropagateFromStage}
                previousStages={getStageWithEnvV2}
                selectedPropagatedState={selectedPropagatedState}
              />
            )}
          </Container>
        ) : (
          <DeployEnvironment {...commonProps} isMultiEnvironment={false} />
        )}
      </div>
    </FormikForm>
  )
}
