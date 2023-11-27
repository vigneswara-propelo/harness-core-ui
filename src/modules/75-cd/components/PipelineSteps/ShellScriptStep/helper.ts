/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { v4 as uuid } from 'uuid'

import { ShellScriptStepInfo } from 'services/pipeline-ng'
import { SecretDTOV2 } from 'services/cd-ng'
import { UseStringsReturn } from 'framework/strings'
import { ShellScriptData, ShellScriptFormData } from './shellScriptTypes'

const getOnDelegateValue = (values: ShellScriptData): string | boolean => {
  return values.spec?.onDelegate !== '' ? values.spec?.onDelegate : true
}

export const getInitialValues = (initialValues: ShellScriptData): ShellScriptFormData => {
  const initSpec = initialValues?.spec
  return {
    ...initialValues,
    spec: {
      ...initSpec,
      shell: initialValues.spec?.shell || 'Bash',
      onDelegate: getOnDelegateValue(initialValues),
      delegateSelectors: initialValues.spec?.delegateSelectors || [],
      source: {
        ...(initSpec?.source || {})
      },

      environmentVariables: Array.isArray(initialValues.spec?.environmentVariables)
        ? initialValues.spec?.environmentVariables.map(variable => ({
            ...variable,
            id: uuid()
          }))
        : [],

      outputVariables: Array.isArray(initialValues.spec?.outputVariables)
        ? initialValues.spec?.outputVariables.map(variable => ({
            ...variable,
            id: uuid()
          }))
        : []
    }
  }
}

export const getShellScriptSecretType = (
  shell?: ShellScriptStepInfo['shell']
): Exclude<SecretDTOV2['type'], 'SecretFile' | 'SecretText'> => (shell === 'PowerShell' ? 'WinRmCredentials' : 'SSHKey')

export const getShellScriptConnectionLabel = (
  getString: UseStringsReturn['getString'],
  shell?: ShellScriptStepInfo['shell']
): string => (shell === 'PowerShell' ? getString('platform.secrets.typeWinRM') : getString('sshConnector'))
