/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { defaultTo, isEqual, set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useToaster, shouldShowError } from '@harness/uicore'
import { getScopedValueFromDTO } from '@common/components/EntityReference/EntityReference.types'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import type { DeploymentMetaData, Failure, ServiceDefinition, ServiceYaml } from 'services/cd-ng'
import {
  useGetServiceAccessListQuery,
  useGetServicesYamlAndRuntimeInputsQuery,
  useGetServicesYamlAndRuntimeInputsV2Query
} from 'services/cd-ng-rq'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { StoreMetadata } from '@common/constants/GitSyncTypes'
import type { ServiceData } from './DeployServiceEntityUtils'

export interface UseGetServicesDataProps {
  deploymentType: ServiceDefinition['type']
  gitOpsEnabled?: boolean
  deploymentMetadata?: DeploymentMetaData
  parentStoreMetadata?: StoreMetadata
  serviceIdentifiers: string[]
  serviceGitBranches?: Record<string, string | undefined>
  deploymentTemplateIdentifier?: string
  versionLabel?: string
  lazyService?: boolean
}

export interface UseGetServicesDataReturn {
  servicesList: ServiceYaml[]
  servicesData: ServiceData[]
  remoteFetchError: Failure | undefined
  loadingServicesList: boolean
  updatingData: boolean
  loadingServicesData: boolean
  refetchServicesData(): void
  refetchListData(): void
  prependServiceToServiceList(newServiceInfo: ServiceYaml): void
  nonExistingServiceIdentifiers: string[]
}
// react-query staleTime
const STALE_TIME = 60 * 1000 * 15

