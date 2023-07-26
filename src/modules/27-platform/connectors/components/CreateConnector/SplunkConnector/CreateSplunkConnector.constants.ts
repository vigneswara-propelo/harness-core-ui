/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { SelectOption } from '@harness/uicore'
import { AuthTypes } from '@platform/connectors/pages/connectors/utils/ConnectorHelper'
import { UseStringsReturn } from 'framework/strings'

export const getAuthOptions = (getString: UseStringsReturn['getString']): SelectOption[] => [
  {
    label: getString('usernamePassword'),
    value: AuthTypes.USER_PASSWORD
  },
  {
    label: getString('platform.connectors.bearerToken'),
    value: AuthTypes.BEARER_TOKEN
  },
  {
    label: getString('platform.connectors.elk.noAuthentication'),
    value: AuthTypes.ANNONYMOUS
  }
]
