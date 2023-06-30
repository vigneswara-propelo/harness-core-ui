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
import { StepViewType, StepProps, ValidateInputSetProps, InputSetData } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { ServerlessAwsLambdaPrepareRollbackV2StepInitialValues } from '@pipeline/utils/types'
import { ConnectorRefFormValueType, getConnectorRefValue } from '@cd/utils/connectorUtils'
import { validateGenericFields } from '../../Common/GenericExecutionStep/utils'
import { ServerlessAwsLambdaPrepareRollbackV2StepInputSetMode } from './ServerlessAwsLambdaPrepareRollbackV2StepInputSet'
import {
  ServerlessAwsLambdaPrepareRollbackV2StepEditRef,
  ServerlessAwsLambdaPrepareRollbackV2StepFormikValues
} from './ServerlessAwsLambdaPrepareRollbackV2StepEdit'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface ServerlessPrepareRollbackStepEditProps {
  initialValues: ServerlessAwsLambdaPrepareRollbackV2StepInitialValues
  onUpdate?: (data: ServerlessAwsLambdaPrepareRollbackV2StepInitialValues) => void
  stepViewType?: StepViewType
  onChange?: (data: ServerlessAwsLambdaPrepareRollbackV2StepInitialValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
  inputSetData: {
    template?: ServerlessAwsLambdaPrepareRollbackV2StepInitialValues
    path?: string
    readonly?: boolean
  }
}

export interface ServerlessPrepareRollbackVariableStepProps {
  initialValues: ServerlessAwsLambdaPrepareRollbackV2StepInitialValues
  stageIdentifier: string
  onUpdate?(data: ServerlessAwsLambdaPrepareRollbackV2StepInitialValues): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ServerlessAwsLambdaPrepareRollbackV2StepInitialValues
}

export class ServerlessAwsLambdaPrepareRollbackV2Step extends PipelineStep<ServerlessAwsLambdaPrepareRollbackV2StepInitialValues> {
  protected type = StepType.ServerlessAwsLambdaPrepareRollbackV2
  protected stepName = 'Serverless Prepare Rollback Step'
  protected stepIcon: IconName = 'serverless-aws-lambda-prepare-rollback'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.ServerlessPrepareRollback'
  protected isHarnessSpecific = false
  protected referenceId = 'ServerlessPrepareRollbackStep'

  protected defaultValues: ServerlessAwsLambdaPrepareRollbackV2StepInitialValues = {
    identifier: '',
    name: '',
    type: StepType.ServerlessAwsLambdaPrepareRollbackV2,
    timeout: '10m',
    spec: {
      connectorRef: ''
    }
  }

  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<ServerlessAwsLambdaPrepareRollbackV2StepInitialValues>): JSX.Element {
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
        <ServerlessAwsLambdaPrepareRollbackV2StepInputSetMode
          initialValues={initialValues}
          allowableTypes={allowableTypes}
          inputSetData={inputSetData as InputSetData<ServerlessAwsLambdaPrepareRollbackV2StepInitialValues>}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as ServerlessPrepareRollbackVariableStepProps
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
      <ServerlessAwsLambdaPrepareRollbackV2StepEditRef
        initialValues={initialValues}
        onUpdate={(formData: ServerlessAwsLambdaPrepareRollbackV2StepFormikValues) =>
          onUpdate?.(this.processFormData(formData))
        }
        onChange={(formData: ServerlessAwsLambdaPrepareRollbackV2StepFormikValues) =>
          onChange?.(this.processFormData(formData))
        }
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
  }: ValidateInputSetProps<ServerlessAwsLambdaPrepareRollbackV2StepInitialValues>): FormikErrors<ServerlessAwsLambdaPrepareRollbackV2StepInitialValues> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm

    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as FormikErrors<ServerlessAwsLambdaPrepareRollbackV2StepInitialValues>

    if (
      isEmpty(data?.spec?.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        `spec.connectorRef`,
        getString?.('fieldRequired', { field: getString?.('pipelineSteps.connectorLabel') })
      )
    }

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }

  processFormData(
    formData: ServerlessAwsLambdaPrepareRollbackV2StepFormikValues
  ): ServerlessAwsLambdaPrepareRollbackV2StepInitialValues {
    return {
      ...formData,
      spec: {
        ...formData.spec,
        connectorRef: getConnectorRefValue(formData.spec.connectorRef as ConnectorRefFormValueType)
      }
    }
  }
}
