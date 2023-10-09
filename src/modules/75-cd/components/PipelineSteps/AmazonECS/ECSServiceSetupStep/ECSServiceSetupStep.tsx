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
import type { ECSServiceSetupStepElementConfig } from '@pipeline/utils/types'
import { validateGenericFields } from '../../Common/GenericExecutionStep/utils'
import { ECSServiceSetupStepEditRef } from './ECSServiceSetupStepEdit'
import { ECSServiceSetupStepInputSetMode } from './ECSServiceSetupStepInputSet'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

interface ECSServiceSetupVariableStepProps {
  initialValues: ECSServiceSetupStepElementConfig
  stageIdentifier: string
  onUpdate?(data: ECSServiceSetupStepElementConfig): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ECSServiceSetupStepElementConfig
}

export class ECSServiceSetupStep extends PipelineStep<ECSServiceSetupStepElementConfig> {
  protected type = StepType.EcsServiceSetup
  protected stepName = 'ECS Service Setup'
  protected stepIcon: IconName = 'ecs-service-setup'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.ECSServiceSetup'
  protected isHarnessSpecific = false
  protected defaultValues: ECSServiceSetupStepElementConfig = {
    identifier: '',
    name: '',
    type: StepType.EcsServiceSetup,
    timeout: '10m',
    spec: {}
  }

  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<ECSServiceSetupStepElementConfig>): JSX.Element {
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
        <ECSServiceSetupStepInputSetMode
          allowableTypes={allowableTypes}
          inputSetData={inputSetData as InputSetData<ECSServiceSetupStepElementConfig>}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as ECSServiceSetupVariableStepProps
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
      <ECSServiceSetupStepEditRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={stepViewType}
        ref={formikRef}
        readonly={readonly}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<ECSServiceSetupStepElementConfig>): FormikErrors<ECSServiceSetupStepElementConfig> {
    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as FormikErrors<ECSServiceSetupStepElementConfig>

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
}
