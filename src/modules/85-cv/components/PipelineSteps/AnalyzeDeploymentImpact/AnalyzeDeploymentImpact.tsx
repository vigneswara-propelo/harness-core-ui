/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@harness/uicore'
import { connect, FormikErrors } from 'formik'
import { omit } from 'lodash-es'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'

import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import type { StringsMap } from 'stringTypes'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { AnalyzeDeploymentImpactWidgetWithRef } from './components/AnalyzeDeploymentImpactWidget/AnalyzeDeploymentImpactWidget'
import {
  getMonitoredServiceYamlData,
  getSpecFormData,
  validateField,
  validateMonitoredServiceForRunTimeView
} from './AnalyzeDeploymentImpact.utils'
import { ANALYSE_DEFAULT_VALUES } from './AnalyzeDeploymentImpact.constants'
import { AnalyzeDeploymentImpactData, AnalyzeDeploymentImpactVariableStepProps } from './AnalyzeDeploymentImpact.types'
import AnalyzeDeploymentImpactVariableStep from './components/AnalyzeDeploymentImpactVariableStep/AnalyzeDeploymentImpactVariableStep'
import AnalyzeDeploymentImpactInputSetStep from './components/AnalyzeDeploymentImpactInputSetStep/AnalyzeDeploymentImpactInputSetStep'

const AnalyzeDeploymentImpactInputSetStepFormik = connect(AnalyzeDeploymentImpactInputSetStep)
export class AnalyzeDeploymentImpact extends PipelineStep<AnalyzeDeploymentImpactData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.AnalyzeDeploymentImpact
  protected stepName = 'Analyze Deployment Impact'
  protected stepIcon: IconName = 'cv-main'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.AnalyzeDeploymentImpact'
  protected isHarnessSpecific = false
  protected defaultValues: AnalyzeDeploymentImpactData = ANALYSE_DEFAULT_VALUES

  renderStep(props: StepProps<AnalyzeDeploymentImpactData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      allowableTypes,
      onChange
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <AnalyzeDeploymentImpactInputSetStepFormik
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          readonly={!!inputSetData?.readonly}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <AnalyzeDeploymentImpactVariableStep
          {...(customStepProps as AnalyzeDeploymentImpactVariableStepProps)}
          originalData={initialValues}
        />
      )
    }
    return (
      <AnalyzeDeploymentImpactWidgetWithRef
        initialValues={this.getInitialValues(initialValues)}
        onUpdate={/* istanbul ignore next */ data => onUpdate?.(this.processFormData(data))}
        isNewStep={isNewStep}
        onChange={/* istanbul ignore next */ data => onChange?.(this.processFormData(data))}
        allowableTypes={allowableTypes}
        stepViewType={stepViewType}
        ref={formikRef}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<AnalyzeDeploymentImpactData>): FormikErrors<AnalyzeDeploymentImpactData> {
    const errors: FormikErrors<AnalyzeDeploymentImpactData> = {}
    const { monitoredService, duration } = template?.spec || {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      validateField({ fieldValue: duration as string, fieldKey: 'duration', data, errors, getString, isRequired })
      validateMonitoredServiceForRunTimeView({ monitoredService, data, errors, getString, isRequired })
    }
    return errors
  }

  private getInitialValues(initialValues: AnalyzeDeploymentImpactData): AnalyzeDeploymentImpactData {
    return {
      ...initialValues,
      spec: getSpecFormData(initialValues.spec)
    }
  }

  processFormData(data: AnalyzeDeploymentImpactData): AnalyzeDeploymentImpactData {
    return {
      ...data,
      spec: {
        ...omit(data?.spec, ['monitoredServiceRef', 'healthSources', 'isMonitoredServiceDefaultInput']),
        monitoredService: getMonitoredServiceYamlData(data?.spec)
      } as AnalyzeDeploymentImpactData['spec']
    }
  }
}
