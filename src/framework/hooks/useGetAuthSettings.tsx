/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useParams } from 'react-router-dom'
import { GetDataError, UseGetProps } from 'restful-react'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  GetAuthenticationSettingsQueryParams,
  RestResponseAuthenticationSettingsResponse,
  useGetAuthenticationSettings,
  useGetAuthenticationSettingsV2
} from 'services/cd-ng'

export interface UseGetAuthSettingsReturnValues {
  authSettings: RestResponseAuthenticationSettingsResponse | null
  refetchAuthSettings: (
    options?:
      | Partial<
          Omit<
            UseGetProps<
              RestResponseAuthenticationSettingsResponse,
              unknown,
              GetAuthenticationSettingsQueryParams,
              unknown
            >,
            'lazy'
          >
        >
      | undefined
  ) => Promise<void>
  fetchingAuthSettings: boolean
  errorWhileFetchingAuthSettings: GetDataError<unknown> | null
}
export function useGetAuthSettings(): UseGetAuthSettingsReturnValues {
  const { PL_ENABLE_MULTIPLE_IDP_SUPPORT } = useFeatureFlags()
  const { accountId } = useParams<AccountPathProps>()

  const {
    data: authSettingsV1,
    loading: fetchingAuthSettingsV1,
    error: errorWhileFetchingAuthSettingsV1,
    refetch: refetchAuthSettingsV1
  } = useGetAuthenticationSettings({
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })

  const {
    data: authSettingsV2,
    loading: fetchingAuthSettingsV2,
    error: errorWhileFetchingAuthSettingsV2,
    refetch: refetchAuthSettingsV2
  } = useGetAuthenticationSettingsV2({
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })

  const data = PL_ENABLE_MULTIPLE_IDP_SUPPORT ? authSettingsV2 : authSettingsV1
  const fetchingAuthSettings = PL_ENABLE_MULTIPLE_IDP_SUPPORT ? fetchingAuthSettingsV2 : fetchingAuthSettingsV1
  const refetchAuthSettings = PL_ENABLE_MULTIPLE_IDP_SUPPORT ? refetchAuthSettingsV2 : refetchAuthSettingsV1
  const errorWhileFetchingAuthSettings = PL_ENABLE_MULTIPLE_IDP_SUPPORT
    ? errorWhileFetchingAuthSettingsV2
    : errorWhileFetchingAuthSettingsV1

  return {
    authSettings: data,
    refetchAuthSettings,
    fetchingAuthSettings,
    errorWhileFetchingAuthSettings
  }
}
