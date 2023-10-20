/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useContext, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { Breadcrumb } from '@harness/uicore'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { DashboardMode } from '@dashboards/types/DashboardTypes.types'
import { useTelemetry } from '@modules/10-common/hooks/useTelemetry'
import { CDBActions, Category } from '@modules/10-common/constants/TrackingConstants'
import { FolderModel, useSearchFolders, useGetModelTags, AiAddTileRequestBody } from 'services/custom-dashboards'

export interface DashboardsContextProps {
  breadcrumbs: Breadcrumb[]
  aiTileDetails?: AiAddTileRequestBody
  includeBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void
  editableFolders: FolderModel[]
  modelTags: string[]
  updateAiTileDetails: (updatedDetails: AiAddTileRequestBody) => void
  mode: DashboardMode
  updateDashboardMode: (newMode: DashboardMode) => void
}

const DashboardsContext = React.createContext<DashboardsContextProps>({} as DashboardsContextProps)

export function DashboardsContextProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { accountId } = useParams<AccountPathProps>()
  const { trackEvent } = useTelemetry()
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])
  const [aiTileDetails, setAiTileDetails] = useState<AiAddTileRequestBody>()
  const [mode, setMode] = useState<DashboardMode>(DashboardMode.VIEW)

  const includeBreadcrumbs = React.useCallback((breadcrumbsToAdd: Breadcrumb[]): void => {
    setBreadcrumbs(breadcrumbsToAdd)
  }, [])

  const updateDashboardMode = React.useCallback(
    (newMode: DashboardMode): void => {
      const telemetryAction =
        newMode === DashboardMode.EDIT ? CDBActions.DashboardEmbedEditEnabled : CDBActions.DashboardEmbedEditDisabled
      trackEvent(telemetryAction, { category: Category.CUSTOM_DASHBOARDS })
      setMode(newMode)
    },
    [trackEvent]
  )

  const updateAiTileDetails = React.useCallback((updatedDetails: AiAddTileRequestBody): void => {
    setAiTileDetails(updatedDetails)
    setMode(DashboardMode.VIEW)
  }, [])

  const { data: folderResponse } = useSearchFolders({
    queryParams: { accountId, page: 1, pageSize: 100, permission: PermissionIdentifier.EDIT_DASHBOARD }
  })

  const editableFolders = folderResponse?.resource || []

  const { data: modelTagsResponse } = useGetModelTags({ queryParams: { accountId } })
  const modelTags = useMemo(() => modelTagsResponse?.resource || [], [modelTagsResponse])

  return (
    <DashboardsContext.Provider
      value={{
        aiTileDetails,
        breadcrumbs,
        includeBreadcrumbs,
        editableFolders,
        modelTags,
        updateAiTileDetails,
        mode,
        updateDashboardMode
      }}
    >
      {props.children}
    </DashboardsContext.Provider>
  )
}

export function useDashboardsContext(): DashboardsContextProps {
  return useContext(DashboardsContext)
}
