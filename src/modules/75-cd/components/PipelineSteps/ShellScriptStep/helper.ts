import { v4 as uuid } from 'uuid'

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
