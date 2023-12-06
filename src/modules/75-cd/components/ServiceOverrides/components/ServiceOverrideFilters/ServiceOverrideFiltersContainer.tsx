/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, pick } from 'lodash-es'

import { SelectOption, MultiSelectOption, Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  EnvironmentResponseDTO,
  EnvironmentResponse,
  ServiceResponse,
  ServiceResponseDTO,
  useGetInfrastructureAccessList,
  InfrastructureResponse,
  InfrastructureResponseDTO,
  useGetEnvironmentAccessListV2,
  useGetServiceAccessList
} from 'services/cd-ng'

import { useBooleanStatus, useMutateAsGet, useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { isObjectEmpty, removeNullAndEmpty, flattenObject } from '@common/components/Filter/utils/FilterUtils'

import { usePageQueryParamOptions, PageQueryParamsWithDefaults } from '@common/constants/Pagination'
import { ServiceOverrideFilterSelector } from '@cd/components/ServiceOverrides/components/ServiceOverrideFilters/ServiceOverrideFilterSelector'
import { ServiceOverrideFilter } from '@cd/components/ServiceOverrides/components/ServiceOverrideFilters/ServiceOverrideFilter'
import { getScopedValueFromDTO } from '@common/components/EntityReference/EntityReference.types'
import {
  ServiceOverridesFilterFormType,
  getMultiSelectFromOptions,
  ServiceOverridesPageQueryParams,
  getSanitizedFilter,
  getInfraMultiSelectFromOptions
} from './filterUtils'

export default function ServiceOverrideFiltersContainer(): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { state: isFiltersDrawerOpen, open: openFilterDrawer, close: hideFilterDrawer } = useBooleanStatus()
  const { getString } = useStrings()
  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<Partial<ServiceOverridesPageQueryParams>>()
  const queryParamOptions = usePageQueryParamOptions()
  const queryParams = useQueryParams<PageQueryParamsWithDefaults>(queryParamOptions)

  const { data: environmentsResponse } = useMutateAsGet(useGetEnvironmentAccessListV2, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      includeAllAccessibleAtScope: true
    },
    body: {
      filterType: 'Environment'
    }
  })

  const { data: serviceList } = useGetServiceAccessList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      includeAllServicesAccessibleAtScope: true
    }
  })

  const { data: infrastructureList } = useGetInfrastructureAccessList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const sanitizedAppliedFilter = React.useMemo(
    () => getSanitizedFilter(queryParams.filters as ServiceOverridesPageQueryParams['filters']),
    [queryParams.filters]
  )

  const { environmentIdentifiers, serviceIdentifiers, infraIdentifiers } = sanitizedAppliedFilter

  const fieldToLabelMapping = React.useMemo(
    () =>
      new Map<string, string>([
        ['environmentIdentifiers', getString('environments')],
        ['serviceIdentifiers', getString('services')],
        ['infraIdentifiers', getString('common.infrastructures')]
      ]),
    [getString]
  )

  const filterWithValidFields = removeNullAndEmpty(
    pick(flattenObject(sanitizedAppliedFilter || {}), ...fieldToLabelMapping.keys())
  )

  const onApply = (inputFormData: ServiceOverridesFilterFormType): void => {
    if (!isObjectEmpty(inputFormData)) {
      const filterFromFormData = {
        ...(inputFormData.environments?.length && {
          environmentIdentifiers: inputFormData.environments?.map((env: MultiSelectOption) => env?.value) as string[]
        }),
        ...(inputFormData.services?.length && {
          serviceIdentifiers: inputFormData.services?.map((svc: MultiSelectOption) => svc?.value) as string[]
        }),
        ...(inputFormData.infrastructures?.length && {
          infraIdentifiers: inputFormData.infrastructures?.map((infra: MultiSelectOption) => infra?.value) as string[]
        })
      }
      updateQueryParams({ page: undefined, filterIdentifier: undefined, filters: filterFromFormData })
      hideFilterDrawer()
    } else {
      updateQueryParams({ page: undefined, filterIdentifier: undefined, filters: undefined })
      hideFilterDrawer()
    }
  }

  const reset = (): void => {
    replaceQueryParams({})
  }

  const environmentSelectOptions = React.useMemo(() => {
    const envList = environmentsResponse?.data?.map((envDetails: EnvironmentResponse) =>
      getScopedValueFromDTO(defaultTo(envDetails.environment, {}))
    ) as EnvironmentResponseDTO[]

    return getMultiSelectFromOptions<EnvironmentResponseDTO>(envList) as SelectOption[]
  }, [environmentsResponse?.data])

  const serviceSelectOptions = React.useMemo(() => {
    const svcList = serviceList?.data?.map((svcDetails: ServiceResponse) =>
      getScopedValueFromDTO(defaultTo(svcDetails.service, {}))
    ) as ServiceResponseDTO[]

    return getMultiSelectFromOptions<ServiceResponseDTO>(svcList) as SelectOption[]
  }, [serviceList?.data])

  const infrastructureSelectOptions = React.useMemo(() => {
    const infraList = infrastructureList?.data?.map(
      (infraDetails: InfrastructureResponse) => infraDetails.infrastructure
    ) as InfrastructureResponseDTO[]

    return getInfraMultiSelectFromOptions<InfrastructureResponseDTO>(infraList) as SelectOption[]
  }, [infrastructureList?.data])

  return (
    <Layout.Horizontal padding={{ left: 'medium', right: 'large' }}>
      <ServiceOverrideFilterSelector
        onFilterBtnClick={openFilterDrawer}
        fieldToLabelMapping={fieldToLabelMapping}
        filterWithValidFields={filterWithValidFields}
      />
      <ServiceOverrideFilter
        isOpen={isFiltersDrawerOpen}
        environments={environmentSelectOptions}
        services={serviceSelectOptions}
        infrastructures={infrastructureSelectOptions}
        initialFilter={{
          formValues: {
            environments: getMultiSelectFromOptions(environmentIdentifiers),
            services: getMultiSelectFromOptions(serviceIdentifiers),
            infrastructures: getMultiSelectFromOptions(infraIdentifiers)
          }
        }}
        onApply={onApply}
        onClose={() => hideFilterDrawer()}
        onClear={reset}
      />
    </Layout.Horizontal>
  )
}
