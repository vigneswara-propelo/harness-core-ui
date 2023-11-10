/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, getMultiTypeFromValue, MultiTypeInputType, AllowedTypes } from '@harness/uicore'
import * as Yup from 'yup'
import { connect, FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import { isEmpty } from 'lodash-es'
import type { StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type {
  MultiTypeMapUIType,
  MultiTypeListUIType,
  MultiTypeConnectorRef
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { StringsMap } from 'stringTypes'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { isPollingIntervalGreaterThanTimeout } from '@pipeline/components/PipelineSteps/Steps/JenkinsStep/helper'
import { JenkinsStepBaseWithRef } from '@pipeline/components/PipelineSteps/Steps/JenkinsStep/JenkinsStepBase'
import JenkinsStepInputSetBasic from '@pipeline/components/PipelineSteps/Steps/JenkinsStep/JenkinsStepInputSet'
import {
  JenkinsStepVariables,
  JenkinsStepVariablesProps
} from '@pipeline/components/PipelineSteps/Steps/JenkinsStep/JenkinsStepVariables'
import type { JenkinsStepV2Data, JenkinsStepV2Spec } from './JenkinsStepsV2.types'

const JenkinsStepV2InputSet = connect(JenkinsStepInputSetBasic)
export interface JenkinsStepV2SpecUI
  extends Omit<JenkinsStepV2Spec, 'connectorRef' | 'tags' | 'labels' | 'buildArgs' | 'pull' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  tags: MultiTypeListUIType
  labels?: MultiTypeMapUIType
  buildArgs?: MultiTypeMapUIType
}

// Interface for the form
export interface JenkinsStepV2DataUI extends Omit<JenkinsStepV2Data, 'spec'> {
  spec: JenkinsStepV2SpecUI
}

export interface JenkinsStepV2Props {
  initialValues: JenkinsStepV2Data
  template?: JenkinsStepV2Data
  path?: string
  readonly?: boolean
  isNewStep?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: JenkinsStepV2Data) => void
  onChange?: (data: JenkinsStepV2Data) => void
  allowableTypes: AllowedTypes
  formik?: FormikProps<JenkinsStepV2Data>
}

export class JenkinsStepV2 extends PipelineStep<JenkinsStepV2Data> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
    this.invocationMap = new Map()
  }

  protected type = StepType.JenkinsBuildV2
  protected stepName = 'Jenkins'
  protected stepIcon: IconName = 'service-jenkins'
  // to be edited in strings.en.yaml file in future
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.Jenkins'
  protected stepPaletteVisible = false

  protected defaultValues: JenkinsStepV2Data = {
    identifier: '',
    type: StepType.JenkinsBuildV2 as string,
    spec: {
      connectorRef: '',
      jobName: '',
      consoleLogPollFrequency: '5s',
      jobParameter: [],
      unstableStatusAsSuccess: false,
      useConnectorUrlForJobExecution: false
    }
  }

  /* istanbul ignore next */
  processFormData(data: JenkinsStepV2Data): JenkinsStepV2Data {
    const { identifier, name, type, timeout, failureStrategies, spec } = data
    const {
      connectorRef,
      jobName,
      childJobName,
      jobParameter,
      delegateSelectors,
      unstableStatusAsSuccess,
      useConnectorUrlForJobExecution,
      consoleLogPollFrequency
    } = spec

    const processedData = {
      identifier,
      name,
      type,
      timeout,
      failureStrategies,
      spec: {
        connectorRef,
        consoleLogPollFrequency,
        jobName: childJobName
          ? typeof childJobName === 'string'
            ? childJobName
            : childJobName.label
          : typeof jobName === 'string'
          ? jobName
          : jobName.label,
        jobParameter,
        delegateSelectors,
        unstableStatusAsSuccess,
        useConnectorUrlForJobExecution
      }
    } as JenkinsStepV2Data

    return processedData
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<JenkinsStepV2Data>): FormikErrors<JenkinsStepV2Data> {
    const errors: FormikErrors<JenkinsStepV2Data> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      const timeout = Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString?.('validation.timeout10SecMinimum'))
      })

      try {
        timeout.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)
          Object.assign(errors, err)
        }
      }
    }
    if (getMultiTypeFromValue(template?.spec?.consoleLogPollFrequency) === MultiTypeInputType.RUNTIME) {
      const consoleLogPollFrequencyValidation = Yup.object().shape({
        consoleLogPollFrequency: getDurationValidationSchema({ minimum: '5s' }).required(
          getString?.('pipeline.jenkinsStep.validations.consoleLogPollFrequency')
        )
      })

      try {
        consoleLogPollFrequencyValidation.validateSync(data.spec)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)
          Object.assign(errors, { spec: err })
        }
      }
    }

    if (!isEmpty(data?.spec?.consoleLogPollFrequency) && !isEmpty(data?.timeout)) {
      if (isPollingIntervalGreaterThanTimeout(data)) {
        Object.assign(errors, {
          spec: {
            consoleLogPollFrequency: getString?.('pipeline.jiraApprovalStep.validations.retryIntervalExceedingTimeout')
          }
        })
      }
    }
    if (
      typeof template?.spec?.connectorRef === 'string' &&
      getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.connectorRef)
    ) {
      Object.assign(errors, {
        spec: {
          connectorRef: getString?.('common.validation.connectorRef')
        }
      })
    }

    if (
      typeof template?.spec?.jobName === 'string' &&
      getMultiTypeFromValue(template?.spec?.jobName) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.jobName)
    ) {
      Object.assign(errors, {
        spec: {
          jobName: getString?.('pipeline.jenkinsStep.validations.jobName')
        }
      })
    }
    return errors
  }

  renderStep(props: StepProps<JenkinsStepV2Data>): JSX.Element {
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
        <JenkinsStepV2InputSet
          initialValues={initialValues}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          inputSetData={inputSetData}
          readonly={!!inputSetData?.readonly}
          stepViewType={stepViewType}
          ref={formikRef}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return <JenkinsStepVariables {...(customStepProps as JenkinsStepVariablesProps)} initialValues={initialValues} />
    }

    return (
      <JenkinsStepBaseWithRef
        initialValues={initialValues}
        allowableTypes={allowableTypes}
        onChange={(values: JenkinsStepV2Data) => onChange?.(this.processFormData(values))}
        stepViewType={stepViewType || StepViewType.Edit}
        onUpdate={(values: JenkinsStepV2Data) => onUpdate?.(this.processFormData(values))}
        ref={formikRef}
        isNewStep={isNewStep}
        readonly={readonly}
      />
    )
  }
}
