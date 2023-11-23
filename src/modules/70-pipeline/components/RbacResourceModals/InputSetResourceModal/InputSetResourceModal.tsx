/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo } from 'react'
import { Container, Layout, Text, Icon } from '@harness/uicore'
import type { Cell, CellValue, Column, ColumnInstance, Renderer, Row, TableInstance } from 'react-table'
import { Color, FontVariation } from '@harness/design-system'
import { Position } from '@blueprintjs/core'
import { defaultTo } from 'lodash-es'
import ResourceHandlerTable, {
  ResourceHandlerTableData
} from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { PageSpinner } from '@common/components'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/strings'
import { InputSetListResponse, useGetInputSetsListForProject } from 'services/pipeline-ng'
import { CodeSourceCell, LabeValue } from '@pipeline/pages/pipeline-list/PipelineListTable/PipelineListCells'
import { DEFAULT_PAGE_INDEX } from '@modules/70-pipeline/utils/constants'
import { useMutateAsGet } from '@common/hooks'

export interface InputSetListResponsDTO extends Omit<InputSetListResponse, 'identifier'> {
  identifier: string
}

type CellPropsInputSetResourceModalColumn<
  D extends InputSetListResponsDTO,
  V = InputSetListResponsDTO
> = TableInstance<D> & {
  column: ColumnInstance<D> & {
    inputSetsListContentData?: InputSetListResponse[]
  }
  row: Row<D>
  cell: Cell<D, V>
  value: CellValue<V>
}

// eslint-disable-next-line react/function-component-definition
export const RenderColumnInputSet: Renderer<CellPropsInputSetResourceModalColumn<InputSetListResponsDTO>> = ({
  row
}) => {
  const { name, description, pipelineIdentifier, inputSetIdWithPipelineId } = row.original
  const ids = inputSetIdWithPipelineId?.split('-')
  const identifier = ids && ids.length > 1 ? ids[1] : name
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="xsmall" data-testid={inputSetIdWithPipelineId}>
      <Layout.Horizontal spacing="medium">
        <Text
          color={Color.GREY_800}
          tooltipProps={{ position: Position.BOTTOM }}
          tooltip={
            <Layout.Vertical spacing="medium" padding="medium" style={{ maxWidth: 400 }}>
              <Text>{getString('nameLabel', { name })}</Text>
              <Text>{getString('idLabel', { id: identifier })}</Text>
              <Text>{getString('descriptionLabel', { description })}</Text>
            </Layout.Vertical>
          }
        >
          {identifier}
        </Text>
      </Layout.Horizontal>
      <Text tooltipProps={{ position: Position.BOTTOM }} color={Color.GREY_400}>
        {getString('pipeline.pipelineId', { id: pipelineIdentifier })}
      </Text>
    </Layout.Vertical>
  )
}

// eslint-disable-next-line react/function-component-definition
const InputSetNameCell: Renderer<CellPropsInputSetResourceModalColumn<InputSetListResponsDTO>> = ({ row }) => {
  const { name, description, pipelineIdentifier, inputSetIdWithPipelineId } = row.original
  const ids = inputSetIdWithPipelineId?.split('-')
  const identifier = ids && ids.length > 1 ? ids[1] : name
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="xsmall" data-testid={inputSetIdWithPipelineId}>
      <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'center' }} margin={{ bottom: 'small' }}>
        <Text
          font={{ variation: FontVariation.LEAD }}
          color={Color.PRIMARY_7}
          tooltipProps={{ isDark: true }}
          tooltip={
            <Layout.Vertical spacing="medium" padding="large" style={{ maxWidth: 400 }}>
              <LabeValue label={getString('name')} value={name} />
              <LabeValue label={getString('common.ID')} value={identifier} />
              {description && <LabeValue label={getString('description')} value={description} />}
            </Layout.Vertical>
          }
          lineClamp={1}
        >
          {identifier}
        </Text>
      </Layout.Horizontal>
      <Text color={Color.GREY_600} font="xsmall" lineClamp={1}>
        {getString('pipeline.pipelineId', { id: pipelineIdentifier })}
      </Text>
    </Layout.Vertical>
  )
}

function InputSetResourceModal({
  sortMethod,
  searchTerm,
  onSelectChange,
  selectedData,
  resourceScope
}: RbacResourceModalProps): React.ReactElement {
  const { accountIdentifier, orgIdentifier = '', projectIdentifier = '' } = resourceScope
  const [pageIndex, setPageIndex] = useState(0)
  const { getString } = useStrings()

  const { loading, data: inputSetsListForProjectData } = useMutateAsGet(useGetInputSetsListForProject, {
    queryParams: {
      pageIndex,
      accountIdentifier,
      projectIdentifier,
      orgIdentifier,
      searchTerm,
      pageSize: 10,
      sortOrders: [sortMethod]
    },
    body: {
      filterType: 'InputSet'
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  const inputSetsListData = inputSetsListForProjectData?.data
  const {
    totalItems = 0,
    pageSize = 10,
    totalPages = 1,
    pageIndex: inputSetsListPageIndex = DEFAULT_PAGE_INDEX
  } = defaultTo(inputSetsListData, {})
  const inputSetsListContentData: InputSetListResponse[] = defaultTo(inputSetsListData?.content, [])
  const updatedInputSetsListContentData = useMemo(
    () =>
      inputSetsListContentData.map(rowData => ({
        ...rowData,
        identifier: rowData.inputSetIdWithPipelineId
      })),
    [inputSetsListContentData]
  )

  if (loading) return <PageSpinner />

  return inputSetsListContentData?.length ? (
    <Container>
      <ResourceHandlerTable<InputSetListResponsDTO>
        data={updatedInputSetsListContentData as ResourceHandlerTableData[]}
        selectedData={selectedData}
        columns={
          [
            {
              Header: getString('inputSets.inputSetLabel'),
              accessor: 'name',
              Cell: InputSetNameCell,
              width: '60%',
              disableSortBy: true
            },
            {
              Header: getString('pipeline.codeSource'),
              accessor: 'storeType',
              Cell: CodeSourceCell,
              width: '30%',
              disableSortBy: true
            }
          ] as Column<InputSetListResponsDTO>[]
        }
        pagination={{
          pageSize,
          itemCount: totalItems,
          pageCount: totalPages,
          pageIndex: inputSetsListPageIndex,
          gotoPage: pageNumber => setPageIndex(pageNumber)
        }}
        onSelectChange={onSelectChange}
      />
    </Container>
  ) : (
    <Layout.Vertical flex={{ align: 'center-center' }} spacing="small">
      <Icon name="resources-icon" size={20} />
      <Text font="medium" color={Color.BLACK}>
        {getString('noData')}
      </Text>
    </Layout.Vertical>
  )
}

export default InputSetResourceModal
