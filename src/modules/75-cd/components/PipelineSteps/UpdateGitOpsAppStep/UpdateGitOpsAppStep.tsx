/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikErrors } from 'formik'
import { cloneDeep } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import { IconName } from '@harness/icons'
import type { SelectOption } from '@harness/uicore'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType, StepProps } from '@pipeline/components/AbstractSteps/Step'
import type { StringsMap } from 'stringTypes'
import { UpdateGitOpsAppStepData, SOURCE_TYPE_UNSET, ApplicationOption } from './helper'
import UpdateGitOpsAppStepWithRef from './UpdateGitOpsAppWidget'

export class UpdateGitOpsApp extends PipelineStep<UpdateGitOpsAppStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<UpdateGitOpsAppStepData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      formikRef,
      // customStepProps,
      isNewStep,
      readonly,
      allowableTypes,
      // inputSetData,
      onChange
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return <div>isTemplatizedView</div>
    }
    if (stepViewType === StepViewType.InputVariable) {
      return <div>StepViewType.InputVariable</div>
    }
    return (
      <UpdateGitOpsAppStepWithRef
        initialValues={this.getInitialValues(initialValues)}
        onUpdate={(values: UpdateGitOpsAppStepData) => onUpdate?.(this.processFormData(values))}
        isNewStep={isNewStep}
        stepViewType={stepViewType || StepViewType.Edit}
        ref={formikRef}
        readonly={readonly}
        onChange={(values: UpdateGitOpsAppStepData) => onChange?.(this.processFormData(values))}
        allowableTypes={allowableTypes}
      />
    )
  }

  protected type = StepType.UpdateGitOpsApp
  protected stepName = 'Update GitOps App'
  protected stepIcon: IconName = 'apply'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.updateGitOpsApp'

  validateInputSet(): FormikErrors<UpdateGitOpsAppStepData> {
    return {}
  }

  protected defaultValues: UpdateGitOpsAppStepData = {
    name: '',
    identifier: '',
    type: StepType.UpdateGitOpsApp,
    timeout: '10m',
    spec: {}
  }

  private getInitialValues(initialValues: UpdateGitOpsAppStepData): UpdateGitOpsAppStepData {
    const clonedValues: UpdateGitOpsAppStepData = cloneDeep(initialValues)
    if (clonedValues.spec.applicationName) {
      const appName = clonedValues.spec.applicationName
      const agentId = clonedValues.spec.agentId
      clonedValues.spec.applicationNameOption = {
        label: `${appName} (${agentId})`,
        value: appName || '',
        sourceType: SOURCE_TYPE_UNSET,
        agentId
      }
    }

    const parameters = clonedValues.spec.helm?.parameters
    const fileParameters = clonedValues.spec.helm?.fileParameters

    if (!clonedValues.spec.helm) {
      clonedValues.spec.helm = {}
    }

    // Adding uuid to parameters
    if (parameters?.length) {
      clonedValues.spec.helm.parameters = parameters.map(variable => ({
        ...variable,
        id: uuid()
      }))
    }
    if (fileParameters?.length) {
      clonedValues.spec.helm.fileParameters = fileParameters.map(({ path, ...variable }) => ({
        ...variable,
        value: path,
        id: uuid()
      }))
    }

    const valueFiles = clonedValues.spec.helm?.valueFiles as string[]
    if (valueFiles?.length) {
      clonedValues.spec.helm.valueFiles = valueFiles.map(value => ({
        label: value,
        value
      }))
    }

    return clonedValues
  }

  processFormData(data: UpdateGitOpsAppStepData): UpdateGitOpsAppStepData {
    const clonedValues = cloneDeep(data)
    const applicationNameOption = clonedValues.spec.applicationNameOption
    const isApplicationRuntime = applicationNameOption === RUNTIME_INPUT_VALUE
    const appName = (applicationNameOption as ApplicationOption)?.value
    /* istanbul ignore next */
    const parameters = clonedValues.spec.helm?.parameters
    /* istanbul ignore next */
    const fileParameters = clonedValues.spec.helm?.fileParameters
    /* istanbul ignore next */
    const valueFiles = clonedValues.spec.helm?.valueFiles as SelectOption[]
    const isHelm = (data.spec?.applicationNameOption as ApplicationOption)?.sourceType === 'Helm'

    if (appName && typeof appName === 'string') {
      clonedValues.spec.applicationName = appName
      clonedValues.spec.agentId = (applicationNameOption as ApplicationOption)?.agentId
    }
    if (isApplicationRuntime) {
      clonedValues.spec.applicationName = RUNTIME_INPUT_VALUE
      clonedValues.spec.agentId = RUNTIME_INPUT_VALUE
      delete clonedValues.spec.targetRevision
    }

    if (!clonedValues.spec.helm) {
      clonedValues.spec.helm = {}
    }

    // Removing uuid from parameters
    /* istanbul ignore next */
    if (isHelm && parameters?.length) {
      clonedValues.spec.helm.parameters = parameters
        .filter(variable => variable.value)
        .map(({ id, ...variable }) => variable)
    }
    /* istanbul ignore next */
    if (isHelm && fileParameters?.length) {
      clonedValues.spec.helm.fileParameters = fileParameters
        .filter(variable => variable.value)
        .map(({ id, value, ...variable }) => ({
          ...variable,
          path: value
        }))
    }

    /* istanbul ignore next */
    if (isHelm && valueFiles?.length) {
      clonedValues.spec.helm.valueFiles = valueFiles.filter(option => option?.value).map(({ value }) => value as string)
    }

    if (!isHelm) {
      delete clonedValues.spec.helm
    }

    delete clonedValues.spec.applicationNameOption
    return clonedValues
  }
}
