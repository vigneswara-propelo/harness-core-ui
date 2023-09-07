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
import type { MapValue } from '@common/components/MultiTypeMap/MultiTypeMap'
import { StepViewType, StepProps, ValidateInputSetProps, InputSetData } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { AwsCDKDiffStepInitialValues } from '@pipeline/utils/types'
import { ConnectorRefFormValueType, getConnectorRefValue } from '@cd/utils/connectorUtils'
import { validateGenericFields } from '../../Common/GenericExecutionStep/utils'
import { AwsCDKDestroyStepInputSetMode } from './AwsCDKDestroyStepInputSet'
import { AwsCDKDestroyStepEditRef } from './AwsCDKDestroyStepEdit'
import type { AwsCDKCommonStepFormikValues } from '../AwsCDKCommonFields'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface AwsCDKDestroyStepInitialValues extends AwsCDKDiffStepInitialValues {
  parameters?: string | string[]
}

export interface AwsCDKDestroyStepEditProps {
  initialValues: AwsCDKDestroyStepInitialValues
  onUpdate?: (data: AwsCDKDestroyStepInitialValues) => void
  stepViewType?: StepViewType
  onChange?: (data: AwsCDKDestroyStepInitialValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
  inputSetData: {
    template?: AwsCDKDestroyStepInitialValues
    path?: string
    readonly?: boolean
  }
}

export interface AwsCDKDestroyVariableStepProps {
  initialValues: AwsCDKDestroyStepInitialValues
  stageIdentifier: string
  onUpdate?(data: AwsCDKDestroyStepInitialValues): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: AwsCDKDestroyStepInitialValues
}

export class AwsCDKDestroyStep extends PipelineStep<AwsCDKDestroyStepInitialValues> {
  protected type = StepType.AwsCdkDestroy
  protected stepName = 'AWS CDK Destroy'
  protected stepIcon: IconName = 'cdk-destroy'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.AwsCdkDestroy'
  protected isHarnessSpecific = false
  protected referenceId = 'AwsCDKDestroyStep'

  protected defaultValues: AwsCDKDestroyStepInitialValues = {
    identifier: '',
    name: '',
    type: StepType.AwsCdkDestroy,
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

  renderStep(props: StepProps<AwsCDKDestroyStepInitialValues>): JSX.Element {
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
        <AwsCDKDestroyStepInputSetMode
          initialValues={initialValues}
          allowableTypes={allowableTypes}
          inputSetData={inputSetData as InputSetData<AwsCDKDestroyStepInitialValues>}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as AwsCDKDestroyVariableStepProps
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
      <AwsCDKDestroyStepEditRef
        initialValues={initialValues}
        onUpdate={(formData: AwsCDKCommonStepFormikValues) => onUpdate?.(this.processFormData(formData))}
        onChange={(formData: AwsCDKCommonStepFormikValues) => onChange?.(this.processFormData(formData))}
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
  }: ValidateInputSetProps<AwsCDKDestroyStepInitialValues>): FormikErrors<AwsCDKDestroyStepInitialValues> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm

    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as FormikErrors<AwsCDKDestroyStepInitialValues>

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

    if (
      isEmpty(data?.spec?.image) &&
      isRequired &&
      getMultiTypeFromValue(template?.spec?.image) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `spec.image`, getString?.('common.validation.fieldIsRequired', { name: getString?.('imageLabel') }))
    }

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
  /* eslint-disable */
  processFormData(formData: any): AwsCDKDestroyStepInitialValues {
    let commandOptions
    let stackNames
    if (formData.spec?.commandOptions && !isEmpty(formData.spec?.commandOptions)) {
      commandOptions =
        typeof formData.spec.commandOptions === 'string'
          ? formData.spec.commandOptions
          : (formData.spec.commandOptions as ListValue)?.map(
              (commandOption: { id: string; value: string }) => commandOption.value
            )
    }

    if (formData.spec?.stackNames && !isEmpty(formData.spec?.stackNames)) {
      stackNames =
        typeof formData.spec.stackNames === 'string'
          ? formData.spec.stackNames
          : (formData.spec.stackNames as ListValue)?.map((stackName: { id: string; value: string }) => stackName.value)
    }

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
        connectorRef: getConnectorRefValue(formData.spec.connectorRef as ConnectorRefFormValueType),
        commandOptions,
        stackNames,
        imagePullPolicy:
          formData.spec.imagePullPolicy && formData.spec.imagePullPolicy.length > 0
            ? formData.spec.imagePullPolicy
            : undefined,
        envVariables
      }
    }
  }
}
