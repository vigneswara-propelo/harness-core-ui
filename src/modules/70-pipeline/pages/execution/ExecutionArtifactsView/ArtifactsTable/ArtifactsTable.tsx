/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { TableV2 } from '@harness/uicore'
import React from 'react'
import type { Column } from 'react-table'
import { ArtifactSbomDriftResponse } from '@harnessio/react-ssca-manager-client'
import { useStrings } from 'framework/strings'
import type { ExecutionNode } from 'services/pipeline-ng'
import { ArtifactCell, PipelineStepCell, SLSAVerificationCell, TypeCell, ViolationsCell } from './ArtifactTableCells'
import css from './ArtifactsTable.module.scss'

export type ArtifactType = 'File' | 'Image' | 'SBOM'

interface ArtifactMetadata {
  type: ArtifactType
  node?: ExecutionNode
  stage: string
  provenance: unknown
}

export interface Artifact extends ArtifactMetadata {
  id: string
  url: string
  imageName: string
  tag: string
  sbomName: string
  stepExecutionId: string
  isSbomAttested: boolean
  allowListViolationCount: number
  denyListViolationCount: number
  scorecard: Scorecard
  drift: Drift
}

export interface Drift {
  base: string
  baseTag: string
  driftId: string
  totalDrifts: number
  componentDrifts: number
  licenseDrifts: number
  componentsAdded: number
  componentsModified: number
  componentsDeleted: number
  licenseAdded: number
  licenseDeleted: number
}

export interface Scorecard {
  avgScore: string
  maxScore: string
}

export interface ArtifactsColumnActions {
  showEnforcementViolations: (stepExecutionId?: string) => void
  showDrift: (driftData: ArtifactSbomDriftResponse) => void
}

export interface ArtifactsTableProps extends ArtifactsColumnActions {
  artifacts: Artifact[]
}

export function ArtifactsTable({
  artifacts,
  showEnforcementViolations,
  showDrift
}: ArtifactsTableProps): React.ReactElement {
  const { getString } = useStrings()

  const columns: Column<Artifact>[] = React.useMemo(() => {
    return [
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
        Cell: TypeCell,
        showDrift
      },
      {
        Header: getString('pipeline.sbomPolicyViolations'),
        accessor: 'allowListViolationCount',
        Cell: ViolationsCell,
        showEnforcementViolations
      },
      {
        Header: getString('pipeline.slsaVerification'),
        accessor: 'sbomName',
        Cell: SLSAVerificationCell
      }
    ]
  }, [getString, showDrift, showEnforcementViolations])

  return <TableV2 className={css.table} columns={columns} data={artifacts} sortable />
}
