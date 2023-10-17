/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikErrors } from 'formik'
import { cloneDeep, get, isEmpty } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import { IconName } from '@harness/icons'
import type { SelectOption } from '@harness/uicore'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType, StepProps } from '@pipeline/components/AbstractSteps/Step'
import type { StringsMap } from 'stringTypes'
import { UpdateGitOpsAppStepData, SOURCE_TYPE_UNSET, ApplicationOption, HelmValues } from './helper'
import UpdateGitOpsAppStepWithRef from './UpdateGitOpsAppWidget'
import UpdateGitopsAppInputStep from './UpdateGitopsAppInputStep'

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
      isNewStep,
      readonly,
      allowableTypes,
      inputSetData,
      onChange
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <UpdateGitopsAppInputStep
          initialValues={this.getInitialValues(initialValues)}
          onUpdate={data => onUpdate?.(this.processFormData(data))}
          onChange={data => onUpdate?.(this.processFormData(data))}
          stepViewType={stepViewType}
          allowableTypes={allowableTypes}
          readonly={!!get(inputSetData, 'readonly', false)}
          template={get(inputSetData, 'template', undefined)}
          path={get(inputSetData, 'path', '')}
        />
      )
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

    /* istanbul ignore else */
    if (isEmpty(clonedValues.spec)) {
      return initialValues
    }

    /* istanbul ignore else */
    if (clonedValues.spec.applicationName) {
      const appName = clonedValues.spec.applicationName
      const agentId = clonedValues.spec.agentId
      clonedValues.spec.applicationNameOption =
        appName === RUNTIME_INPUT_VALUE
          ? RUNTIME_INPUT_VALUE
          : {
              label: `${appName} (${agentId})`,
              value: appName || '',
              sourceType: SOURCE_TYPE_UNSET,
              agentId
            }
    }

    const targetRevision = clonedValues.spec.targetRevision as string
    /* istanbul ignore else */
    if (targetRevision) {
      clonedValues.spec.targetRevision =
        targetRevision === RUNTIME_INPUT_VALUE
          ? RUNTIME_INPUT_VALUE
          : {
              label: targetRevision,
              value: targetRevision
            }
    }

    const parameters = (clonedValues.spec.helm as HelmValues)?.parameters
    const fileParameters = (clonedValues.spec.helm as HelmValues)?.fileParameters

    /* istanbul ignore else */
    if (!clonedValues.spec.helm) {
      clonedValues.spec.helm = {}
    }

    // Adding uuid to parameters
    /* istanbul ignore else */
    if (parameters?.length) {
      ;(clonedValues.spec.helm as HelmValues).parameters = parameters.map(variable => ({
        ...variable,
        id: uuid()
      }))
    }
    /* istanbul ignore else */
    if (fileParameters?.length) {
      ;(clonedValues.spec.helm as HelmValues).fileParameters = fileParameters.map(({ path, ...variable }) => ({
        ...variable,
        value: path,
        id: uuid()
      }))
    }

    const valueFiles = (clonedValues.spec.helm as HelmValues)?.valueFiles as string[]

    /* istanbul ignore else */
    if (valueFiles?.length) {
      ;(clonedValues.spec.helm as HelmValues).valueFiles = valueFiles.map(value => ({
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
    const targetRevisionOption = clonedValues.spec.targetRevision
    const isTargetRevisionRuntime = targetRevisionOption === RUNTIME_INPUT_VALUE
    const appName = /* istanbul ignore next */ (applicationNameOption as ApplicationOption)?.value
    const targetRevision = /* istanbul ignore next */ (targetRevisionOption as SelectOption)?.value

    const parameters = /* istanbul ignore next */ (clonedValues.spec.helm as HelmValues)?.parameters
    const fileParameters = /* istanbul ignore next */ (clonedValues.spec.helm as HelmValues)?.fileParameters
    const valueFiles = /* istanbul ignore next */ (clonedValues.spec.helm as HelmValues)?.valueFiles as SelectOption[]
    const isHelm =
      /* istanbul ignore next */ (data.spec?.applicationNameOption as ApplicationOption)?.appType === 'Helm'

    /* istanbul ignore else */
    if (appName && typeof appName === 'string') {
      clonedValues.spec.applicationName = appName
      clonedValues.spec.agentId = (applicationNameOption as ApplicationOption)?.agentId
    }

    /* istanbul ignore else */
    if (isApplicationRuntime) {
      clonedValues.spec.applicationName = RUNTIME_INPUT_VALUE
      clonedValues.spec.agentId = RUNTIME_INPUT_VALUE
      clonedValues.spec.targetRevision = RUNTIME_INPUT_VALUE
      // delete clonedValues.spec.targetRevision
    }

    /* istanbul ignore else */
    if (targetRevision && typeof targetRevision === 'string') {
      clonedValues.spec.targetRevision = targetRevision
    }
    /* istanbul ignore else */
    if (isTargetRevisionRuntime) {
      clonedValues.spec.targetRevision = RUNTIME_INPUT_VALUE
    }

    /* istanbul ignore else */
    if (!clonedValues.spec.helm) {
      clonedValues.spec.helm = {}
    }

    // Removing uuid from parameters
    /* istanbul ignore else */
    if (isHelm && /* istanbul ignore next */ parameters?.length) {
      ;(clonedValues.spec.helm as HelmValues).parameters = parameters
        .filter(variable => variable.value)
        .map(({ id, ...variable }) => variable)
    }

    /* istanbul ignore else */
    if (isHelm && /* istanbul ignore next */ fileParameters?.length) {
      ;(clonedValues.spec.helm as HelmValues).fileParameters = fileParameters
        .filter(variable => variable.value)
        .map(({ id, value, ...variable }) => ({
          ...variable,
          path: value
        }))
    }

    /* istanbul ignore next */
    if (isHelm && valueFiles?.length) {
      ;(clonedValues.spec.helm as HelmValues).valueFiles = valueFiles
        .filter(option => option?.value)
        .map(({ value }) => value as string)
    }

    /* istanbul ignore else */
    if (!isHelm || isEmpty(clonedValues.spec.helm) || (clonedValues.spec.helm as string) === RUNTIME_INPUT_VALUE) {
      delete clonedValues.spec.helm
    }

    if (isApplicationRuntime || (isHelm && isTargetRevisionRuntime)) {
      clonedValues.spec.helm = RUNTIME_INPUT_VALUE
    }

    delete clonedValues.spec.applicationNameOption
    return clonedValues
  }
}
