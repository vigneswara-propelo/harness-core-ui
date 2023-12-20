/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import { Container, OverlaySpinner, Text } from '@harness/uicore'
import React, { lazy, useState } from 'react'
import { ArtifactSbomDriftResponse } from '@harnessio/react-ssca-manager-client'
import { String, useStrings } from 'framework/strings'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import ChildComponentMounter from 'microfrontends/ChildComponentMounter'
import { Artifact, ArtifactsTable } from './ArtifactsTable/ArtifactsTable'
import { PolicyViolationsDrawer } from './PolicyViolations/PolicyViolationsDrawer'
import { StageSelector } from './StageSelector'
import artifactsEmptyState from './images/artifacts_empty_state.svg'
import css from './ExecutionArtifactsView.module.scss'

// eslint-disable-next-line import/no-unresolved
const DriftDrawer = lazy(() => import('ssca/DriftDrawer'))

export interface PolicyViolationsProps {
  enforcementId: string
  showEnforcementViolations: (enforcementId?: string) => void
}

export interface ExecutionArtifactListViewProps {
  artifacts: Artifact[]
  pipelineExecutionSummary?: PipelineExecutionSummary
  loading: boolean
}

export function ExecutionArtifactListView({
  artifacts,
  pipelineExecutionSummary,
  loading
}: ExecutionArtifactListViewProps): React.ReactElement {
  const { getString } = useStrings()

  const [enforcementId, showEnforcementViolations] = useState<string | undefined>()
  const [driftData, setDriftData] = useState<ArtifactSbomDriftResponse>()

  return (
    <OverlaySpinner show={loading}>
      <div className={css.subSection}>
        <Text color={Color.GREY_900} font={{ weight: 'bold' }}>{`${getString('total')}: ${artifacts.length}`}</Text>
        <StageSelector layoutNodeMap={pipelineExecutionSummary?.layoutNodeMap} />
      </div>
      {artifacts.length ? (
        <>
          <ArtifactsTable
            artifacts={artifacts}
            showEnforcementViolations={showEnforcementViolations}
            showDrift={setDriftData}
          />
          {enforcementId && (
            <PolicyViolationsDrawer
              enforcementId={enforcementId}
              showEnforcementViolations={showEnforcementViolations}
            />
          )}
          {driftData && (
            <ChildComponentMounter
              ChildComponent={DriftDrawer}
              data={driftData}
              onClose={() => setDriftData(undefined)}
            />
          )}
        </>
      ) : (
        <Container className={css.emptyArtifacts}>
          <img src={artifactsEmptyState} />
          <Text>
            <String stringID="pipeline.artifactTriggerConfigPanel.noArtifacts" />
          </Text>
        </Container>
      )}
    </OverlaySpinner>
  )
}
