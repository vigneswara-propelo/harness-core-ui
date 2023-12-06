/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import type { UseStringsReturn } from 'framework/strings'
import { StageType } from '@pipeline/utils/stageHelpers'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { StageAttributes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { IDPStage } from './IDPStage'

/* istanbul ignore next */
export const getStageAttributes = (_getString: UseStringsReturn['getString']): StageAttributes => ({
  name: 'IDP',
  type: StageType.IDP,
  icon: 'idp',
  iconColor: 'var(--pipeline-custom-stage-color)',
  isApproval: false,
  openExecutionStrategy: false
})
/* istanbul ignore next */
export const getStageEditorImplementation = (
  isEnabled: boolean,
  getString: UseStringsReturn['getString']
): ReactElement => (
  <IDPStage
    icon="idp"
    hoverIcon="idp-stage-hover"
    name={getString('common.purpose.idp.name')}
    type={StageType.IDP}
    title={getString('common.purpose.idp.fullName')}
    description={getString('idp.idpStageHoverText')}
    isHidden={!isEnabled}
    isDisabled={false}
    isApproval={false}
  />
)

export function registerIDPPipelineStage(): void {
  stagesCollection.registerStageFactory(StageType.IDP, getStageAttributes, getStageEditorImplementation)
}
