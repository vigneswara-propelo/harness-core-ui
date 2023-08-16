/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormData } from '@platform/connectors/interfaces/ConnectorInterface'
import { AuthTypes } from '@platform/connectors/pages/connectors/utils/ConnectorHelper'
import { UseStringsReturn } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { ElkConnectorAuthFieldsProps } from './CreateElkConnector.types'
import { ELKConnectorFields, ElkAuthType } from './CreateElkConnector.constants'

type InitializeElkConnectorArgs = {
  prevStepData?: ConnectorConfigDTO
  accountId: string
  projectIdentifier?: string
  orgIdentifier?: string
}

export function initializeElkConnector({
  prevStepData,
  accountId,
  projectIdentifier,
  orgIdentifier
}: InitializeElkConnectorArgs): FormData {
  const defaultObj = {
    url: '',
    accountId,
    username: '',
    authType: AuthTypes.USER_PASSWORD,
    password: undefined,
    projectIdentifier,
    orgIdentifier
  }

  if (!prevStepData) {
    return defaultObj
  }
  const { spec, ...prevData } = prevStepData
  return {
    ...defaultObj,
    url: prevData?.url || spec?.controllerUrl || spec?.url || '',
    password: prevData?.password || spec?.passwordRef,
    clientSecretRef: prevData?.clientSecretRef || spec?.clientSecretRef,
    authType: prevData?.authType || spec?.authType || AuthTypes.USER_PASSWORD,
    username: prevData?.username || spec?.username || '',
    clientId: prevData?.clientId || spec?.clientId,
    apiKeyId: prevData?.apiKeyId || spec?.apiKeyId,
    apiKeyRef: prevData?.apiKeyRef || spec?.apiKeyRef
  }
}

interface GetElkAuthTypeReturn {
  label: string
  value: string
}

export const getELKAuthType = (getString: UseStringsReturn['getString']): GetElkAuthTypeReturn[] => [
  {
    label: getString('usernamePassword'),
    value: AuthTypes.USER_PASSWORD
  },
  {
    label: getString('common.apikey'),
    value: AuthTypes.API_CLIENT_TOKEN
  },
  {
    label: getString('platform.connectors.bearerToken'),
    value: AuthTypes.BEARER_TOKEN
  },
  {
    label: getString('platform.connectors.elk.noAuthentication'),
    value: ElkAuthType.NONE
  }
]

export const getAuthFields = (
  getString: UseStringsReturn['getString'],
  authType?: string
): ElkConnectorAuthFieldsProps[] | null => {
  if (!authType) {
    return null
  }

  switch (authType) {
    case AuthTypes.USER_PASSWORD:
      return [
        { name: ELKConnectorFields.USERNAME, label: getString('username'), key: ELKConnectorFields.USERNAME },
        { name: ELKConnectorFields.PASSWORD, label: getString('password'), key: ELKConnectorFields.PASSWORD }
      ]

    case AuthTypes.API_CLIENT_TOKEN:
      return [
        {
          name: ELKConnectorFields.API_KEY_ID,
          label: getString('platform.connectors.elk.apiId'),
          key: ELKConnectorFields.API_KEY_ID
        },
        {
          name: ELKConnectorFields.API_KEY_REF,
          label: getString('common.apikey'),
          key: ELKConnectorFields.API_KEY_REF
        }
      ]

    case AuthTypes.BEARER_TOKEN:
      return [
        {
          name: ELKConnectorFields.API_KEY_REF,
          label: getString('platform.connectors.bearerToken'),
          key: ELKConnectorFields.API_KEY_REF
        }
      ]

    default:
      return null
  }
}
