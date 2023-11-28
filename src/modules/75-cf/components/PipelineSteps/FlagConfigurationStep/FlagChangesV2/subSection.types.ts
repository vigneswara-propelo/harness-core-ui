/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FC } from 'react'
import type { StringKeys } from 'framework/strings'
import type { SubSectionProps } from './SubSection'

export interface SubSectionComponentProps extends Omit<SubSectionProps, 'children'> {
  prefixPath: string
}
export type SubSectionComponent = FC<SubSectionComponentProps>

export const subSectionNames: Record<string, StringKeys> = {
  SetFlagSwitch: 'cf.pipeline.flagConfiguration.setFlagSwitch',
  DefaultOnRule: 'cf.pipeline.flagConfiguration.setDefaultOnRule',
  DefaultOffRule: 'cf.pipeline.flagConfiguration.setDefaultOffRule',
  ServeVariationToTargets: 'cf.shared.serveVariationToTargets',
  ServeVariationToTargetGroups: 'cf.shared.serveVariationToTargetGroups',
  ServePercentageRolloutToTargetGroup: 'cf.shared.servePercentageRolloutToTargetGroup'
}
