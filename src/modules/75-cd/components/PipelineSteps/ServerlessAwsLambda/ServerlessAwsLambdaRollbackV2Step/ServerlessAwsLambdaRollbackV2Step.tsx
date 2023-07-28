/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikErrors } from 'formik'
import { isEmpty, set } from 'lodash-es'
import { IconName, MultiTypeInputType, getMultiTypeFromValue } from '@harness/uicore'

import type { StepElementConfig } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { StringsMap } from 'framework/strings/StringsContext'
import { MapValue } from '@common/components/MultiTypeCustomMap/MultiTypeCustomMap'
import { StepViewType, StepProps, ValidateInputSetProps, InputSetData } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { ServerlessAwsLambdaRollbackV2StepInitialValues } from '@pipeline/utils/types'
import { ConnectorRefFormValueType, getConnectorRefValue } from '@cd/utils/connectorUtils'
import { validateGenericFields } from '../../Common/GenericExecutionStep/utils'
import {
  ServerlessAwsLambdaRollbackV2StepEditRef,
  ServerlessAwsLambdaRollbackV2StepFormikValues
} from './ServerlessAwsLambdaRollbackV2StepEdit'
import { ServerlessAwsLambdaRollbackV2StepInputSetMode } from './ServerlessAwsLambdaRollbackV2StepInputSet'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

interface ServerlessAwsLambdaRollbackV2VariableStepProps {
  initialValues: StepElementConfig
  stageIdentifier: string
  onUpdate?(data: StepElementConfig): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: StepElementConfig
}

export class ServerlessAwsLambdaRollbackV2Step extends PipelineStep<ServerlessAwsLambdaRollbackV2StepInitialValues> {
  protected type = StepType.ServerlessAwsLambdaRollbackV2
  protected stepName = 'Serverless Aws Lambda Rollback'
  protected stepIcon: IconName = 'serverless-aws-lambda-rollback-v2'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.ServerlessLambdaRollback'
  protected isHarnessSpecific = false
  protected defaultValues: ServerlessAwsLambdaRollbackV2StepInitialValues = {
    identifier: '',
    name: '',
    type: StepType.ServerlessAwsLambdaRollbackV2,
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

  renderStep(props: StepProps<ServerlessAwsLambdaRollbackV2StepInitialValues>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      allowableTypes,
      onChange
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <ServerlessAwsLambdaRollbackV2StepInputSetMode
          initialValues={initialValues}
          allowableTypes={allowableTypes}
          inputSetData={inputSetData as InputSetData<ServerlessAwsLambdaRollbackV2StepInitialValues>}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as ServerlessAwsLambdaRollbackV2VariableStepProps
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
      <ServerlessAwsLambdaRollbackV2StepEditRef
        initialValues={initialValues}
        onUpdate={(formData: ServerlessAwsLambdaRollbackV2StepFormikValues) =>
          onUpdate?.(this.processFormData(formData))
        }
        onChange={(formData: ServerlessAwsLambdaRollbackV2StepFormikValues) =>
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
  }: ValidateInputSetProps<ServerlessAwsLambdaRollbackV2StepInitialValues>): FormikErrors<ServerlessAwsLambdaRollbackV2StepInitialValues> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm

    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as FormikErrors<ServerlessAwsLambdaRollbackV2StepInitialValues>

    if (
      isEmpty(data?.spec?.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        `spec.connectorRef`,
        getString?.('common.validation.fieldIsRequired', { field: getString?.('pipelineSteps.connectorLabel') })
      )
    }

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }

  processFormData(formData: any): ServerlessAwsLambdaRollbackV2StepInitialValues {
    let envVariables
    if (formData.spec?.envVariables && !isEmpty(formData.spec.envVariables)) {
      envVariables = (formData.spec.envVariables as MapValue).reduce(
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
        connectorRef: getConnectorRefValue(formData.spec.connectorRef as ConnectorRefFormValueType),
        imagePullPolicy:
          formData.spec.imagePullPolicy && formData.spec.imagePullPolicy.length > 0
            ? formData.spec.imagePullPolicy
            : undefined,
        envVariables
      }
    }
  }
}
