/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@harness/uicore'
import { FormikErrors } from 'formik'
import { omit } from 'lodash-es'
import { StepViewType, StepProps } from '@pipeline/components/AbstractSteps/Step'

import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import type { StringsMap } from 'stringTypes'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { AnalyzeDeploymentImpactWidgetWithRef } from './components/AnalyzeDeploymentImpactWidget/AnalyzeDeploymentImpactWidget'
import { getMonitoredServiceYamlData, getSpecFormData } from './AnalyzeDeploymentImpact.utils'
import { ANALYSE_DEFAULT_VALUES } from './AnalyzeDeploymentImpact.constants'
import { AnalyzeDeploymentImpactData } from './AnalyzeDeploymentImpact.types'

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
      // inputSetData,
      formikRef,
      // customStepProps,
      isNewStep,
      allowableTypes,
      onChange
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      // Todo - define the view here
      return <></>
    } else if (stepViewType === StepViewType.InputVariable) {
      // Todo - define the view here
      return <></>
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

  /* istanbul ignore next */
  // This will be removed when other views are implemented
  validateInputSet(): FormikErrors<AnalyzeDeploymentImpactData> {
    const errors: FormikErrors<AnalyzeDeploymentImpactData> = {}
    // Todo - this has to be implemented.
    return errors
  }

  private getInitialValues(initialValues: AnalyzeDeploymentImpactData): AnalyzeDeploymentImpactData {
    return {
      ...initialValues,
      spec: getSpecFormData(initialValues.spec)
    }
  }

  /* istanbul ignore next */
  processFormData(data: AnalyzeDeploymentImpactData): AnalyzeDeploymentImpactData {
    return {
      ...data,
      spec: {
        ...omit(data?.spec, ['monitoredServiceRef', 'healthSources']),
        monitoredService: getMonitoredServiceYamlData(data?.spec)
      }
    }
  }
}
