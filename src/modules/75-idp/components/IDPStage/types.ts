/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { tagsType } from '@harness/uicore'
import { TemplateDetailsResponseWrapper } from '@modules/70-pipeline/utils/templateUtils'
import { IDPStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'

export interface IDPStageMinimalValues {
  identifier: string
  name: string
  description?: string
  tags?: tagsType
}

export interface IDPStageMinimalModeProps {
  data?: StageElementWrapper<IDPStageElementConfig>
  template?: TemplateDetailsResponseWrapper
  onSubmit?: (values: StageElementWrapper<IDPStageElementConfig>, identifier: string) => void
  onChange?: (values: IDPStageMinimalValues) => void
}
