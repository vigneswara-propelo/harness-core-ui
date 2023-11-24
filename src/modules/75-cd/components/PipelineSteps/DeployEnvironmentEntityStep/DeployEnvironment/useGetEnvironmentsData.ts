/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, isEqual, isNil } from 'lodash-es'

import { shouldShowError, useToaster } from '@harness/uicore'

import { useMutateAsGet } from '@common/hooks'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { yamlParse } from '@common/utils/YamlHelperMethods'

import useRBACError from '@rbac/utils/useRBACError/useRBACError'

import {
  EnvironmentYaml,
  Failure,
  useGetEnvironmentAccessList,
  useGetEnvironmentsInputYamlAndServiceOverrides,
  useGetEnvironmentsInputYamlAndServiceOverridesV2
} from 'services/cd-ng'

import { getScopedValueFromDTO, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getIdentifierFromScopedRef } from '@common/utils/utils'
import { StoreMetadata } from '@modules/10-common/constants/GitSyncTypes'
import { FeatureFlag } from '@modules/10-common/featureFlags'
import { useFeatureFlag } from '@modules/10-common/hooks/useFeatureFlag'
import type { EnvironmentData } from '../types'

export interface UseGetEnvironmentsDataProps {
  envIdentifiers: string[]
  environmentGitBranches?: Record<string, string | undefined>
  serviceIdentifiers: string[]
  envGroupIdentifier?: string
  parentStoreMetadata?: StoreMetadata
  showRemoteFetchError?: boolean
}

export interface UseGetEnvironmentsDataReturn {
  /** Contains list of environment config objects */
  environmentsList: EnvironmentYaml[]
  /** Contains list of environment objects with inputs */
  environmentsData: EnvironmentData[]
  remoteFetchError: Failure | undefined
  loadingEnvironmentsList: boolean
  loadingEnvironmentsData: boolean
  /** Used only for loading state while updating data */
  updatingEnvironmentsData: boolean
  refetchEnvironmentsList(): void
  refetchEnvironmentsData(): void
  /** Used to prepend data to `environmentsList` */
  prependEnvironmentToEnvironmentList(newEnvironmentInfo: EnvironmentYaml): void
  nonExistingEnvironmentIdentifiers: string[]
}

