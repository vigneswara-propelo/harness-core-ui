/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Segment, Target, TargetAttributesResponse, Variation } from 'services/cf'
import type { FeatureFlagConfigurationInstruction, FlagConfigurationStepData } from '../../../types'
import { CFPipelineInstructionType } from '../../../types'

export const mockTargets = [
  { identifier: 't1', name: 'Target 1' },
  { identifier: 't2', name: 'Target 2' },
  { identifier: 't3', name: 'Target 3' }
] as Target[]

export const mockTargetGroups = [
  { identifier: 'tg1', name: 'TargetGroup 1' },
  { identifier: 'tg2', name: 'TargetGroup 2' },
  { identifier: 'tg3', name: 'TargetGroup 3' }
] as Segment[]

export const mockVariations = [
  { identifier: 'v1', name: 'Variation 1' },
  { identifier: 'v2' },
  { identifier: 'v3', name: 'Variation 3' }
] as Variation[]

export const mockTargetAttributes: TargetAttributesResponse = ['ta1', 'ta2', 'ta3']

export const prefixInstructionField = (fieldName: string): string => `spec.instructions[0].${fieldName}`

export const mockFieldValues = ({
  type,
  identifier = 'RandomId',
  spec
}: {
  type: CFPipelineInstructionType
  identifier?: string
  spec: FeatureFlagConfigurationInstruction['spec']
}): FlagConfigurationStepData => ({
  identifier: 'step',
  name: 'step',
  type: 'type',
  spec: {
    feature: 'feature',
    environment: 'env',
    instructions: [
      {
        type,
        identifier,
        spec
      }
    ]
  }
})

export const mockServeVariationToTargetGroupsFieldValues = (
  targetGroups: Segment[],
  variation: Variation
): FlagConfigurationStepData =>
  mockFieldValues({
    type: CFPipelineInstructionType.ADD_SEGMENT_TO_VARIATION_TARGET_MAP,
    spec: {
      segments: targetGroups.map(({ identifier }) => identifier),
      variation: variation.identifier
    }
  })

export const mockServeVariationToIndividualTargetFieldValues = (
  targets: Target[],
  variation: Variation
): FlagConfigurationStepData =>
  mockFieldValues({
    type: CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP,
    spec: {
      targets: targets.map(({ identifier }) => identifier),
      variation: variation.identifier
    }
  })

export const mockServePercentageRolloutFieldValues = (variations: Variation[]): FlagConfigurationStepData =>
  mockFieldValues({
    type: CFPipelineInstructionType.ADD_RULE,
    spec: {
      priority: 100,
      distribution: {
        clauses: [{ op: 'segmentMatch', attribute: '' }],
        variations: variations.map(({ identifier }) => ({
          variation: identifier,
          weight: Math.floor(100 / variations.length)
        }))
      }
    }
  })

export const mockSetFlagSwitchFieldValues = (state: 'on' | 'off' = 'on'): FlagConfigurationStepData =>
  mockFieldValues({ type: CFPipelineInstructionType.SET_FEATURE_FLAG_STATE, spec: { state } })

export const mockDefaultRulesFieldValues = (on: Variation, off: Variation): FlagConfigurationStepData =>
  mockFieldValues({
    type: CFPipelineInstructionType.SET_DEFAULT_VARIATIONS,
    spec: {
      on: on.identifier,
      off: off.identifier
    }
  })

export const getProfileInitials = (str: string): string =>
  str
    .split(' ')
    .map(([firstLetter]) => firstLetter.toUpperCase())
    .join('')
