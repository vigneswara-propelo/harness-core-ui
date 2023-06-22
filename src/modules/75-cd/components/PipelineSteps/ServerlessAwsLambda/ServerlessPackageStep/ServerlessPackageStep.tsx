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
import type { ServerlessPackageStepInitialValues } from '@pipeline/utils/types'
import { ConnectorRefFormValueType, getConnectorRefValue } from '@cd/utils/connectorUtils'
import { validateGenericFields } from '../../Common/GenericExecutionStep/utils'
import { ServerlessPackageStepInputSetMode } from './ServerlessPackageStepInputSet'
import { ServerlessPackageStepEditRef, ServerlessPackageStepFormikValues } from './ServerlessPackageStepEdit'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface ServerlessPackageStepEditProps {
  initialValues: ServerlessPackageStepInitialValues
  onUpdate?: (data: ServerlessPackageStepInitialValues) => void
  stepViewType?: StepViewType
  onChange?: (data: ServerlessPackageStepInitialValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
  inputSetData: {
    template?: ServerlessPackageStepInitialValues
    path?: string
    readonly?: boolean
  }
}

export interface ServerlessPackageVariableStepProps {
  initialValues: ServerlessPackageStepInitialValues
  stageIdentifier: string
  onUpdate?(data: ServerlessPackageStepInitialValues): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ServerlessPackageStepInitialValues
}

export class ServerlessPackageStep extends PipelineStep<ServerlessPackageStepInitialValues> {
  protected type = StepType.ServerlessAwsLambdaPackageV2
  protected stepName = 'Serverless Package Step'
  protected stepIcon: IconName = 'serverless-deploy-step'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.ServerlessPackage'
  protected isHarnessSpecific = false
  protected referenceId = 'ServerlessPackageStep'

  protected defaultValues: ServerlessPackageStepInitialValues = {
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

  renderStep(props: StepProps<ServerlessPackageStepInitialValues>): JSX.Element {
    const {
      initialValues,
      stepViewType,
      inputSetData,
      customStepProps,
      isNewStep,
      readonly,
      allowableTypes,
      onUpdate,
      formikRef
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <ServerlessPackageStepInputSetMode
          initialValues={initialValues}
          allowableTypes={allowableTypes}
          inputSetData={inputSetData as InputSetData<ServerlessPackageStepInitialValues>}
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
      <ServerlessPackageStepEditRef
        initialValues={initialValues}
        onUpdate={(formData: ServerlessPackageStepFormikValues) => onUpdate?.(this.processFormData(formData))}
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
  }: ValidateInputSetProps<ServerlessPackageStepInitialValues>): FormikErrors<ServerlessPackageStepInitialValues> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm

    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as FormikErrors<ServerlessPackageStepInitialValues>

    if (
      isEmpty(data?.spec?.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `spec.connectorRef`, getString?.('fieldRequired', { field: getString?.('connector') }))
    }

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }

  processFormData(formData: ServerlessPackageStepFormikValues): ServerlessPackageStepInitialValues {
    return {
      ...formData,
      spec: {
        ...formData.spec,
        packageCommandOptions:
          typeof formData.spec.packageCommandOptions === 'string'
            ? formData.spec.packageCommandOptions
            : (formData.spec.packageCommandOptions as ListValue)?.map(
                (packageCommandOption: { id: string; value: string }) => packageCommandOption.value
              ),
        connectorRef: getConnectorRefValue(formData.spec.connectorRef as ConnectorRefFormValueType)
      }
    }
  }
}
