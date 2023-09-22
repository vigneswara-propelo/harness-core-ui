import { SelectOption } from '@harness/uicore'

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
