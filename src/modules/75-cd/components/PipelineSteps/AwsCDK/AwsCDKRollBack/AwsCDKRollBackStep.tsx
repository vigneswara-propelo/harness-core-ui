/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty, set } from 'lodash-es'
import type { FormikErrors } from 'formik'
import { IconName, AllowedTypes, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { StringsMap } from 'framework/strings/StringsContext'
import type { MapValue } from '@common/components/MultiTypeMap/MultiTypeMap'
import { StepViewType, StepProps, ValidateInputSetProps, InputSetData } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { AwsCDKRollBackStepInitialValues } from '@pipeline/utils/types'
import { validateGenericFields } from '../../Common/GenericExecutionStep/utils'
import { AwsCDKRollBackStepInputSetMode } from './AwsCDKRollBackStepInputSet'
import { AwsCDKRollBackStepEditRef, AwsCDKRollBackStepFormikValues } from './AwsCDKRollBackStepEdit'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface AwsCDKRollBackStepEditProps {
  initialValues: AwsCDKRollBackStepInitialValues
  onUpdate?: (data: AwsCDKRollBackStepInitialValues) => void
  stepViewType?: StepViewType
  onChange?: (data: AwsCDKRollBackStepInitialValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
  inputSetData: {
    template?: AwsCDKRollBackStepInitialValues
    path?: string
    readonly?: boolean
  }
}

export interface AwsCDKRollBackVariableStepProps {
  initialValues: AwsCDKRollBackStepInitialValues
  stageIdentifier: string
  onUpdate?(data: AwsCDKRollBackStepInitialValues): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: AwsCDKRollBackStepInitialValues
}

export class AwsCDKRollBackStep extends PipelineStep<AwsCDKRollBackStepInitialValues> {
  protected type = StepType.AwsCdkRollback
  protected stepName = 'AWS CDK Rollback'
  protected stepIcon: IconName = 'cdk-roll-back'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.AwsCdkRollBack'
  protected isHarnessSpecific = false
  protected referenceId = 'AwsCDKRollBackStep'

  protected defaultValues: AwsCDKRollBackStepInitialValues = {
    identifier: '',
    name: '',
    type: StepType.AwsCdkRollback,
    timeout: '10m',
    spec: {
      provisionerIdentifier: ''
    }
  }

  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<AwsCDKRollBackStepInitialValues>): JSX.Element {
    const {
      initialValues,
      stepViewType,
      inputSetData,
      customStepProps,
      isNewStep,
      readonly,
      allowableTypes,
      onUpdate,
      onChange,
      formikRef
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <AwsCDKRollBackStepInputSetMode
          initialValues={initialValues}
          allowableTypes={allowableTypes}
          inputSetData={inputSetData as InputSetData<AwsCDKRollBackStepInitialValues>}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as AwsCDKRollBackVariableStepProps
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
      <AwsCDKRollBackStepEditRef
        initialValues={initialValues}
        onUpdate={(formData: AwsCDKRollBackStepFormikValues) => onUpdate?.(this.processFormData(formData))}
        onChange={(formData: AwsCDKRollBackStepFormikValues) => onChange?.(this.processFormData(formData))}
        isNewStep={isNewStep}
        allowableTypes={allowableTypes}
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
  }: ValidateInputSetProps<AwsCDKRollBackStepInitialValues>): FormikErrors<AwsCDKRollBackStepInitialValues> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm

    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as FormikErrors<AwsCDKRollBackStepInitialValues>

    if (
      isEmpty(data?.spec?.provisionerIdentifier) &&
      isRequired &&
      getMultiTypeFromValue(template?.spec?.provisionerIdentifier) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        `spec.provisionerIdentifier`,
        getString?.('common.validation.fieldIsRequired', { name: getString?.('pipelineSteps.connectorLabel') })
      )
    }

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
  /* eslint-disable */
  processFormData(formData: any): AwsCDKRollBackStepInitialValues {
    let envVariables
    if (formData.spec.envVariables && !isEmpty(formData.spec.envVariables)) {
      envVariables = (formData.spec?.envVariables as MapValue).reduce(
        (agg: { [key: string]: string }, envVar: { key: string; value: string }) => ({
          ...agg,
          [envVar.key]: envVar.value
        }),
        {}
      )
    }
    return {
      ...formData,
      spec: {
        ...formData.spec,
        envVariables
      }
    }
  }
}
