/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { UseStringsReturn } from 'framework/strings'
import {
  CFPipelineInstructionType,
  FeatureFlagConfigurationInstruction
} from '@cf/components/PipelineSteps/FlagConfigurationStep/types'
import { SubSectionComponent } from '../../subSection.types'
import DefaultRule from '../DefaultRule/DefaultRule'

export const defaultOnRuleSchema = (getString: UseStringsReturn['getString']): Yup.Schema<unknown> =>
  Yup.object({
    spec: Yup.object({
      variation: Yup.string().required(getString('cf.featureFlags.flagPipeline.validation.defaultOnRule.onVariation'))
    })
  })

export const hasDefaultOnRuleRuntime = (instruction: FeatureFlagConfigurationInstruction): boolean =>
  instruction.type === CFPipelineInstructionType.SET_DEFAULT_ON_VARIATION &&
  instruction.spec.variation === RUNTIME_INPUT_VALUE

const DefaultOnRule: SubSectionComponent = props => {
  return <DefaultRule instructionType={CFPipelineInstructionType.SET_DEFAULT_ON_VARIATION} {...props} />
}

DefaultOnRule.stringIdentifier = 'cf.pipeline.flagConfiguration.setDefaultOnRule'

export default DefaultOnRule
