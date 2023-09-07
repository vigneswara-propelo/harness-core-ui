/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Text } from '@harness/uicore'
import React from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { String } from 'framework/strings'
import type {
  ExecutionGraph,
  ExecutionNode,
  PipelineExecutionDetail,
  PipelineExecutionSummary
} from 'services/pipeline-ng'
import { useQueryParams } from '@common/hooks'
import type { ArtifactGroup } from './ArtifactsComponent/ArtifactsComponent'
import ArtifactsComponent from './ArtifactsComponent/ArtifactsComponent'
import type { Artifact } from './ArtifactsTable/ArtifactsTable'
import { ExecutionArtifactListView } from './ExecutionArtifactListView'
import { StageSelector, getSscaArtifactStageSetupIds } from './StageSelector'
import artifactsEmptyState from './images/artifacts_empty_state.svg'
import css from './ExecutionArtifactsView.module.scss'

export const getStageSetupIds: (data?: PipelineExecutionSummary) => string[] = data => {
  return Object.keys(data?.layoutNodeMap ?? {})
}

export const getStageNodesWithArtifacts: (data: ExecutionGraph | undefined, stageIds: string[]) => ExecutionNode[] = (
  data,
  stageIds
) => {
  return Object.values(data?.nodeMap ?? {}).filter(entry => {
    const { setupId = '', outcomes = [], stepDetails = {} } = entry
    const outcomeWithArtifacts = Array.isArray(outcomes)
      ? outcomes?.some(
          (outcome: any) =>
            outcome.fileArtifacts?.length || outcome.imageArtifacts?.length || outcome.sbomArtifacts?.length
        )
      : outcomes?.integrationStageOutcome?.fileArtifacts?.length ||
        outcomes?.integrationStageOutcome?.imageArtifacts?.length ||
        outcomes?.integrationStageOutcome?.sbomArtifacts?.length ||
        (!isEmpty(stepDetails) && Object.values(stepDetails).some(item => !isEmpty(item.sbomArtifact))) // CD stage has data in stepDetails. Odd name but constraints on BE
    return stageIds.includes(setupId) && outcomeWithArtifacts
  })
}

export const getArtifactGroups: (stages: ExecutionNode[]) => ArtifactGroup[] = stages => {
  return stages.map(node => {
    const outcomeWithImageArtifacts = Array.isArray(node.outcomes)
      ? node.outcomes?.find(outcome => outcome.imageArtifacts)
      : node.outcomes?.integrationStageOutcome
    const imageArtifacts =
      outcomeWithImageArtifacts?.imageArtifacts?.map((artifact: any) => ({
        image: artifact.imageName,
        tag: artifact.tag,
        type: 'Image',
        url: artifact.url
      })) ?? []
    const outcomeWithFileArtifacts = Array.isArray(node.outcomes)
      ? node.outcomes?.find(outcome => outcome.fileArtifacts)
      : node.outcomes?.integrationStageOutcome
    const fileArtifacts = outcomeWithFileArtifacts?.fileArtifacts // TODO: fix typing once BE type is available
      ?.map((artifact: any) => ({
        type: 'File',
        url: artifact.url
      }))
    return {
      name: node.name!,
      icon: 'pipeline-deploy',
      artifacts: imageArtifacts.concat(fileArtifacts)
    }
  })
}

// Only steps artifacts but not the stage integrated artifacts
export const getStepArtifacts: (data: ExecutionGraph | undefined, stageIds: string[], stage?: string) => Artifact[] = (
  data,
  stageIds,
  stage
) => {
  return Object.values(data?.nodeMap ?? {})
    .filter(node => {
      const { setupId = '', identifier = '' } = node
      return (
        !stageIds.includes(setupId) ||
        !['liteEngineTask', 'harness-git-clone', 'execution', 'deploy'].includes(identifier)
      )
    })
    .reduce<Artifact[]>((artifacts, node) => {
      Object.values(node.outcomes || {}).forEach(item => {
        if (item?.stepArtifacts) {
          const {
            publishedFileArtifacts = [],
            publishedImageArtifacts = [],
            publishedSbomArtifacts = [],
            provenanceArtifacts = []
          } = item.stepArtifacts

          artifacts.push(
            ...publishedFileArtifacts.map((artifact: Artifact) => ({
              ...artifact,
              type: 'File',
              node,
              stage
            })),
            ...publishedImageArtifacts.map((artifact: Artifact) => ({
              ...artifact,
              type: 'Image',
              node,
              stage,
              provenance: provenanceArtifacts[0] // slsa provenance to be shown along with image
            })),
            ...publishedSbomArtifacts.map((artifact: Artifact) => ({
              ...artifact,
              type: 'SBOM',
              node,
              stage
            }))
          )
        } else {
          // CD stage steps
          if (!isEmpty(item.sbomArtifact)) {
            artifacts.push({ ...(item.sbomArtifact as any), type: 'SBOM', node, stage })
          }
        }
      })

      return artifacts
    }, [])
}

export default function ExecutionArtifactsView(): React.ReactElement {
  const context = useExecutionContext()
  const SSCA_ENABLED = useFeatureFlag(FeatureFlag.SSCA_ENABLED)
  const { pipelineExecutionSummary, executionGraph } = defaultTo(
    context?.pipelineExecutionDetail,
    {} as PipelineExecutionDetail
  )
  const { stage } = useQueryParams<{ stage: string }>()

  const stageSetupIds = getSscaArtifactStageSetupIds(pipelineExecutionSummary?.layoutNodeMap)
  const stepArtifacts = getStepArtifacts(
    executionGraph,
    stageSetupIds,
    pipelineExecutionSummary?.layoutNodeMap?.[stage]?.name
  )

  const stageNodes = getStageNodesWithArtifacts(executionGraph, stageSetupIds)
  const artifactGroups = getArtifactGroups(stageNodes)

  return SSCA_ENABLED ? (
    <ExecutionArtifactListView
      artifacts={stepArtifacts}
      pipelineExecutionSummary={pipelineExecutionSummary}
      loading={context.loading}
    />
  ) : (
    <div className={css.wrapper}>
      <StageSelector layoutNodeMap={pipelineExecutionSummary?.layoutNodeMap} />
      {artifactGroups.length ? (
        <ArtifactsComponent artifactGroups={artifactGroups} />
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
