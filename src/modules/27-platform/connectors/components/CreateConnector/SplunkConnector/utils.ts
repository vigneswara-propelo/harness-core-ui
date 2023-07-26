/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormData } from '@platform/connectors/interfaces/ConnectorInterface'
import { AuthTypes } from '@platform/connectors/pages/connectors/utils/ConnectorHelper'
import type { ConnectorConfigDTO } from 'services/cd-ng'

type InitializeSplunkConnectorArgs = {
  prevStepData?: ConnectorConfigDTO
  accountId: string
  projectIdentifier?: string
  orgIdentifier?: string
}

export function initializeSplunkConnector({
  prevStepData,
  projectIdentifier,
  accountId,
  orgIdentifier
}: InitializeSplunkConnectorArgs): FormData {
  const defaultObj = {
    url: '',
    authType: AuthTypes.USER_PASSWORD,
    username: '',
    passwordRef: undefined,
    tokenRef: undefined,
    accountId: accountId,
    projectIdentifier,
    orgIdentifier
  }

  if (!prevStepData) {
    return defaultObj
  }

  const { spec, ...prevData } = prevStepData
  return {
    ...defaultObj,
    url: prevData?.url || spec?.splunkUrl || '',
    username: prevData?.username || spec?.username,
    passwordRef: prevData?.passwordRef || spec?.passwordRef,
    authType: prevData?.authType || spec?.type || defaultObj.authType,
    tokenRef: prevData?.tokenRef || spec?.tokenRef
  }
}
