/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { isEmpty, set, get, isArray, defaultTo, merge, isUndefined } from 'lodash-es'
import * as Yup from 'yup'
import { FormikErrors, yupToFormErrors } from 'formik'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { parse } from 'yaml'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { StepProps, StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { listSecretsV2Promise, SecretResponseWrapper } from 'services/cd-ng'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import type { StringsMap } from 'stringTypes'
import { shellScriptType } from './BaseShellScript'

import { ShellScriptData, ShellScriptFormData, variableSchema } from './shellScriptTypes'
import ShellScriptInputSetStep from './ShellScriptInputSetStep'
import { ShellScriptWidgetWithRef } from './ShellScriptWidget'
import { ShellScriptVariablesView, ShellScriptVariablesViewProps } from './ShellScriptVariablesView'
import { getInitialValues, getShellScriptConnectionLabel } from './helper'

const logger = loggerFor(ModuleName.CD)
const ConnectorRefRegex = /^.+step\.spec\.executionTarget\.connectorRef$/

const getConnectorValue = (connector?: SecretResponseWrapper): string =>
  `${
    connector?.secret?.orgIdentifier && connector?.secret?.projectIdentifier
      ? connector?.secret?.identifier
      : connector?.secret?.orgIdentifier
      ? `${Scope.ORG}.${connector?.secret?.identifier}`
      : `${Scope.ACCOUNT}.${connector?.secret?.identifier}`
  }` || ''

const getConnectorName = (connector?: SecretResponseWrapper): string =>
  `${
    connector?.secret?.orgIdentifier && connector?.secret?.projectIdentifier
      ? `${connector?.secret?.type}: ${connector?.secret?.name}`
      : connector?.secret?.orgIdentifier
      ? `${connector?.secret?.type}[Org]: ${connector?.secret?.name}`
      : `${connector?.secret?.type}[Account]: ${connector?.secret?.name}`
  }` || ''

export const processShellScriptFormData = (data: ShellScriptFormData): ShellScriptData => {
  const { spec: dataSpec = {} } = data ?? {}
  const { executionTarget = {}, onDelegate, delegateSelectors, source = {} } = dataSpec
  const { spec: sourceSpec } = source
  const { connectorRef } = executionTarget

  if (connectorRef) {
    executionTarget.connectorRef = (connectorRef?.value as string) || connectorRef?.toString()
  }

  const modifiedData = {
    ...data,
    spec: {
      ...dataSpec,
      delegateSelectors,
      onDelegate,
      source: {
        ...source,
        spec: {
          ...sourceSpec,
          script: sourceSpec?.script
        }
      },
      executionTarget,
      environmentVariables: Array.isArray(data.spec?.environmentVariables)
        ? data.spec?.environmentVariables.map(({ id, ...variable }) => ({
            ...variable,
            value: defaultTo(variable.value, '')
          }))
        : undefined,

      outputVariables: Array.isArray(data.spec?.outputVariables)
        ? data.spec?.outputVariables.map(({ id, ...variable }) => ({
            ...variable,
            value: defaultTo(variable.value, '')
          }))
        : undefined
    }
  }

  if (!isUndefined(modifiedData.spec?.onDelegate)) {
    delete modifiedData.spec.onDelegate
  }

  return modifiedData
}

export class ShellScriptStep extends PipelineStep<ShellScriptData> {
  constructor() {
    super()
    this.invocationMap.set(ConnectorRefRegex, this.getSecretsListForYaml.bind(this))
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = false
  }

  renderStep(props: StepProps<ShellScriptData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      onChange,
      allowableTypes,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <ShellScriptInputSetStep
          initialValues={getInitialValues(initialValues)}
          onUpdate={data => {
            onUpdate?.(this.processFormData(data))
          }}
          stepViewType={stepViewType}
          readonly={!!inputSetData?.readonly}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          allowableTypes={allowableTypes}
          shellScriptType={inputSetData?.allValues?.spec?.shell}
        />
      )
    }

    if (stepViewType === StepViewType.InputVariable) {
      return (
        <ShellScriptVariablesView
          {...(customStepProps as ShellScriptVariablesViewProps)}
          originalData={initialValues}
        />
      )
    }

    return (
      <ShellScriptWidgetWithRef
        initialValues={getInitialValues(initialValues)}
        onUpdate={data => {
          const payload = this.processFormData(data)
          onUpdate?.(payload)
        }}
        onChange={data => onChange?.(this.processFormData(data))}
        allowableTypes={allowableTypes}
        stepViewType={stepViewType}
        isNewStep={isNewStep}
        readonly={readonly}
        ref={formikRef}
      />
    )
  }

  /* istanbul ignore next */
  validateInputSet({
    data,
    template,
    getString,
    viewType,
    allValues
  }: ValidateInputSetProps<ShellScriptData>): FormikErrors<ShellScriptData> {
    const errors: FormikErrors<ShellScriptData> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      if (isRequired) {
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
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

    /* istanbul ignore else */
    if (isArray(template?.spec?.environmentVariables) && isRequired && getString) {
      try {
        const schema = Yup.object().shape({
          spec: Yup.object().shape({
            environmentVariables: variableSchema(getString, StepType.SHELLSCRIPT)
          })
        })
        schema.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)
          merge(errors, err)
        }
      }
    }

    if (isArray(template?.spec?.outputVariables) && isRequired && getString) {
      try {
        const schema = Yup.object().shape({
          spec: Yup.object().shape({
            outputVariables: variableSchema(getString, StepType.SHELLSCRIPT)
          })
        })
        schema.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)
          merge(errors, err)
        }
      }
    }

    const scriptValue = defaultTo(data?.spec?.source?.spec?.script, '').toString()
    /* istanbul ignore else */
    if (
      getMultiTypeFromValue(template?.spec?.source?.spec?.script) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(scriptValue)
    ) {
      set(errors, 'spec.source.spec.script', getString?.('fieldRequired', { field: 'Script' }))
    }

    if (
      getMultiTypeFromValue(template?.spec?.outputAlias?.key) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.outputAlias?.key)
    ) {
      set(
        errors,
        'spec.outputAlias.key',
        getString?.('fieldRequired', { field: getString('pipeline.exportVars.publishVarLabel') })
      )
    }

    const executionTarget = data?.spec?.executionTarget

    /*
     * Validate executionTarget fields when
     */
    // Case 1: The field is itself a runtime and required
    const isHostRuntime =
      getMultiTypeFromValue(template?.spec?.executionTarget?.host) === MultiTypeInputType.RUNTIME && isRequired
    const isConnectorRefRuntime =
      getMultiTypeFromValue(template?.spec?.executionTarget?.connectorRef) === MultiTypeInputType.RUNTIME && isRequired
    const isWorkingDirectoryRuntime =
      getMultiTypeFromValue(template?.spec?.executionTarget?.workingDirectory) === MultiTypeInputType.RUNTIME &&
      isRequired

    // Case 2 (For backward compatibility): onDelegate is runtime and and Specify Target Host selected with non execution time condition
    const isOnDelegateRuntimeAndTargetHostSelected =
      getMultiTypeFromValue(template?.spec?.onDelegate) === MultiTypeInputType.RUNTIME &&
      ((isUndefined(data.spec?.onDelegate) && !data?.spec?.onDelegate) || !isEmpty(executionTarget))
    // To check for execution time condition
    const isOnDelegateRuntimeAndTargetHostSelectedWithValues =
      isOnDelegateRuntimeAndTargetHostSelected && typeof executionTarget !== 'string'

    // Case 3: executionTarget is runtime and Specify Target Host Selected with non execution time condition
    const isExecutionTargetRuntimeAndTargetHostSelected =
      getMultiTypeFromValue(template?.spec?.executionTarget) === MultiTypeInputType.RUNTIME && !isEmpty(executionTarget)
    // To check for execution time condition
    const isExecutionTargetRuntimeAndTargetHostSelectedWithValues =
      isExecutionTargetRuntimeAndTargetHostSelected && typeof executionTarget !== 'string'

    /* istanbul ignore else */
    if (
      (isHostRuntime ||
        isOnDelegateRuntimeAndTargetHostSelectedWithValues ||
        isExecutionTargetRuntimeAndTargetHostSelectedWithValues) &&
      isEmpty(executionTarget?.host)
    ) {
      set(errors, 'spec.executionTarget.host', getString?.('fieldRequired', { field: getString('targetHost') }))
    }

    /* istanbul ignore else */
    if (
      (isConnectorRefRuntime ||
        isOnDelegateRuntimeAndTargetHostSelectedWithValues ||
        isExecutionTargetRuntimeAndTargetHostSelectedWithValues) &&
      isEmpty(executionTarget?.connectorRef)
    ) {
      set(
        errors,
        'spec.executionTarget.connectorRef',
        getString?.('fieldRequired', { field: getShellScriptConnectionLabel(getString, allValues?.spec?.shell) })
      )
    }

    /* istanbul ignore else */
    if (
      (isWorkingDirectoryRuntime ||
        isOnDelegateRuntimeAndTargetHostSelectedWithValues ||
        isExecutionTargetRuntimeAndTargetHostSelectedWithValues) &&
      isEmpty(executionTarget?.workingDirectory)
    ) {
      set(
        errors,
        'spec.executionTarget.workingDirectory',
        getString?.('fieldRequired', { field: getString('workingDirectory') })
      )
    }
    return errors
  }

  protected type = StepType.SHELLSCRIPT
  protected stepName = 'Shell Script'
  protected stepIcon: IconName = 'command-shell-script'
  protected stepIconColor = Color.GREY_700
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.SHELLSCRIPT'
  protected referenceId = 'shellScriptHelpPanel'
  protected isHarnessSpecific = false
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  protected defaultValues: ShellScriptData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.SHELLSCRIPT,
    spec: {
      shell: shellScriptType[0].value,
      // Set default value to {} to select On Delegate by default
      executionTarget: {},
      delegateSelectors: [],
      source: {
        type: 'Inline',
        spec: {
          script: ''
        }
      }
    }
  }

  /* istanbul ignore next */
  protected async getSecretsListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err) {
      logger.error('Error while parsing the yaml', err)
    }
    const { accountId } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.connectorRef', ''))
      if (obj) {
        const listOfSecrets = await listSecretsV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            includeSecretsFromEverySubScope: true,
            types: ['SecretText', 'SSHKey'],
            pageIndex: 0,
            pageSize: 10
          }
        }).then(response =>
          response?.data?.content?.map(connector => {
            return {
              label: getConnectorName(connector),
              insertText: getConnectorValue(connector),
              kind: CompletionItemKind.Field
            }
          })
        )
        return listOfSecrets || []
      }
    }

    return new Promise(resolve => {
      resolve([])
    })
  }

  processFormData(data: ShellScriptFormData): ShellScriptData {
    return processShellScriptFormData(data)
  }
}
