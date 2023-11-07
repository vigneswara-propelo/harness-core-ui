/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikErrors } from 'formik'
import { isEmpty } from 'lodash-es'
import type { IconName } from '@harness/uicore'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { StringsMap } from 'framework/strings/StringsContext'
import { StepViewType, StepProps, ValidateInputSetProps, InputSetData } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { ECSUpgradeContainerStepElementConfig, InstanceUnit } from '@pipeline/utils/types'
import { validateGenericFields } from '../../Common/GenericExecutionStep/utils'
import { ECSUpgradeContainerStepEditRef } from './ECSUpgradeContainerStepEdit'
import { ECSUpgradeContainerStepInputSetMode } from './ECSUpgradeContainerStepInputSet'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

interface ECSUpgradeContainerVariableStepProps {
  initialValues: ECSUpgradeContainerStepElementConfig
  stageIdentifier: string
  onUpdate?(data: ECSUpgradeContainerStepElementConfig): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ECSUpgradeContainerStepElementConfig
}

export class ECSUpgradeContainerStep extends PipelineStep<ECSUpgradeContainerStepElementConfig> {
  protected type = StepType.EcsUpgradeContainer
  protected stepName = 'ECS Upgrade Container'
  protected stepIcon: IconName = 'ecs-upgrade-containers'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.ECSUpgradeContainer'
  protected isHarnessSpecific = false
  protected defaultValues: ECSUpgradeContainerStepElementConfig = {
    identifier: '',
    name: '',
    type: StepType.EcsUpgradeContainer,
    timeout: '10m',
    spec: {
      newServiceInstanceCount: 100,
      newServiceInstanceUnit: InstanceUnit.Percentage
    }
  }

  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<ECSUpgradeContainerStepElementConfig>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      allowableTypes,
      onChange
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <ECSUpgradeContainerStepInputSetMode
          allowableTypes={allowableTypes}
          inputSetData={inputSetData as InputSetData<ECSUpgradeContainerStepElementConfig>}
          stepViewType={stepViewType}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as ECSUpgradeContainerVariableStepProps
      return (
        <VariablesListTable
          className={pipelineVariableCss.variablePaddingL3}
          data={variablesData}
          originalData={initialValues}
          metadataMap={metadataMap}
        />
      )
    }

    return (
      <ECSUpgradeContainerStepEditRef
        initialValues={initialValues}
        onChange={values => onChange?.(this.processFormData(values))}
        onUpdate={values => onUpdate?.(this.processFormData(values))}
        isNewStep={isNewStep}
        allowableTypes={allowableTypes}
        stepViewType={stepViewType}
        ref={formikRef}
        readonly={readonly}
      />
    )
  }

  processFormData(values: ECSUpgradeContainerStepElementConfig): ECSUpgradeContainerStepElementConfig {
    if (values.spec.downsizeOldServiceInstanceCount?.toString().length === 0) {
      delete values.spec.downsizeOldServiceInstanceCount
    }
    if (values.spec.downsizeOldServiceInstanceUnit?.toString().length === 0) {
      delete values.spec.downsizeOldServiceInstanceUnit
    }
    return values
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<ECSUpgradeContainerStepElementConfig>): FormikErrors<ECSUpgradeContainerStepElementConfig> {
    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as FormikErrors<ECSUpgradeContainerStepElementConfig>

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
}
