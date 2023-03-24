/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React from 'react'
import { String, useStrings } from 'framework/strings'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import { Artifact, ArtifactsTable } from './ArtifactsTable/ArtifactsTable'
import artifactsEmptyState from './images/artifacts_empty_state.svg'
import { StageSelector } from './StageSelector'
import css from './ExecutionArtifactsView.module.scss'

export interface ExecutionArtifactListViewProps {
  artifacts: Artifact[]
  pipelineExecutionSummary?: PipelineExecutionSummary
}

export function ExecutionArtifactListView({
  artifacts,
  pipelineExecutionSummary
}: ExecutionArtifactListViewProps): React.ReactElement {
  const { getString } = useStrings()

  return (
    <div>
      <div className={css.subSection}>
        <Text color={Color.GREY_900} font={{ weight: 'bold' }}>{`${getString('total')}: ${artifacts.length}`}</Text>
        <StageSelector layoutNodeMap={pipelineExecutionSummary?.layoutNodeMap} />
      </div>
      {artifacts.length ? (
        <ArtifactsTable artifacts={artifacts} />
      ) : (
        <Container className={css.emptyArtifacts}>
          <img src={artifactsEmptyState} />
          <Text>
            <String stringID="pipeline.artifactTriggerConfigPanel.noArtifacts" />
          </Text>
        </Container>
      )}
    </div>
  )
}
