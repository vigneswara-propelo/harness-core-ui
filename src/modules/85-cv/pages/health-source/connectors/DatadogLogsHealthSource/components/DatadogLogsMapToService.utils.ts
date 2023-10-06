import { SelectOption } from '@harness/uicore'
import { DatadogLogsInfo } from '../DatadogLogsHealthSource.type'

export const getCanShowServiceInstanceNames = ({
  isConnectorRuntimeOrExpression,
  query,
  serviceInstanceIdentifierTag,
  isQueryRuntimeOrExpression,
  isServiceInstanceRuntimeOrExpression
}: {
  isConnectorRuntimeOrExpression?: boolean
  query?: string
  serviceInstanceIdentifierTag?: string | SelectOption
  isQueryRuntimeOrExpression?: boolean
  isServiceInstanceRuntimeOrExpression?: boolean
}): boolean => {
  if (
    isConnectorRuntimeOrExpression ||
    !query ||
    !serviceInstanceIdentifierTag ||
    isQueryRuntimeOrExpression ||
    isServiceInstanceRuntimeOrExpression
  ) {
    return false
  }

  return true
}

export const getServiceInstanceFieldValue = (
  fromValues?: DatadogLogsInfo,
  items?: SelectOption[]
): SelectOption | null => {
  const selectedValue = fromValues?.serviceInstanceIdentifierTag

  if (!selectedValue) {
    return null
  }

  if (selectedValue) {
    const selectedValueFromItems = items?.find(item => item.value === selectedValue)

    if (selectedValueFromItems) {
      return selectedValueFromItems
    } else if (typeof selectedValue !== 'undefined') {
      return {
        label: selectedValue as string,
        value: selectedValue as string
      }
    }
  }
  return null
}
