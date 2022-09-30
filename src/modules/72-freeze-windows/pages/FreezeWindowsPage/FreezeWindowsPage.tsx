/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, Layout, Page, PageSpinner, Text } from '@harness/uicore'
import React, { ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { useUpdateQueryParams, useQueryParams, useMutateAsGet } from '@common/hooks'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import {
  GetFreezeListQueryParams,
  useGetFreezeList,
  useUpdateFreezeStatus,
  useDeleteFreeze,
  UseUpdateFreezeStatusProps
} from 'services/cd-ng'
import { NoResultsView } from '@freeze-windows/components/NoResultsView/NoResultsView'
import { FreezeWindowListSubHeader } from '@freeze-windows/components/FreezeWindowListSubHeader/FreezeWindowListSubHeader'
import { BulkActions } from '@freeze-windows/components/BulkActions/BulkActions'
import type { FreezeListUrlQueryParams } from '@freeze-windows/types'
import { FreezeWindowListHeader } from '@freeze-windows/components/FreezeWindowListHeader/FreezeWindowListHeader'
import { FreezeWindowList } from '@freeze-windows/components/FreezeWindowList/FreezeWindowList'
import { FreezeWindowListProvider, useFreezeWindowListContext } from '@freeze-windows/context/FreezeWindowListContext'
import { getQueryParamOptions } from '@freeze-windows/utils/queryUtils'
import type { FreezeWindowListColumnActions } from '@freeze-windows/components/FreezeWindowList/FreezeWindowListCells'
import css from '@freeze-windows/components/FreezeWindowListSubHeader/FreezeWindowListSubHeader.module.scss'

function _FreezeWindowsPage(): React.ReactElement {
  const { getString } = useStrings()
  const { projectIdentifier = 'defaultproject', orgIdentifier = 'default', accountId } = useParams<ProjectPathProps>()
  const scope = getScopeFromDTO({ projectIdentifier, orgIdentifier, accountId })
  const { replaceQueryParams } = useUpdateQueryParams<Partial<GetFreezeListQueryParams>>()
  const queryParams = useQueryParams<FreezeListUrlQueryParams>(getQueryParamOptions())
  const { searchTerm, page, size, sort, freezeStatus, startDate, endDate } = queryParams
  const { selectedItems } = useFreezeWindowListContext()
  const resetFilter = (): void => {
    replaceQueryParams({})
  }

  useDocumentTitle([getString('common.freezeWindows')])

  const { data, error, loading, refetch } = useMutateAsGet(useGetFreezeList, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      page,
      size,
      searchTerm,
      sort: sort.join(',')
    }
  })

  const { mutate: updateFreezeStatus, loading: updateFreezeStatusLoading } = useUpdateFreezeStatus({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  } as UseUpdateFreezeStatusProps)

  const { mutate: deleteFreeze, loading: deleteFreezeLoading } = useDeleteFreeze({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const handleDelete = (freezeWindowId?: string) => {
    if (freezeWindowId) {
      deleteFreeze(freezeWindowId)
    }
  }

  const handleFreezeToggle: FreezeWindowListColumnActions['onToggleFreezeRow'] = ({ freezeWindowId, status }) => {
    if (freezeWindowId) {
      updateFreezeStatus([freezeWindowId], { queryParams: { status } } as UseUpdateFreezeStatusProps)
    } else {
      updateFreezeStatus(selectedItems, { queryParams: { status } } as UseUpdateFreezeStatusProps)
    }
  }

  const pageFreezeSummaryResponse = data?.data
  return (
    <div className={css.main}>
      <FreezeWindowListHeader />
      <FreezeWindowListSubHeader />
      <Page.Body loading={loading} error={error?.message} retryOnError={() => refetch()}>
        {loading ? (
          <PageSpinner />
        ) : pageFreezeSummaryResponse && pageFreezeSummaryResponse.content?.length ? (
          <>
            {(deleteFreezeLoading || updateFreezeStatusLoading) && <PageSpinner />}
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'start' }}>
              <Text color={Color.GREY_800} font={{ weight: 'bold' }} padding="large">
                {`${getString('total')}: ${data?.data?.totalItems}`}
              </Text>
              <BulkActions onDelete={handleDelete} onToggleFreeze={handleFreezeToggle} />
            </Layout.Horizontal>
            <FreezeWindowList
              data={pageFreezeSummaryResponse}
              onDeleteRow={handleDelete}
              onToggleFreezeRow={handleFreezeToggle}
            />
          </>
        ) : (
          <NoResultsView
            hasSearchParam={!!(searchTerm || freezeStatus || startDate || endDate)}
            onReset={resetFilter}
            text={getString('freezeWindows.freezeWindowsPage.noFreezeWindows', { scope })}
          />
        )}
      </Page.Body>
    </div>
  )
}

export default function FreezeWindowsPage(): ReactElement {
  return (
    <FreezeWindowListProvider>
      <_FreezeWindowsPage />
    </FreezeWindowListProvider>
  )
}
