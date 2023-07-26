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
import type { ServerlessAwsLambdaPackageV2StepInitialValues } from '@pipeline/utils/types'
import { ConnectorRefFormValueType, getConnectorRefValue } from '@cd/utils/connectorUtils'
import { validateGenericFields } from '../../Common/GenericExecutionStep/utils'
import { ServerlessAwsLambdaPackageV2StepInputSetMode } from './ServerlessAwsLambdaPackageV2StepInputSet'
import {
  ServerlessAwsLambdaPackageV2StepEditRef,
  ServerlessAwsLambdaPackageV2StepFormikValues
} from './ServerlessAwsLambdaPackageV2StepEdit'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface ServerlessAwsLambdaPackageV2StepEditProps {
  initialValues: ServerlessAwsLambdaPackageV2StepInitialValues
  onUpdate?: (data: ServerlessAwsLambdaPackageV2StepInitialValues) => void
  stepViewType?: StepViewType
  onChange?: (data: ServerlessAwsLambdaPackageV2StepInitialValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
  inputSetData: {
    template?: ServerlessAwsLambdaPackageV2StepInitialValues
    path?: string
    readonly?: boolean
  }
}

export interface ServerlessPackageVariableStepProps {
  initialValues: ServerlessAwsLambdaPackageV2StepInitialValues
  stageIdentifier: string
  onUpdate?(data: ServerlessAwsLambdaPackageV2StepInitialValues): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ServerlessAwsLambdaPackageV2StepInitialValues
}

export class ServerlessAwsLambdaPackageV2Step extends PipelineStep<ServerlessAwsLambdaPackageV2StepInitialValues> {
  protected type = StepType.ServerlessAwsLambdaPackageV2
  protected stepName = 'Serverless Package Step'
  protected stepIcon: IconName = 'serverless-aws-lambda-package'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.ServerlessPackage'
  protected isHarnessSpecific = false
  protected referenceId = 'ServerlessAwsLambdaPackageV2Step'

  protected defaultValues: ServerlessAwsLambdaPackageV2StepInitialValues = {
    identifier: '',
    name: '',
    type: StepType.ServerlessAwsLambdaPackageV2,
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

  renderStep(props: StepProps<ServerlessAwsLambdaPackageV2StepInitialValues>): JSX.Element {
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
        <ServerlessAwsLambdaPackageV2StepInputSetMode
          initialValues={initialValues}
          allowableTypes={allowableTypes}
          inputSetData={inputSetData as InputSetData<ServerlessAwsLambdaPackageV2StepInitialValues>}
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
      <ServerlessAwsLambdaPackageV2StepEditRef
        initialValues={initialValues}
        onUpdate={(formData: ServerlessAwsLambdaPackageV2StepFormikValues) =>
          onUpdate?.(this.processFormData(formData))
        }
        onChange={(formData: ServerlessAwsLambdaPackageV2StepFormikValues) =>
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
  }: ValidateInputSetProps<ServerlessAwsLambdaPackageV2StepInitialValues>): FormikErrors<ServerlessAwsLambdaPackageV2StepInitialValues> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm

    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as FormikErrors<ServerlessAwsLambdaPackageV2StepInitialValues>

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

  processFormData(formData: any): ServerlessAwsLambdaPackageV2StepInitialValues {
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
        packageCommandOptions:
          typeof formData.spec.packageCommandOptions === 'string'
            ? formData.spec.packageCommandOptions
            : (formData.spec.packageCommandOptions as ListValue)?.map(
                (packageCommandOption: { id: string; value: string }) => packageCommandOption.value
              ),
        envVariables: envVariables
      }
    }
  }
}