export function useGetEnvironmentsData({
  envIdentifiers,
  serviceIdentifiers,
  environmentGitBranches,
  envGroupIdentifier,
  parentStoreMetadata,
  showRemoteFetchError = false
}: UseGetEnvironmentsDataProps): UseGetEnvironmentsDataReturn {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  // State
  const [environmentsList, setEnvironmentsList] = useState<EnvironmentYaml[]>([])
  const [environmentsData, setEnvironmentsData] = useState<EnvironmentData[]>([])
  const [remoteFetchError, setRemoteFetchError] = useState<Failure | undefined>()
  const [nonExistingEnvironmentIdentifiers, setNonExistingEnvironmentIdentifiers] = useState<string[]>([])
  const isGitXEnabledForEnvironments = useFeatureFlag(FeatureFlag.CDS_ENV_GITX)

  const envGroupScope = getScopeFromValue(envGroupIdentifier as string)

  if (envGroupScope !== Scope.PROJECT) {
    envIdentifiers = envIdentifiers.map(envId => `${envGroupScope}.${envId}`)
  }

  const sortedEnvIdentifiers = useMemo(() => [...envIdentifiers].sort(), [envIdentifiers])

  const {
    data: environmentsListResponse,
    error: environmentsListError,
    loading: loadingEnvironmentsList,
    refetch: refetchEnvironmentsList
  } = useGetEnvironmentAccessList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      ...(Boolean(envGroupIdentifier) && { envGroupIdentifier })
    }
  })

  const {
    data: environmentsDataResponse,
    error: environmentsDataError,
    initLoading: loadingEnvironmentsData,
    loading: updatingEnvironmentsData,
    refetch: refetchEnvironmentsData
  } = useMutateAsGet(useGetEnvironmentsInputYamlAndServiceOverrides, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    body: {
      ...(envIdentifiers
        ? { envIdentifiers: sortedEnvIdentifiers }
        : { ...(envGroupIdentifier && { envGroupIdentifier }) }),
      serviceIdentifiers
    },
    lazy: !(envGroupIdentifier || sortedEnvIdentifiers.length) || isGitXEnabledForEnvironments
  })

  const {
    data: environmentsDataResponseV2,
    error: environmentsDataErrorV2,
    initLoading: loadingEnvironmentsDataV2,
    loading: updatingEnvironmentsDataV2,
    refetch: refetchEnvironmentsDataV2
  } = useMutateAsGet(useGetEnvironmentsInputYamlAndServiceOverridesV2, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      parentEntityConnectorRef: parentStoreMetadata?.connectorRef,
      parentEntityRepoName: parentStoreMetadata?.repoName,
      branch: parentStoreMetadata?.branch
    },
    body: {
      ...(envIdentifiers
        ? {
            entityWithGitInfoList: sortedEnvIdentifiers.map(id => {
              return { ref: id, ...(environmentGitBranches?.[id] ? { branch: environmentGitBranches[id] } : {}) }
            })
          }
        : { ...(envGroupIdentifier && { envGroupIdentifier }) }),
      serviceIdentifiers
    },
    headers: { 'Load-From-Cache': 'true' },
    lazy: !(envGroupIdentifier || sortedEnvIdentifiers.length) || !isGitXEnabledForEnvironments
  })

  const loading = loadingEnvironmentsList || loadingEnvironmentsData || loadingEnvironmentsDataV2

  useEffect(() => {
    if (!loading) {
      let _environmentsList: EnvironmentYaml[] = []
      let _environmentsData: EnvironmentData[] = []

      /* istanbul ignore else */
      if (environmentsListResponse?.data?.length) {
        _environmentsList = environmentsListResponse.data.map(environmentResponse => ({
          name: defaultTo(environmentResponse.environment?.name, ''),
          identifier: defaultTo(environmentResponse.environment?.identifier, ''),
          description: environmentResponse.environment?.description,
          tags: environmentResponse.environment?.tags,
          type: defaultTo(environmentResponse.environment?.type, 'PreProduction'),
          yaml: environmentResponse.environment?.yaml,
          orgIdentifier: environmentResponse.environment?.orgIdentifier,
          projectIdentifier: environmentResponse.environment?.projectIdentifier
        }))
      }
      if (
        (environmentsDataErrorV2?.data as Failure)?.status === 'ERROR' &&
        (environmentsDataErrorV2?.data as Failure)?.code === 'HINT' &&
        showRemoteFetchError
      ) {
        setRemoteFetchError(environmentsDataErrorV2?.data as Failure)
      } else {
        setRemoteFetchError(undefined)
      }

      const environmentsAndServiceOverridesInResponse = defaultTo(
        isGitXEnabledForEnvironments
          ? environmentsDataResponseV2?.data?.environmentsInputYamlAndServiceOverrides
          : environmentsDataResponse?.data?.environmentsInputYamlAndServiceOverrides,
        []
      )

      const yamlMetadataList = environmentsAndServiceOverridesInResponse.map(environmentInResponse => {
        return {
          environmentIdentifier: environmentInResponse.envRef,
          environmentYaml: environmentInResponse.envYaml,
          environmentRuntimeTemplateYaml: environmentInResponse.envRuntimeInputYaml,
          serviceOverrideList: environmentInResponse.servicesOverrides,
          storeType: environmentInResponse.storeType,
          connectorRef: environmentInResponse.connectorRef,
          entityGitDetails: environmentInResponse.entityGitDetails
        }
      })

      if (yamlMetadataList?.length) {
        _environmentsData = yamlMetadataList.map(row => {
          const environmentYaml = defaultTo(row.environmentYaml, '{}')
          const environment = yamlParse<Pick<EnvironmentData, 'environment'>>(environmentYaml).environment
          environment.yaml = environmentYaml
          const environmentInputs = yamlParse<Pick<EnvironmentData, 'environmentInputs'>>(
            defaultTo(row.environmentRuntimeTemplateYaml, '{}')
          ).environmentInputs

          const { storeType, connectorRef, entityGitDetails = {} } = row
          /* istanbul ignore else */
          if (environment) {
            const existsInList = _environmentsList.find(
              env => env.identifier === getIdentifierFromScopedRef(row.environmentIdentifier as string)
            )

            if (!existsInList) {
              _environmentsList.unshift(environment)
            }
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const serviceOverrideInputs: Record<string, any> = {}

          row.serviceOverrideList?.forEach(serviceOverrideInList => {
            const serviceOverridesYamlValue = yamlParse<Pick<EnvironmentData, 'serviceOverrideInputs'>>(
              defaultTo(serviceOverrideInList.serviceOverridesYaml, '{}')
            ).serviceOverrideInputs

            if (!isNil(serviceOverridesYamlValue)) {
              serviceOverrideInputs[serviceOverrideInList.serviceRef as string] = serviceOverridesYamlValue
            }
          })

          return {
            environment,
            environmentInputs,
            storeType,
            connectorRef,
            entityGitDetails,
            serviceOverrideInputs: {
              [getScopedValueFromDTO(environment)]: serviceOverrideInputs
            }
          }
        })
      }

      if (!isEqual(_environmentsList, environmentsList)) {
        setEnvironmentsList(_environmentsList)
      }

      _environmentsData.sort((envData1, envData2) => {
        const id1 = envData1.environment.identifier
        const id2 = envData2.environment.identifier

        const index1 = envIdentifiers.indexOf(id1)
        const index2 = envIdentifiers.indexOf(id2)

        return index1 - index2
      })
      if (!isEqual(_environmentsData, environmentsData)) {
        setEnvironmentsData(_environmentsData)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loading,
    environmentsListResponse?.data,
    environmentsDataResponse?.data?.environmentsInputYamlAndServiceOverrides,
    environmentsDataResponseV2?.data?.environmentsInputYamlAndServiceOverrides,
    sortedEnvIdentifiers,
    environmentsDataErrorV2
  ])

  useEffect(() => {
    if (!loading) {
      let _environmentsData: EnvironmentData[] = []
      const environmentsAndServiceOverridesInResponse = defaultTo(
        isGitXEnabledForEnvironments
          ? environmentsDataResponseV2?.data?.environmentsInputYamlAndServiceOverrides
          : environmentsDataResponse?.data?.environmentsInputYamlAndServiceOverrides,
        []
      )

      const yamlMetadataList = environmentsAndServiceOverridesInResponse.map(environmentInResponse => {
        return {
          environmentIdentifier: environmentInResponse.envRef,
          environmentYaml: environmentInResponse.envYaml,
          environmentRuntimeTemplateYaml: environmentInResponse.envRuntimeInputYaml,
          serviceOverrideList: environmentInResponse.servicesOverrides,
          storeType: environmentInResponse.storeType,
          connectorRef: environmentInResponse.connectorRef,
          entityGitDetails: environmentInResponse.entityGitDetails
        }
      })
      if (
        (environmentsDataErrorV2?.data as Failure)?.status === 'ERROR' &&
        (environmentsDataErrorV2?.data as Failure)?.code === 'HINT' &&
        showRemoteFetchError
      ) {
        setRemoteFetchError(environmentsDataErrorV2?.data as Failure)
      } else {
        setRemoteFetchError(undefined)
      }

      if (yamlMetadataList?.length) {
        _environmentsData = yamlMetadataList.map(row => {
          const environmentYaml = defaultTo(row.environmentYaml, '{}')
          const environment = yamlParse<Pick<EnvironmentData, 'environment'>>(environmentYaml).environment
          environment.yaml = environmentYaml
          const environmentInputs = yamlParse<Pick<EnvironmentData, 'environmentInputs'>>(
            defaultTo(row.environmentRuntimeTemplateYaml, '{}')
          ).environmentInputs
          const { storeType, connectorRef, entityGitDetails = {} } = row
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const serviceOverrideInputs: Record<string, any> = {}

          row.serviceOverrideList?.forEach(serviceOverrideInList => {
            const serviceOverridesYamlValue = yamlParse<Pick<EnvironmentData, 'serviceOverrideInputs'>>(
              defaultTo(serviceOverrideInList.serviceOverridesYaml, '{}')
            ).serviceOverrideInputs

            if (!isNil(serviceOverridesYamlValue)) {
              serviceOverrideInputs[serviceOverrideInList.serviceRef as string] = serviceOverridesYamlValue
            }
          })

          return {
            environment,
            environmentInputs,
            storeType,
            connectorRef,
            entityGitDetails,
            serviceOverrideInputs: {
              [getScopedValueFromDTO(environment)]: serviceOverrideInputs
            }
          }
        })
      }

      const environmentListIdentifiers = _environmentsData.map(envInList =>
        getScopedValueFromDTO(envInList.environment)
      )
      const _nonExistingEnvironmentIdentifiers = envIdentifiers.filter(
        envInList => environmentListIdentifiers.indexOf(envInList) === -1
      )
      if (
        !isEqual(_nonExistingEnvironmentIdentifiers, nonExistingEnvironmentIdentifiers) &&
        _environmentsData.length > 0
      ) {
        setNonExistingEnvironmentIdentifiers(_nonExistingEnvironmentIdentifiers)
      }
    }
  }, [
    loading,
    environmentsListResponse?.data,
    environmentsDataResponse?.data?.environmentsInputYamlAndServiceOverrides,
    environmentsDataResponseV2?.data?.environmentsInputYamlAndServiceOverrides,
    environmentsDataErrorV2
  ])

  useEffect(() => {
    /* istanbul ignore else */
    if (environmentsListError?.message) {
      /* istanbul ignore else */
      if (shouldShowError(environmentsListError)) {
        showError(getRBACErrorMessage(environmentsListError))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentsListError])

  useEffect(() => {
    /* istanbul ignore else */
    if (environmentsDataError?.message) {
      /* istanbul ignore else */
      if (shouldShowError(environmentsDataError)) {
        showError(getRBACErrorMessage(environmentsDataError))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentsDataError])

  useEffect(() => {
    if (
      environmentsDataErrorV2?.message &&
      (!(
        (environmentsDataErrorV2?.data as Failure)?.status === 'ERROR' &&
        (environmentsDataErrorV2?.data as Failure)?.code === 'HINT'
      ) ||
        !showRemoteFetchError)
    ) {
      if (shouldShowError(environmentsDataErrorV2)) {
        showError(getRBACErrorMessage(environmentsDataErrorV2))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentsDataErrorV2])

  const prependEnvironmentToEnvironmentList = useCallback((newEnvironmentInfo: EnvironmentYaml) => {
    setEnvironmentsList(previousEnvironmentsList => [newEnvironmentInfo, ...(previousEnvironmentsList || [])])
  }, [])

  return {
    environmentsList,
    environmentsData,
    remoteFetchError,
    loadingEnvironmentsList,
    loadingEnvironmentsData: loadingEnvironmentsData || loadingEnvironmentsDataV2,
    updatingEnvironmentsData: updatingEnvironmentsData || updatingEnvironmentsDataV2,
    refetchEnvironmentsList,
    refetchEnvironmentsData: isGitXEnabledForEnvironments ? refetchEnvironmentsDataV2 : refetchEnvironmentsData,
    prependEnvironmentToEnvironmentList,
    nonExistingEnvironmentIdentifiers
  }
}
