/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { v4 as uuid } from 'uuid'

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { isEmpty, isUndefined } from 'lodash-es'
import { ShellScriptStepInfo, ExecutionTarget } from 'services/pipeline-ng'
import { SecretDTOV2 } from 'services/cd-ng'
import { UseStringsReturn } from 'framework/strings'
import { isValueRuntimeInput } from '@modules/10-common/utils/utils'
import { ShellScriptData, ShellScriptFormData } from './shellScriptTypes'

export const getExecutionTargetValue = (
  executionTarget: ExecutionTarget | string = {},
  onDelegate: false | string = false
): ExecutionTarget | Record<string, never> | string => {
  // To make backward compatible, set default value to {} to select On Delegate by default
  const executionTargetDefaultValue = {}

  if (typeof executionTarget === 'string') {
    // To handle executionTarget as runtime field
    return isValueRuntimeInput(executionTarget) ? executionTarget : executionTargetDefaultValue
  } else if (typeof onDelegate === 'string') {
    // To handle executionTarget as runtime field
    return isValueRuntimeInput(onDelegate) ? RUNTIME_INPUT_VALUE : executionTargetDefaultValue
  } else {
    const { host = '', connectorRef = '', workingDirectory = '' } = executionTarget

    /*
     * Select On Delegate if
     * 1: onDelegate: true // To make changes backward compatible
     * 2: executionTarget: {}
     */
    return onDelegate || isEmpty(executionTarget)
      ? executionTargetDefaultValue
      : { host, connectorRef, workingDirectory }
  }
}

export const getInitialValues = (initialValues: ShellScriptData): ShellScriptFormData => {
  const initSpec = initialValues?.spec
  const modifiedData: ShellScriptFormData = {
    ...initialValues,
    spec: {
      ...initSpec,
      shell: initialValues.spec?.shell || 'Bash',
      executionTarget: getExecutionTargetValue(initSpec?.executionTarget, initSpec?.onDelegate),
      delegateSelectors: initSpec?.delegateSelectors || [],
      source: {
        ...(initSpec?.source || {})
      },

      environmentVariables: Array.isArray(initSpec?.environmentVariables)
        ? initSpec?.environmentVariables.map(variable => ({
            ...variable,
            id: uuid()
          }))
        : [],

      outputVariables: Array.isArray(initSpec?.outputVariables)
        ? initSpec?.outputVariables.map(variable => ({
            ...variable,
            id: uuid()
          }))
        : []
    }
  }

  // Delete onDelegate so that already created data also get fixed
  if (!isUndefined(modifiedData.spec?.onDelegate)) {
    delete modifiedData.spec.onDelegate
  }

  return modifiedData
}

export const getShellScriptSecretType = (
  shell?: ShellScriptStepInfo['shell']
): Exclude<SecretDTOV2['type'], 'SecretFile' | 'SecretText'> => (shell === 'PowerShell' ? 'WinRmCredentials' : 'SSHKey')

export const getShellScriptConnectionLabel = (
  getString: UseStringsReturn['getString'],
  shell?: ShellScriptStepInfo['shell']
): string => (shell === 'PowerShell' ? getString('platform.secrets.typeWinRM') : getString('sshConnector'))
