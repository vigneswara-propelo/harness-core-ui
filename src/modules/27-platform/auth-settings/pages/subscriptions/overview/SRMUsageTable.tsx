/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { SelectOption } from '@harness/uicore'
import type { ModuleLicenseDTO } from 'services/cd-ng'
import { useListSRMActiveMonitoredServices, ListSRMActiveMonitoredServicesQueryParams } from 'services/cv'
import { useUpdateQueryParams, useQueryParams, useMutateAsGet } from '@common/hooks'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { queryParamDecodeAll } from '@common/hooks/useQueryParams'
import type { ModuleName } from 'framework/types/ModuleName'
import { SRMServiceLicenseTable } from './SRMServiceLicenseTable'

interface SRMUsageTableProps {
  module: ModuleName
  licenseData?: ModuleLicenseDTO
}

interface SRMUsageTableProps {
  module: ModuleName
  licenseData?: ModuleLicenseDTO
}

const DEFAULT_PAGE_INDEX = 0
const DEFAULT_PAGE_SIZE = 20
type ProcessedActiveServiceListPageQueryParams = RequiredPick<
  ListSRMActiveMonitoredServicesQueryParams,
  'page' | 'size' | 'sort'
>
const queryParamOptions = {
  parseArrays: true,
  decoder: queryParamDecodeAll(),
  processQueryParams(params: ListSRMActiveMonitoredServicesQueryParams): ProcessedActiveServiceListPageQueryParams {
    return {
      ...params,
      page: params.page ?? DEFAULT_PAGE_INDEX,
      size: params.size ?? DEFAULT_PAGE_SIZE,
      sort: params.sort ?? []
    }
  }
}

const SRMUsageTable: React.FC<SRMUsageTableProps> = () => {
  const { updateQueryParams } = useUpdateQueryParams<Partial<ListSRMActiveMonitoredServicesQueryParams>>()
  const { accountId } = useParams<AccountPathProps>()
  const queryParams = useQueryParams<ListSRMActiveMonitoredServicesQueryParams>(queryParamOptions)
  const { page, size } = queryParams
  const [orgName, setOrgName] = useState<string>('')
  const [projName, setProjName] = useState<string>('')
  const [serviceName, setServiceName] = useState<string>('')

  const { data: activeServiceList, loading } = useMutateAsGet(useListSRMActiveMonitoredServices, {
    body: {
      orgIdentifier: orgName,
      projectIdentifier: projName,
      serviceIdentifier: serviceName
    },
    queryParams: {
      accountIdentifier: accountId,
      page,
      size
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  const updateFilters = (orgId?: SelectOption, projId?: SelectOption, serviceId?: SelectOption): void => {
    setOrgName(orgId?.value as string)
    setProjName(projId?.value as string)
    setServiceName(serviceId?.value as string)
  }
  return (
    <SRMServiceLicenseTable
      gotoPage={
        /* istanbul ignore next */
        pageNumber => updateQueryParams({ page: pageNumber })
      }
      data={activeServiceList || {}}
      updateFilters={updateFilters}
      servicesLoading={loading}
    />
  )
}

export default SRMUsageTable
