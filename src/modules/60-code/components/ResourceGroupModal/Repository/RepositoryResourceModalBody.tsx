/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { CellProps, Column } from 'react-table'
import { Container, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import ResourceHandlerTable from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { PageSpinner } from '@common/components'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useListRepos, TypesRepository } from 'services/code'
import css from './RepositoryResourceModalBody.module.scss'

type ParsedColumnContent = TypesRepository & { identifier: string }

const RepositoryResourceModalBody: React.FC<RbacResourceModalProps> = ({
  searchTerm,
  resourceScope,
  onSelectChange,
  selectedData
}) => {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { accountIdentifier } = resourceScope

  const { data: repositoriesListResult, loading: repositoriesLoading } = useListRepos({
    space_ref: `${accountIdentifier}/${orgIdentifier}/${projectIdentifier}/+`,
    queryParams: { query: searchTerm }
  })
  const repositoriesDataContent = repositoriesListResult?.map(dataContent => ({
    identifier: dataContent.uid,
    ...dataContent
  }))

  const columns: Column<ParsedColumnContent>[] = useMemo(
    () => [
      {
        Header: getString('repositories'),
        accessor: 'uid',
        id: 'uid',
        width: '95%',
        Cell: ({ row }: CellProps<TypesRepository>) => {
          return (
            <Layout.Horizontal spacing={'small'}>
              <Text
                icon={'code-repo'}
                iconProps={{ size: 20 }}
                flex={{ align: 'center-center' }}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  if (repositoriesLoading) return <PageSpinner />
  return repositoriesDataContent?.length ? (
    <Container>
      <ResourceHandlerTable
        data={repositoriesDataContent as ParsedColumnContent[]}
        selectedData={selectedData}
        columns={columns}
        onSelectChange={onSelectChange}
      />
    </Container>
  ) : (
    <Layout.Vertical flex={{ align: 'center-center' }} spacing="small" className={css.noDataContainer}>
      <Text
        icon={'code-repo'}
        iconProps={{ size: 20 }}
        flex={{ align: 'center-center' }}
        font={{ variation: FontVariation.BODY1 }}
        color={Color.BLACK}
      >
        {getString('noData')}
      </Text>
    </Layout.Vertical>
  )
}

export default RepositoryResourceModalBody
