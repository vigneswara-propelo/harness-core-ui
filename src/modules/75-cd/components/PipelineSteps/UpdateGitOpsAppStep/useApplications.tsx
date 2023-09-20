/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { pick } from 'lodash-es'
import { useApplicationsFilter } from '@pipeline/components/PipelineSteps/Steps/SyncStep/useApplicationsFilter'
import { ApplicationFilters } from '@pipeline/components/PipelineSteps/Steps/SyncStep/types'
import { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useDeepCompareEffect } from '@common/hooks'
import { Servicev1ApplicationQuery, useApplicationServiceListApps } from 'services/gitops'
import type { Servicev1Applicationlist } from 'services/gitops'
import { ApplicationOption } from './helper'

export const useApplications = (): {
  data: ApplicationOption[]
  loading: boolean
} => {
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()

  const [data, setData] = useState<ApplicationOption[]>([])
  const [filters] = useApplicationsFilter()
  const { mutate: getApplications, loading, cancel: cancelGetApplications } = useApplicationServiceListApps({})

  async function refetchApplicationsList(
    filtersData: ApplicationFilters &
      Pick<Servicev1ApplicationQuery, 'accountIdentifier' | 'orgIdentifier' | 'projectIdentifier'>
  ): Promise<void> {
    cancelGetApplications()

    const body: Servicev1ApplicationQuery = pick(filtersData, [
      'accountIdentifier',
      'orgIdentifier',
      'projectIdentifier'
    ])

    body.pageIndex = filters.page
    body.pageSize = filters.size
    body.searchTerm = filters.search

    const response: Servicev1Applicationlist = await getApplications(body)
    setData(
      /* istanbul ignore next */
      response.content?.map(app => {
        return {
          label: `${app.name} (${app.agentIdentifier})`,
          value: app.name || '',
          repoIdentifier: app.repoIdentifier || '',
          agentId: app.agentIdentifier,
          sourceType: app.app?.status?.sourceType,
          chart: app.app?.spec?.source?.chart,
          targetRevision: app.app?.spec?.source?.targetRevision
        }
      }) || []
    )
  }

  useDeepCompareEffect(() => {
    refetchApplicationsList({
      ...filters,
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId
    })
  }, [filters, accountId, orgIdentifier, projectIdentifier])

  return {
    data,
    loading
  }
}
