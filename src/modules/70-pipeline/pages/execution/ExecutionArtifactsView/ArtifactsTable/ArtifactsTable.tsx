/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { TableV2 } from '@harness/uicore'
import React from 'react'
import type { Column } from 'react-table'
import { useStrings } from 'framework/strings'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import type { ExecutionNode } from 'services/pipeline-ng'
import { useQueryParams } from '@common/hooks'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'
import { ArtifactExpandedView } from './ArtifactExpandedView'
import {
  ArtifactCell,
  PipelineStepCell,
  SbomCell,
  ToggleAccordionCell,
  TypeCell,
  ViolationsCell
} from './ArtifactTableCells'
import css from './ArtifactsTable.module.scss'

export type ArtifactType = 'File' | 'Image' | 'Sbom'

export interface Artifact {
  type: ArtifactType
  imageName: string
  tag: string
  url: string
  id?: string // artifact Id
  stepExecutionId?: string
  sbomName?: string
  sbomUrl?: string
  isSbomAttested?: string
  node?: ExecutionNode
  stage: string
  allowListViolationCount: number | undefined
  denyListViolationCount: number | undefined
}

export interface ArtifactsColumnActions {
  onSbomDownload: (sbomId: string) => void
}

export interface ArtifactsTableProps {
  artifacts: Artifact[]
}

export function ArtifactsTable({ artifacts }: ArtifactsTableProps): React.ReactElement {
  const { getString } = useStrings()
  const { size, page } = useQueryParams<{ size: number; page: number }>()
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()

  const columns: Column<Artifact>[] = React.useMemo(() => {
    return [
      {
        Header: '',
        accessor: 'tag',
        Cell: ToggleAccordionCell,
        disableSortBy: true
      },
      {
        Header: 'Artifact', //TODO: move this to common and update all instances
        accessor: 'url',
        Cell: ArtifactCell
      },
      {
        Header: getString('step'),
        accessor: 'node',
        Cell: PipelineStepCell
      },
      {
        Header: getString('pipeline.artifactsSelection.artifactType'),
        accessor: 'type',
        Cell: TypeCell
      },
      {
        Header: getString('common.violations'),
        accessor: 'allowListViolationCount',
        Cell: ViolationsCell
      },
      {
        Header: getString('common.sbom'),
        accessor: 'sbomName',
        Cell: SbomCell
      }
    ]
  }, [getString])

  const renderRowSubComponent = React.useCallback(({ row }) => <ArtifactExpandedView row={row} />, [])

  const paginationProps = useDefaultPaginationProps({
    itemCount: artifacts.length || 0,
    pageSize: size || (PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : 10),
    pageCount: Math.ceil(artifacts.length / 10),
    pageIndex: page || 0
  })

  return (
    <TableV2
      className={css.table}
      columns={columns}
      data={artifacts}
      pagination={paginationProps}
      sortable
      renderRowSubComponent={renderRowSubComponent}
      autoResetExpanded={false}
    />
  )
}