export function useGetServicesData(props: UseGetServicesDataProps): UseGetServicesDataReturn {
  const {
    deploymentType,
    gitOpsEnabled,
    serviceIdentifiers,
    serviceGitBranches,
    deploymentTemplateIdentifier,
    versionLabel,
    lazyService,
    deploymentMetadata,
    parentStoreMetadata
  } = props

  const [servicesList, setServicesList] = useState<ServiceYaml[]>([])
  const [servicesData, setServicesData] = useState<ServiceData[]>([])
  const [remoteFetchError, setRemoteFetchError] = useState<Failure | undefined>()
  const [nonExistingServiceIdentifiers, setNonExistingServiceIdentifiers] = useState<string[]>([])
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const isGitXEnabledForServices = useFeatureFlag(FeatureFlag.CDS_SERVICE_GITX)

  const {
    data: servicesListResponse,
    error,
    isInitialLoading: loadingServicesList,
    refetch: refetchListData
  } = useGetServiceAccessListQuery(
    {
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        type: deploymentType as ServiceDefinition['type'],
        gitOpsEnabled,
        deploymentTemplateIdentifier,
        versionLabel,
        deploymentMetadataYaml: deploymentMetadata ? yamlStringify(deploymentMetadata) : undefined
      }
    },
    {
      staleTime: STALE_TIME,
      enabled: !lazyService
    }
  )

  const sortedServiceIdentifiers = useMemo(() => [...serviceIdentifiers].sort(), [serviceIdentifiers])

  const {
    data: servicesDataResponse,
    isInitialLoading: loadingServicesData,
    isFetching: updatingData,
    refetch: refetchServicesData
  } = useGetServicesYamlAndRuntimeInputsQuery(
    {
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      body: { serviceIdentifiers: sortedServiceIdentifiers }
    },
    {
      enabled: !lazyService && !isGitXEnabledForServices && sortedServiceIdentifiers.length > 0,
      staleTime: STALE_TIME
    }
  )

  const {
    data: servicesDataResponseV2,
    error: serviceFetchError,
    isInitialLoading: loadingServicesDataV2,
    isFetching: updatingDataV2,
    refetch: refetchServicesDataV2
  } = useGetServicesYamlAndRuntimeInputsV2Query(
    {
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        parentEntityConnectorRef: parentStoreMetadata?.connectorRef,
        parentEntityRepoName: parentStoreMetadata?.repoName,
        branch: parentStoreMetadata?.branch
      },
      body: {
        serviceWithGitInfoList: sortedServiceIdentifiers.map(id => {
          return { ref: id, ...(serviceGitBranches?.[id] ? { branch: serviceGitBranches[id] } : {}) }
        })
      },
      headers: { 'Load-From-Cache': 'true' }
    },
    {
      enabled: !lazyService && isGitXEnabledForServices && sortedServiceIdentifiers.length > 0,
      staleTime: STALE_TIME,
      retry(failureCount) {
        return failureCount < 1
      }
    }
  )

  const loading = loadingServicesList || (isGitXEnabledForServices ? loadingServicesDataV2 : loadingServicesData)

  const prependServiceToServiceList = useCallback((newServiceInfo: ServiceYaml) => {
    setServicesList(data => [newServiceInfo, ...(data || [])])
  }, [])

  useEffect(() => {
    if (!loading) {
      let _servicesList: ServiceYaml[] = []
      let _servicesData: ServiceData[] = []

      /* istanbul ignore else */
      if (servicesListResponse?.data?.length) {
        _servicesList = servicesListResponse.data.map(service => ({
          identifier: defaultTo(service.service?.identifier, ''),
          name: defaultTo(service.service?.name, ''),
          description: service.service?.description,
          tags: service.service?.tags
        }))
      }

      if (serviceFetchError?.status === 'ERROR' && serviceFetchError?.code === 'HINT') {
        setRemoteFetchError(serviceFetchError)
      } else {
        setRemoteFetchError(undefined)
      }

      const serviceV2YamlMetadataList = isGitXEnabledForServices
        ? servicesDataResponseV2?.data?.serviceV2YamlMetadataList
        : servicesDataResponse?.data?.serviceV2YamlMetadataList

      if (serviceV2YamlMetadataList?.length) {
        _servicesData = serviceV2YamlMetadataList.map(row => {
          const serviceYaml = defaultTo(row.serviceYaml, '{}')
          const service = yamlParse<Pick<ServiceData, 'service'>>(serviceYaml).service
          const { storeType, connectorRef, entityGitDetails = {} } = row
          service.yaml = serviceYaml
          set(service, 'orgIdentifier', row.orgIdentifier)
          set(service, 'projectIdentifier', row.projectIdentifier)
          const serviceInputs = yamlParse<Pick<ServiceData, 'serviceInputs'>>(
            defaultTo(row.inputSetTemplateYaml, '{}')
          ).serviceInputs

          /* istanbul ignore else */
          if (service) {
            const existsInList = _servicesList.find(svc => svc.identifier === row.serviceIdentifier)

            if (!existsInList) {
              _servicesList.unshift(service)
            }
          }

          return { service, serviceInputs, storeType, connectorRef, entityGitDetails }
        })
      }

      if (!isEqual(_servicesList, servicesList)) {
        setServicesList(_servicesList)
      }

      _servicesData.sort((serviceData1, serviceData2) => {
        const id1 = serviceData1.service.identifier
        const id2 = serviceData2.service.identifier

        const index1 = serviceIdentifiers.indexOf(id1)
        const index2 = serviceIdentifiers.indexOf(id2)

        return index1 - index2
      })
      if (!isEqual(_servicesData, servicesData)) {
        setServicesData(_servicesData)
      }

      const serviceListIdentifiers = _servicesData.map(svcInList => getScopedValueFromDTO(svcInList.service))
      const _nonExistingServiceIdentifiers = serviceIdentifiers.filter(
        svcInList => serviceListIdentifiers.indexOf(svcInList) === -1
      )
      if (!isEqual(_nonExistingServiceIdentifiers, nonExistingServiceIdentifiers) && !lazyService) {
        setNonExistingServiceIdentifiers(_nonExistingServiceIdentifiers)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loading,
    servicesListResponse?.data,
    servicesDataResponse?.data?.serviceV2YamlMetadataList,
    servicesDataResponseV2?.data?.serviceV2YamlMetadataList,
    sortedServiceIdentifiers,
    serviceFetchError
  ])

  useEffect(() => {
    /* istanbul ignore else */
    if (error?.message) {
      if (shouldShowError(error)) {
        showError(getRBACErrorMessage(error as any))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  return {
    servicesData,
    servicesList,
    remoteFetchError,
    updatingData: isGitXEnabledForServices ? updatingDataV2 : updatingData,
    loadingServicesData: isGitXEnabledForServices ? loadingServicesDataV2 : loadingServicesData,
    loadingServicesList,
    refetchServicesData: isGitXEnabledForServices ? refetchServicesDataV2 : refetchServicesData,
    refetchListData,
    prependServiceToServiceList,
    nonExistingServiceIdentifiers
  }
}
