/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { cloneDeep, defaultTo, isEmpty, noop, omit } from 'lodash-es'

import { PageSpinner, useToaster } from '@harness/uicore'
import {
  PageServiceOverridesResponseDTOV2,
  useDeleteServiceOverrideV2,
  useGetServiceOverrideListV3,
  useUpdateServiceOverrideV2,
  useUpsertServiceOverrideV2
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import type { ProjectPathProps, RequiredField } from '@common/interfaces/RouteInterfaces'
import {
  getSanitizedFilter,
  ServiceOverridesPageQueryParams
} from '@cd/components/ServiceOverrides/components/ServiceOverrideFilters/filterUtils'
import { useRbacQueryParamOptions } from '@rbac/utils/utils'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import { PageQueryParamsWithDefaults } from '@common/constants/Pagination'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type {
  ServiceOverrideRowFormState,
  ServiceOverrideRowProps,
  ServiceOverridesResponseDTOV2
} from '@cd/components/ServiceOverrides/ServiceOverridesUtils'
import {
  formDeleteOverrideResponseSpec,
  formListRowItems,
  formUpdateOverrideResponseSpec,
  shouldDeleteOverrideCompletely
} from './ServiceOverrideContextUtils'

interface ServiceOverridesContextInterface {
  canCreateNew: boolean
  setCanCreateNewOrEdit: React.Dispatch<React.SetStateAction<boolean>>
  serviceOverrideType: Required<ServiceOverridesResponseDTOV2>['type']
  handleNewOverride(): void
  onAdd(values: ServiceOverrideRowFormState): void
  onClone(rowIndex: number): void
  onEdit(rowIndex: number): void
  onUpdate(rowIndex: number, values: RequiredField<ServiceOverrideRowFormState, 'environmentRef'>): void
  onDelete(rowIndex: number): void
  onDiscard(): void
  listRowItems: ServiceOverrideRowProps[]
  serviceOverrideResponse?: PageServiceOverridesResponseDTOV2
  loadingServiceOverrideData?: boolean
}

interface ServiceOverridesProviderProps {
  serviceOverrideType: Required<ServiceOverridesResponseDTOV2>['type']
}

const ServiceOverridesContext = createContext<ServiceOverridesContextInterface>({
  serviceOverrideType: 'ENV_GLOBAL_OVERRIDE',
  handleNewOverride: noop,
  canCreateNew: true,
  setCanCreateNewOrEdit: noop,
  onAdd: noop,
  onClone: noop,
  onEdit: noop,
  onUpdate: noop,
  onDelete: noop,
  onDiscard: noop,
  listRowItems: [],
  loadingServiceOverrideData: false
})

export function ServiceOverridesProvider({
  children,
  serviceOverrideType
}: React.PropsWithChildren<ServiceOverridesProviderProps>): React.ReactElement {
  const { getString } = useStrings()
  const { showSuccess, showError, showWarning } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const queryParamOptions = useRbacQueryParamOptions()
  const queryParams = useQueryParams<PageQueryParamsWithDefaults>(queryParamOptions)
  const { page, size } = queryParams

  const commonQueryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      size,
      page
    }),
    [accountId, orgIdentifier, projectIdentifier, page, size]
  )

  const [canCreateNew, setCanCreateNewOrEdit] = useState(true)
  const [listRowItems, setListRowItems] = useState<ServiceOverrideRowProps[]>([])
  const [serviceOverrideResponse, setServiceOverrideResponse] = useState<PageServiceOverridesResponseDTOV2>({})

  const sanitizedAppliedFilter = React.useMemo(
    () => getSanitizedFilter(queryParams.filters as ServiceOverridesPageQueryParams['filters']),
    [queryParams.filters]
  )

  const { environmentIdentifiers, serviceIdentifiers, infraIdentifiers } = sanitizedAppliedFilter

  const svcOverridesRequestBody = React.useMemo(
    () =>
      !isEmpty(sanitizedAppliedFilter)
        ? {
            serviceRefs: defaultTo(serviceIdentifiers, []),
            environmentRefs: defaultTo(environmentIdentifiers, []),
            infraIdentifiers: defaultTo(infraIdentifiers, []),
            filterType: 'Override'
          }
        : null,
    [serviceIdentifiers, environmentIdentifiers, infraIdentifiers, sanitizedAppliedFilter]
  )

  const {
    data,
    loading: loadingServiceOverridesList,
    refetch: refetchServiceOverridesList
  } = useMutateAsGet(useGetServiceOverrideListV3, {
    queryParams: {
      ...commonQueryParams,
      type: serviceOverrideType
    },
    body: svcOverridesRequestBody
  })

  useEffect(() => {
    if (!loadingServiceOverridesList) {
      const svcOverridesList = defaultTo(data?.data?.content, []) as ServiceOverridesResponseDTOV2[]
      setListRowItems(formListRowItems(svcOverridesList))
      setServiceOverrideResponse(defaultTo(data?.data, {}) as PageServiceOverridesResponseDTOV2)
      setCanCreateNewOrEdit(true)
    }
  }, [loadingServiceOverridesList, data?.data?.content])

  const handleNewOverride = (): void => {
    if (canCreateNew) {
      setCanCreateNewOrEdit(false)
      setListRowItems(c => [{ isNew: true, isEdit: true, isClone: false, rowIndex: -1, groupKey: '' }, ...c])
    } else {
      showWarning(getString('common.serviceOverrides.editablePlaceholderExists'))
    }
  }

  const { mutate: createServiceOverride, loading: loadingCreateServiceOverride } = useUpsertServiceOverrideV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const onAdd = (values: RequiredField<ServiceOverrideRowFormState, 'environmentRef'>): void => {
    const {
      environmentRef,
      serviceRef,
      infraIdentifier,
      variables,
      manifests,
      configFiles,
      applicationSettings,
      connectionStrings
    } = values

    createServiceOverride({
      type: serviceOverrideType,
      environmentRef,
      infraIdentifier,
      serviceRef,
      orgIdentifier,
      projectIdentifier,
      spec: {
        ...(variables && { variables }),
        ...(manifests && { manifests }),
        ...(configFiles && { configFiles }),
        ...(applicationSettings && { applicationSettings }),
        ...(connectionStrings && { connectionStrings })
      }
    })
      .then(() => {
        setCanCreateNewOrEdit(true)
        refetchServiceOverridesList({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            type: serviceOverrideType,
            page
          },
          body: svcOverridesRequestBody
        })
      })
      .catch(e => {
        setCanCreateNewOrEdit(true)
        showError(getRBACErrorMessage(e))
      })
  }

  const { mutate: deleteServiceOverride, loading: loadingDeleteServiceOverride } = useDeleteServiceOverrideV2({})
  const { mutate: updateServiceOverride, loading: loadingUpdateServiceOverride } = useUpdateServiceOverrideV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const onDelete = (rowIndex: number): void => {
    const rowItemToDelete = listRowItems[rowIndex] as RequiredField<ServiceOverrideRowProps, 'overrideDetails'>
    const overrideResponse = rowItemToDelete.overrideResponse as ServiceOverridesResponseDTOV2

    if (shouldDeleteOverrideCompletely(overrideResponse)) {
      deleteServiceOverride(overrideResponse.identifier, {
        headers: { 'content-type': 'application/json' },
        queryParams: {
          ...commonQueryParams
        }
      })
        .then(() => {
          refetchServiceOverridesList({
            queryParams: {
              ...commonQueryParams,
              type: serviceOverrideType,
              page
            },
            body: svcOverridesRequestBody
          })
          showSuccess('Successfully deleted service override with identifier: ' + overrideResponse?.identifier)
        })
        .catch(e => {
          showError(getRBACErrorMessage(e))
        })
    } else {
      updateServiceOverride({
        ...overrideResponse,
        spec: {
          ...formDeleteOverrideResponseSpec(overrideResponse.spec, rowItemToDelete.overrideDetails)
        }
      })
        .then(() => {
          refetchServiceOverridesList({
            queryParams: {
              accountIdentifier: accountId,
              orgIdentifier,
              projectIdentifier,
              type: serviceOverrideType,
              page
            },
            body: svcOverridesRequestBody
          })
          showSuccess('Successfully deleted service override')
        })
        .catch(e => {
          showError(getRBACErrorMessage(e))
        })
    }
  }

  const onEdit = (rowIndex: number): void => {
    if (canCreateNew) {
      setCanCreateNewOrEdit(false)
      setListRowItems(c => c.map(dec => (dec.rowIndex === rowIndex ? { ...dec, isEdit: true } : dec)))
    } else {
      showWarning(getString('common.serviceOverrides.editablePlaceholderExists'))
    }
  }

  const onUpdate = (rowIndex: number, values: RequiredField<ServiceOverrideRowFormState, 'environmentRef'>): void => {
    const rowItemToUpdate = listRowItems[rowIndex % 1 === 0 ? rowIndex : rowIndex + 0.5] as RequiredField<
      ServiceOverrideRowProps,
      'overrideDetails'
    >
    const overrideResponse = rowItemToUpdate.overrideResponse as ServiceOverridesResponseDTOV2

    updateServiceOverride({
      ...omit(overrideResponse, 'yamlInternal'),
      environmentRef: values.environmentRef,
      serviceRef: defaultTo(values.serviceRef, overrideResponse.serviceRef),
      infraIdentifier: defaultTo(values.infraIdentifier, overrideResponse.infraIdentifier),
      spec: {
        ...formUpdateOverrideResponseSpec(cloneDeep(overrideResponse.spec), values, rowItemToUpdate)
      }
    })
      .then(() => {
        setCanCreateNewOrEdit(true)
        refetchServiceOverridesList({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            type: serviceOverrideType,
            page,
            body: svcOverridesRequestBody
          }
        })
        showSuccess('Successfully updated service override')
      })
      .catch(e => {
        showError(getRBACErrorMessage(e))
      })
  }

  const onClone = (rowIndex: number): void => {
    if (canCreateNew) {
      setCanCreateNewOrEdit(false)
      setListRowItems(c => {
        c.splice(rowIndex + 1, 0, { ...c[rowIndex], isEdit: true, isClone: true, rowIndex: rowIndex + 0.5 })
        return c
      })
    } else {
      showWarning(getString('common.serviceOverrides.editablePlaceholderExists'))
    }
  }

  const onDiscard = (): void => {
    if (data?.data?.content) {
      setCanCreateNewOrEdit(true)
      setListRowItems(formListRowItems(data?.data?.content as ServiceOverridesResponseDTOV2[]))
    }
  }

  const loading =
    loadingServiceOverridesList ||
    loadingCreateServiceOverride ||
    loadingUpdateServiceOverride ||
    loadingDeleteServiceOverride

  return (
    <ServiceOverridesContext.Provider
      value={{
        serviceOverrideType,
        canCreateNew,
        setCanCreateNewOrEdit,
        handleNewOverride,
        onAdd,
        onClone,
        onEdit,
        onUpdate,
        onDelete,
        onDiscard,
        listRowItems,
        serviceOverrideResponse,
        loadingServiceOverrideData: loading
      }}
    >
      {loading && <PageSpinner />}
      {children}
    </ServiceOverridesContext.Provider>
  )
}

export const useServiceOverridesContext = (): ServiceOverridesContextInterface => useContext(ServiceOverridesContext)
