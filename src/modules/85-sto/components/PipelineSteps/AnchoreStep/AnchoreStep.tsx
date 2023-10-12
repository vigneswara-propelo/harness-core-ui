/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { AllowedTypes, IconName } from '@harness/uicore'
import type { FormikErrors, FormikProps } from 'formik'
import type { StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { validateInputSet } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { getFormValuesInCorrectFormat } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type { StringsMap } from 'stringTypes'
import { AnchoreStepBaseWithRef } from './AnchoreStepBase'
import { SecurityStepInputSet } from '../SecurityStepInputSet'
import { AnchoreStepVariables, AnchoreStepVariablesProps } from './AnchoreStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './AnchoreStepFunctionConfigs'
import type { SecurityStepData, SecurityStepSpec } from '../types'

export type AnchoreStepData = SecurityStepData<SecurityStepSpec>
export interface AnchoreStepProps {
  initialValues: AnchoreStepData
  template?: AnchoreStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: AnchoreStepData) => void
  onChange?: (data: AnchoreStepData) => void
  allowableTypes: AllowedTypes
  formik?: FormikProps<AnchoreStepData>
}

export class AnchoreStep extends PipelineStep<AnchoreStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.Anchore
  protected stepName = 'Configure Anchore Enterprise'
  protected stepIcon: IconName = 'Anchore'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.Anchore'
  protected stepPaletteVisible = false

  protected defaultValues: AnchoreStepData = {
    identifier: '',
    type: StepType.Anchore as string,
    spec: {
      mode: 'orchestration',
      config: 'default',
      target: {
        type: 'container',
        name: '',
        variant: '',
        workspace: ''
      },
      image: {
        type: 'docker_v2',
        domain: '',
        access_token: '',
        name: '',
        tag: ''
      },
      tool: {
        image_name: ''
      },
      auth: {
        domain: '',
        access_id: '',
        access_token: ''
      },
      advanced: {
        log: {
          level: 'info'
        },
        args: {
          cli: ''
        }
      }
    }
  }

  /* istanbul ignore next */
  processFormData(data: AnchoreStepData): AnchoreStepData {
    return getFormValuesInCorrectFormat(data, transformValuesFieldsConfig(data))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<AnchoreStepData>): FormikErrors<AnchoreStepData> {
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(data), { getString }, viewType)
    }

    /* istanbul ignore next */
    return {}
  }

  renderStep(props: StepProps<AnchoreStepData>): JSX.Element {
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
        <SecurityStepInputSet
          initialValues={initialValues}
          /* istanbul ignore next */
          template={inputSetData?.template}
          /* istanbul ignore next */
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
        <AnchoreStepVariables
          {...(customStepProps as AnchoreStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <AnchoreStepBaseWithRef
        initialValues={initialValues}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={
          stepViewType ||
          /* istanbul ignore next */
          StepViewType.Edit
        }
        onUpdate={onUpdate}
        readonly={readonly}
        isNewStep={isNewStep}
        ref={formikRef}
      />
    )
  }
}
