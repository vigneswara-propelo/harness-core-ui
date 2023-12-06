/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/icons'
import type { FormikErrors } from 'formik'
import React from 'react'
import { defaultTo } from 'lodash-es'
import { StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StringsMap } from 'stringTypes'
import { VariableListTableProps, VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { flatObject } from '@pipeline/components/PipelineSteps/Steps/Common/ApprovalCommons'
import { validateInputSet } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { CookieCutterStepData, CookieCutterStepEditWithRef } from './CookieCutterStepEdit'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './CookieCutterStepFunctionConfigs'
import CookieCutterStepInputSet from './CookieCutterStepInputSet'
import { getFormValuesInCorrectFormat } from '../utils'

export class CookieCutterStep extends PipelineStep<CookieCutterStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this.invocationMap = new Map()
  }

  protected type = StepType.Cookiecutter
  protected stepName = 'Cookiecutter'
  protected stepIcon: IconName = 'cookiecutter'
  protected stepDescription: keyof StringsMap = 'idp.cookieCutterStep.cookieCutterStepDesciption'
  protected stepPaletteVisible = false
  protected defaultValues: CookieCutterStepData = {
    type: StepType.Cookiecutter,
    identifier: '',
    spec: {
      templateType: 'public',
      publicTemplateUrl: '',
      cookieCutterVariables: [],
      outputDirectory: ''
    }
  }

  /* istanbul ignore next */
  processFormData<T>(data: T): CookieCutterStepData {
    return getFormValuesInCorrectFormat<T, CookieCutterStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<CookieCutterStepData>): FormikErrors<CookieCutterStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(isRequired), { getString }, viewType)
    }

    /* istanbul ignore next */
    return {}
  }

  renderStep(props: StepProps<CookieCutterStepData>): JSX.Element {
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
        <CookieCutterStepInputSet
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
        <VariablesListTable
          data={flatObject(defaultTo(initialValues, {}))}
          originalData={initialValues}
          metadataMap={(customStepProps as Pick<VariableListTableProps, 'metadataMap'>)?.metadataMap}
        />
      )
    }

    return (
      <CookieCutterStepEditWithRef
        initialValues={initialValues}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={defaultTo(stepViewType, StepViewType.Edit)}
        onUpdate={onUpdate}
        readonly={readonly}
        isNewStep={isNewStep}
        ref={formikRef}
      />
    )
  }
}
