/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { get } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { ChildPipelineMetadataType } from '@pipeline/components/PipelineInputSetForm/ChainedPipelineInputSetUtils'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { PipelineStageElementConfig } from '@pipeline/utils/pipelineTypes'

type useGetChildPipelineMetadataReturn = PipelineType<PipelinePathProps>

export function useGetChildPipelineMetadata(
  childPipelineMetadata?: ChildPipelineMetadataType
): useGetChildPipelineMetadataReturn {
  const {
    accountId,
    projectIdentifier: projectIdentifierFromParams,
    orgIdentifier: orgIdentifierFromParams,
    pipelineIdentifier: pipelineIdentifierFromParams
  } = useParams<useGetChildPipelineMetadataReturn>()
  const {
    state: {
      selectionState: { selectedStageId = '' }
    },
    getStageFromPipeline
  } = usePipelineContext()
  const selectedStage = getStageFromPipeline<PipelineStageElementConfig>(selectedStageId).stage

  const orgIdentifier =
    (childPipelineMetadata
      ? childPipelineMetadata.orgIdentifier
      : get(selectedStage?.stage as PipelineStageElementConfig, 'spec.org')) ?? orgIdentifierFromParams
  const projectIdentifier =
    (childPipelineMetadata
      ? childPipelineMetadata.projectIdentifier
      : get(selectedStage?.stage as PipelineStageElementConfig, 'spec.project')) ?? projectIdentifierFromParams
  const pipelineIdentifier =
    (childPipelineMetadata
      ? childPipelineMetadata.pipelineIdentifier
      : get(selectedStage?.stage as PipelineStageElementConfig, 'spec.pipeline')) ?? pipelineIdentifierFromParams

  return {
    accountId,
    orgIdentifier,
    projectIdentifier,
    pipelineIdentifier
  }
}
