/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'

import { Text, Layout, PageSpinner } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { CellProps, Column } from 'react-table'
import type { RbacResourceRendererProps } from '@rbac/factories/RbacFactory'
import StaticResourceRenderer from '@rbac/components/StaticResourceRenderer/StaticResourceRenderer'
import type { ResourceHandlerTableData } from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { useListRepos, TypesRepository } from 'services/code'

type TypesRepositoryWithIdentifier = TypesRepository & ResourceHandlerTableData

const RepositroyResourceRenderer: React.FC<RbacResourceRendererProps> = ({
  identifiers,
  resourceScope,
  resourceType,
  onResourceSelectionChange
}) => {
  const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope

  const { data: repositoriesListResult, loading: repositoriesLoading } = useListRepos({
    space_ref: `${accountIdentifier}/${orgIdentifier}/${projectIdentifier}/+`
  })

  const filteredrepositoriesData =
    repositoriesListResult
      ?.map(repository => ({
        identifier: repository.uid as string,
        ...repository
      }))
      ?.filter(item => identifiers.includes(item.identifier)) || []

  const columns: Column<TypesRepositoryWithIdentifier>[] = useMemo(
    () => [
      {
        id: 'uid',
        accessor: 'uid',
        width: '95%',
        disableSortBy: true,
        Cell: ({ row }: CellProps<TypesRepository>) => {
          return (
            <Layout.Horizontal spacing={'small'}>
              <Text
                icon={'code-repo'}
                iconProps={{ size: 20 }}
                font={{ variation: FontVariation.BODY2_SEMI }}
                color={Color.GREY_600}
              >
                {row.original.uid}
              </Text>
            </Layout.Horizontal>
          )
        }
      }
    ],
    []
  )

  if (repositoriesLoading) return <PageSpinner />

  return filteredrepositoriesData?.length ? (
    <StaticResourceRenderer<TypesRepositoryWithIdentifier>
      data={filteredrepositoriesData}
      resourceType={resourceType}
      onResourceSelectionChange={onResourceSelectionChange}
      columns={columns}
    />
  ) : null
}

export default RepositroyResourceRenderer
