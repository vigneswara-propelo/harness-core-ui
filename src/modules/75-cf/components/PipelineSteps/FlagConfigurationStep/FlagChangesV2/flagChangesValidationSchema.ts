/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Yup from 'yup'
import { CFPipelineInstructionType } from '@cf/components/PipelineSteps/FlagConfigurationStep/types'
import type { UseStringsReturn } from 'framework/strings'
import { setFlagSwitchSchema } from './subSections/SetFlagSwitch/SetFlagSwitch'
import { defaultOnRuleSchema } from './subSections/DefaultOnRule/DefaultOnRule'
import { defaultOffRuleSchema } from './subSections/DefaultOffRule/DefaultOffRule'
import { serveVariationToTargetsSchema } from './subSections/ServeVariationToTargets/ServeVariationToTargets'
import { serveVariationToTargetGroupsSchema } from './subSections/ServeVariationToTargetGroups/ServeVariationToTargetGroups'

const flagChangesValidationSchema = (getString: UseStringsReturn['getString']): Yup.Schema<unknown> =>
  Yup.array().of(
    Yup.lazy<any>(instruction => {
      switch (instruction.type) {
        case CFPipelineInstructionType.SET_DEFAULT_ON_VARIATION:
          return defaultOnRuleSchema(getString)
        case CFPipelineInstructionType.SET_DEFAULT_OFF_VARIATION:
          return defaultOffRuleSchema(getString)
        // case CFPipelineInstructionType.ADD_RULE:
        //   return servePercentageRolloutSchema(getString)
        case CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP:
          return serveVariationToTargetsSchema(getString)
        case CFPipelineInstructionType.ADD_SEGMENT_TO_VARIATION_TARGET_MAP:
          return serveVariationToTargetGroupsSchema(getString)
        case CFPipelineInstructionType.SET_FEATURE_FLAG_STATE:
          return setFlagSwitchSchema(getString)
      }

      return Yup.string()
    })
  )

export default flagChangesValidationSchema
