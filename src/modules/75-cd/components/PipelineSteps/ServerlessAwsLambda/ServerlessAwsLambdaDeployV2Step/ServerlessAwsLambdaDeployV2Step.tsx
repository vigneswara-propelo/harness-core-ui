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
import type { ListValue } from '@common/components/MultiTypeList/MultiTypeList'
import { StepViewType, StepProps, ValidateInputSetProps, InputSetData } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { ServerlessAwsLambdaDeployV2StepInitialValues } from '@pipeline/utils/types'
import { ConnectorRefFormValueType, getConnectorRefValue } from '@cd/utils/connectorUtils'
import { validateGenericFields } from '../../Common/GenericExecutionStep/utils'
import { ServerlessAwsLambdaDeployV2StepInputSetMode } from './ServerlessAwsLambdaDeployV2StepInputSet'
import {
  ServerlessAwsLambdaDeployV2StepEditRef,
  ServerlessAwsLambdaDeployV2StepFormikValues
} from './ServerlessAwsLambdaDeployV2StepEdit'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface ServerlessAwsLambdaDeployV2StepEditProps {
  initialValues: ServerlessAwsLambdaDeployV2StepInitialValues
  onUpdate?: (data: ServerlessAwsLambdaDeployV2StepInitialValues) => void
  stepViewType?: StepViewType
  onChange?: (data: ServerlessAwsLambdaDeployV2StepInitialValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
  inputSetData: {
    template?: ServerlessAwsLambdaDeployV2StepInitialValues
    path?: string
    readonly?: boolean
  }
}

export interface ServerlessPackageVariableStepProps {
  initialValues: ServerlessAwsLambdaDeployV2StepInitialValues
  stageIdentifier: string
  onUpdate?(data: ServerlessAwsLambdaDeployV2StepInitialValues): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ServerlessAwsLambdaDeployV2StepInitialValues
}

export class ServerlessAwsLambdaDeployV2Step extends PipelineStep<ServerlessAwsLambdaDeployV2StepInitialValues> {
  protected type = StepType.ServerlessAwsLambdaDeployV2
  protected stepName = 'Serverless Deploy Step'
  protected stepIcon: IconName = 'serverless-aws-lambda-deploy-v2'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.ServerlessLambdaDeploy'
  protected isHarnessSpecific = false
  protected referenceId = 'ServerlessAwsLambdaDeployV2Step'

  protected defaultValues: ServerlessAwsLambdaDeployV2StepInitialValues = {
    identifier: '',
    name: '',
    type: StepType.ServerlessAwsLambdaDeployV2,
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

  renderStep(props: StepProps<ServerlessAwsLambdaDeployV2StepInitialValues>): JSX.Element {
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
        <ServerlessAwsLambdaDeployV2StepInputSetMode
          initialValues={initialValues}
          allowableTypes={allowableTypes}
          inputSetData={inputSetData as InputSetData<ServerlessAwsLambdaDeployV2StepInitialValues>}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as ServerlessPackageVariableStepProps
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
      <ServerlessAwsLambdaDeployV2StepEditRef
        initialValues={initialValues}
        onUpdate={(formData: ServerlessAwsLambdaDeployV2StepFormikValues) => onUpdate?.(this.processFormData(formData))}
        onChange={(formData: ServerlessAwsLambdaDeployV2StepFormikValues) => onChange?.(this.processFormData(formData))}
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
  }: ValidateInputSetProps<ServerlessAwsLambdaDeployV2StepInitialValues>): FormikErrors<ServerlessAwsLambdaDeployV2StepInitialValues> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm

    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as FormikErrors<ServerlessAwsLambdaDeployV2StepInitialValues>

    if (
      isEmpty(data?.spec?.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        `spec.connectorRef`,
        getString?.('common.validation.fieldIsRequired', { name: getString?.('pipelineSteps.connectorLabel') })
      )
    }

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }

  processFormData(formData: any): ServerlessAwsLambdaDeployV2StepInitialValues {
    let envVariables
    if (formData.spec.envVariables && !isEmpty(formData.spec.envVariables)) {
      envVariables = formData.spec?.envVariables.reduce(
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
        deployCommandOptions:
          typeof formData.spec.deployCommandOptions === 'string'
            ? formData.spec.deployCommandOptions
            : (formData.spec.deployCommandOptions as ListValue)?.map(
                (deployCommandOption: { id: string; value: string }) => deployCommandOption.value
              ),
        envVariables: envVariables
      }
    }
  }
}
