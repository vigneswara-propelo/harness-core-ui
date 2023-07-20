/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { MutateMethod } from 'restful-react'
import { StageElementWrapper, DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { ResponseCDStageMetaDataDTO, CdDeployStageMetadataRequestDTO } from 'services/cd-ng'
import { PipelineInfoConfig } from 'services/pipeline-ng'

export interface GetStageServiceAndEnvArgs {
  pipeline: PipelineInfoConfig
  selectedStage?: StageElementWrapper<DeploymentStageElementConfig>
  selectedStageId?: string
  getDeploymentStageMeta: MutateMethod<ResponseCDStageMetaDataDTO, CdDeployStageMetadataRequestDTO, void, void>
}

export interface GetStageServiceAndEnvReturn {
  serviceIdentifier: string
  environmentIdentifier: string
  hasMultiServiceOrEnv: boolean
  errorInfo: string
}
