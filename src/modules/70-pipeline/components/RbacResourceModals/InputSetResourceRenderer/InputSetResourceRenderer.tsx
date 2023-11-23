/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import { Column } from 'react-table'
import type { RbacResourceRendererProps } from '@rbac/factories/RbacFactory'
import StaticResourceRenderer from '@rbac/components/StaticResourceRenderer/StaticResourceRenderer'
import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import { InputSetListResponse, useGetInputSetsListForProject } from 'services/pipeline-ng'
import type { ResourceHandlerTableData } from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useMutateAsGet } from '@common/hooks'
import { InputSetListResponsDTO, RenderColumnInputSet } from '../InputSetResourceModal/InputSetResourceModal'

function InputSetResourceRenderer({
  identifiers,
  resourceScope,
  resourceType,
  onResourceSelectionChange
}: RbacResourceRendererProps): React.ReactElement {
  const { accountIdentifier, orgIdentifier = '', projectIdentifier = '' } = resourceScope
  const { getString } = useStrings()
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF

  const { data: inputSetsListData, loading } = useMutateAsGet(useGetInputSetsListForProject, {
    body: {
      filterType: 'InputSet',
      inputSetIdsWithPipelineIds: identifiers
    },
    queryParams: {
      accountIdentifier,
      projectIdentifier,
      orgIdentifier,
      ...(isGitSyncEnabled ? { getDistinctFromBranches: true } : {})
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  const inputSetsListContentData: InputSetListResponse[] = defaultTo(inputSetsListData?.data?.content, [])
  const updatedInputSetsListContentData = React.useMemo(
    () =>
      inputSetsListContentData.map(rowData => ({
        ...rowData,
        identifier: rowData.inputSetIdWithPipelineId
      })),
    [inputSetsListContentData]
  )

  return inputSetsListData && !loading ? (
    <StaticResourceRenderer<InputSetListResponsDTO>
      data={updatedInputSetsListContentData as ResourceHandlerTableData[]}
      resourceType={resourceType}
      onResourceSelectionChange={onResourceSelectionChange}
      columns={[
        {
          Header: getString('common.pipeline'),
          id: 'name',
          accessor: 'name',
          Cell: RenderColumnInputSet,
          width: '80%',
          disableSortBy: true
        } as Column<InputSetListResponsDTO>
      ]}
    />
  ) : (
    <PageSpinner />
  )
}

export default InputSetResourceRenderer
