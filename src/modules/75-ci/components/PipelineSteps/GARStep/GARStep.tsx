/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { AllowedTypes, IconName } from '@harness/uicore'
import type { FormikErrors } from 'formik'
import type { StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { validateInputSet } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { getFormValuesInCorrectFormat } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type {
  MultiTypeMapType,
  MultiTypeMapUIType,
  MultiTypeListType,
  MultiTypeListUIType,
  MultiTypeConnectorRef,
  Resources
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { StringsMap } from 'stringTypes'
import { GARStepBaseWithRef } from './GARStepBase'
import { GARStepInputSet } from './GARStepInputSet'
import { GARStepVariables, GARStepVariablesProps } from './GARStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './GARStepFunctionConfigs'

export interface GARStepSpec {
  connectorRef: string
  host: string
  projectID: string
  imageName: string
  tags: MultiTypeListType
  optimize?: boolean
  dockerfile?: string
  context?: string
  labels?: MultiTypeMapType
  buildArgs?: MultiTypeMapType
  target?: string
  remoteCacheImage?: string
  resources?: Resources
  runAsUser?: string
}

export interface GARStepData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  spec: GARStepSpec
}

export interface GARStepSpecUI
  extends Omit<GARStepSpec, 'connectorRef' | 'tags' | 'labels' | 'buildArgs' | 'pull' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  tags: MultiTypeListUIType
  labels?: MultiTypeMapUIType
  buildArgs?: MultiTypeMapUIType
  runAsUser?: string
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface GARStepDataUI extends Omit<GARStepData, 'spec'> {
  spec: GARStepSpecUI
}

export interface GARStepProps {
  initialValues: GARStepData
  template?: GARStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: GARStepData) => void
  onChange?: (data: GARStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class GARStep extends PipelineStep<GARStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.GAR
  protected stepName = 'Build and Push to GAR'
  protected stepIcon: IconName = 'gar-step'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.GAR'
  protected stepAdditionalInfo: keyof StringsMap = 'pipeline.linuxOnly'
  protected stepPaletteVisible = false

  protected defaultValues: GARStepData = {
    identifier: '',
    type: StepType.GAR as string,
    spec: {
      connectorRef: '',
      host: '',
      projectID: '',
      remoteCacheImage: '',
      imageName: '',
      tags: []
    }
  }

  /* istanbul ignore next */
  processFormData<T>(data: T): GARStepData {
    return getFormValuesInCorrectFormat<T, GARStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<GARStepData>): FormikErrors<GARStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(isRequired), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<GARStepData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      onChange,
      allowableTypes
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <GARStepInputSet
          initialValues={initialValues}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          readonly={!!inputSetData?.readonly}
          stepViewType={stepViewType}
          onUpdate={onUpdate}
          onChange={onChange}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <GARStepVariables
          {...(customStepProps as GARStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <GARStepBaseWithRef
        initialValues={initialValues}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={stepViewType || StepViewType.Edit}
        onUpdate={onUpdate}
        readonly={readonly}
        isNewStep={isNewStep}
        ref={formikRef}
      />
    )
  }
}
