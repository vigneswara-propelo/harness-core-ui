import { SelectOption } from '@harness/uicore'
import { AuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { UseStringsReturn } from 'framework/strings'

export const getAuthOptions = (getString: UseStringsReturn['getString']): SelectOption[] => [
  {
    label: getString('usernamePassword'),
    value: AuthTypes.USER_PASSWORD
  },
  {
    label: getString('connectors.bearerToken'),
    value: AuthTypes.BEARER_TOKEN
  }
]
