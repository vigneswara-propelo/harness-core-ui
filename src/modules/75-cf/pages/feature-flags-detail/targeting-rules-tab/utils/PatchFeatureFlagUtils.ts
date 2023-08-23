/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { isEqual } from 'lodash-es'
import type { FeatureState } from 'services/cf'
import patch from '@cf/utils/instructions'
import {
  FormVariationMap,
  VariationTargetGroup,
  TargetingRuleItemType,
  TargetingRulesFormValues,
  VariationPercentageRollout,
  VariationTargetGroups
} from '../types'

// Utils class to help encapsulate the complexity around patch instruction creation and hide this from the components.
interface PatchFeatureFlagUtilsReturn {
  hasFlagStateChanged: () => boolean
  hasDefaultOnVariationChanged: () => boolean
  hasDefaultOffVariationChanged: () => boolean
  addedTargetGroups: (variationIdentifier: string) => VariationTargetGroup[]
  removedTargetGroups: (variationIdentifier: string) => VariationTargetGroup[]
  updatedTargetGroups: (variationIdentifier: string) => VariationTargetGroups[]
  addedTargets: (variationIdentifier: string) => string[]
  removedTargets: (variationIdentifier: string) => string[]
  updatedPercentageRollouts: () => VariationPercentageRollout[]
  createUpdateFlagStateInstruction: () => void
  createDefaultServeOnInstruction: () => void
  createDefaultServeOffInstruction: () => void
  createAddTargetGroupInstructions: (
    variationIdentifier: string,
    targetGroups: VariationTargetGroup[],
    position: number
  ) => void
  createUpdateTargetGroupsInstructions: (variationIdentifier: string, targetGroups: VariationTargetGroups[]) => void
  createRemoveTargetGroupsInstructions: (targetGroups: VariationTargetGroup[]) => void
  createAddTargetsInstructions: (variationIdentifier: string, targetIds: string[]) => void
  createRemoveTargetsInstructions: (variationIdentifier: string, targetIds: string[]) => void
  createAddPercentageRolloutInstructions: (percentageRollout: VariationPercentageRollout, index: number) => void
  createUpdatePercentageRolloutInstructions: (percentageRollouts: VariationPercentageRollout[]) => void
  createRemovePercentageRolloutInstruction: (percentageRollout: VariationPercentageRollout) => void
}

export const PatchFeatureFlagUtils = (
  submittedValues: TargetingRulesFormValues,
  initialValues: TargetingRulesFormValues
): PatchFeatureFlagUtilsReturn => {
  const initialPercentageRollouts = initialValues.targetingRuleItems.filter(
    targetingRule => targetingRule.type === TargetingRuleItemType.PERCENTAGE_ROLLOUT
  ) as VariationPercentageRollout[]

  const submittedPercentageRollouts = submittedValues.targetingRuleItems.filter(
    targetingRule => targetingRule.type === TargetingRuleItemType.PERCENTAGE_ROLLOUT
  ) as VariationPercentageRollout[]

  const initialVariations = initialValues.targetingRuleItems.filter(
    targetingRule => targetingRule.type === TargetingRuleItemType.VARIATION
  ) as FormVariationMap[]

  const submittedVariations = submittedValues.targetingRuleItems.filter(
    targetingRule => targetingRule.type === TargetingRuleItemType.VARIATION
  ) as FormVariationMap[]

  const hasFlagStateChanged = (): boolean => submittedValues.state !== initialValues.state

  const hasDefaultOnVariationChanged = (): boolean => submittedValues.onVariation !== initialValues.onVariation

  const hasDefaultOffVariationChanged = (): boolean => submittedValues.offVariation !== initialValues.offVariation

  const addedTargetGroups = (variationIdentifier: string): VariationTargetGroup[] => {
    const initialTargetGroups: VariationTargetGroup[] =
      initialVariations.find(x => x.variationIdentifier === variationIdentifier)?.targetGroups || []
    const submittedTargetGroups: VariationTargetGroup[] =
      submittedVariations.find(x => x.variationIdentifier === variationIdentifier)?.targetGroups || []

    return submittedTargetGroups.filter(
      submittedTargetGroup => !initialTargetGroups.map(({ label }) => label).includes(submittedTargetGroup.label)
    )
  }

  const removedTargetGroups = (variationIdentifier: string): VariationTargetGroup[] => {
    const initialTargetGroups: VariationTargetGroup[] =
      initialVariations.find(x => x.variationIdentifier === variationIdentifier)?.targetGroups || []
    const submittedTargetGroups: VariationTargetGroup[] =
      submittedVariations.find(x => x.variationIdentifier === variationIdentifier)?.targetGroups || []

    return (
      initialTargetGroups
        // get groups that aren't in the form submission
        .filter(targetGroup => !submittedTargetGroups.map(({ value }) => value).includes(targetGroup.value))
        // exclude groups that share a ruleId with a non-removed group
        .filter(
          targetGroup =>
            !submittedTargetGroups.find(tg => tg.ruleId === targetGroup.ruleId && tg.value !== targetGroup.value)
        )
    )
  }

  const updatedTargetGroups = (variationIdentifier: string): VariationTargetGroups[] => {
    const initialTargetGroups: VariationTargetGroup[] =
      initialVariations.find(x => x.variationIdentifier === variationIdentifier)?.targetGroups || []
    const submittedTargetGroups: VariationTargetGroup[] =
      submittedVariations.find(x => x.variationIdentifier === variationIdentifier)?.targetGroups || []

    return (
      initialTargetGroups
        // get groups that aren't in the form submission
        .filter(targetGroup => !submittedTargetGroups.map(({ value }) => value).includes(targetGroup.value))
        // exclude groups that do not share a ruleId with a non-removed group
        .filter(targetGroup =>
          submittedTargetGroups.find(tg => tg.ruleId === targetGroup.ruleId && tg.value !== targetGroup.value)
        )
        // gather grouped rules into one
        .reduce<VariationTargetGroups[]>((updatedRules, targetGroup) => {
          let currentRule = updatedRules.find(({ ruleId }) => ruleId === targetGroup.ruleId)
          if (!currentRule) {
            currentRule = {
              priority: targetGroup.priority,
              ruleId: targetGroup.ruleId,
              values: initialTargetGroups
                .filter(initial => initial.ruleId === targetGroup.ruleId)
                .map(({ value }) => value)
            }

            updatedRules.push(currentRule)
          }

          currentRule.values = currentRule.values.filter(targetGroupId => targetGroupId !== targetGroup.value)

          return updatedRules
        }, [])
    )
  }

  const addedTargets = (variationIdentifier: string): string[] => {
    const initialTargetIds: string[] =
      initialVariations.find(x => x.variationIdentifier === variationIdentifier)?.targets.map(x => x.value) || []
    const submittedTargetIds: string[] =
      submittedVariations.find(x => x.variationIdentifier === variationIdentifier)?.targets.map(x => x.value) || []

    return submittedTargetIds.filter(id => !initialTargetIds.includes(id))
  }

  const removedTargets = (variationIdentifier: string): string[] => {
    const initialTargetIds: string[] =
      initialVariations.find(x => x.variationIdentifier === variationIdentifier)?.targets.map(x => x.value) || []
    const submittedTargetIds: string[] =
      submittedVariations.find(x => x.variationIdentifier === variationIdentifier)?.targets.map(x => x.value) || []

    return initialTargetIds.filter(id => !submittedTargetIds.includes(id))
  }

  const updatedPercentageRollouts = (): VariationPercentageRollout[] => {
    return submittedPercentageRollouts.length === initialPercentageRollouts.length
      ? submittedPercentageRollouts.filter(
          initial => !initialPercentageRollouts.some(submitted => isEqual(initial, submitted))
        )
      : []
  }

  // INSTRUCTIONS SECTION
  const createUpdateFlagStateInstruction = (): void =>
    patch.feature.addInstruction(patch.creators.setFeatureFlagState(submittedValues.state as FeatureState))

  const createDefaultServeOnInstruction = (): void =>
    patch.feature.addInstruction(patch.creators.updateDefaultServeByVariation(submittedValues.onVariation))

  const createDefaultServeOffInstruction = (): void =>
    patch.feature.addInstruction(patch.creators.updateOffVariation(submittedValues.offVariation))

  const createAddTargetGroupInstructions = (
    variationIdentifier: string,
    targetGroups: Pick<VariationTargetGroup, 'ruleId' | 'value'>[],
    priority: number
  ): void => {
    patch.feature.addAllInstructions(
      targetGroups.map((targetGroup, index) =>
        patch.creators.addRule({
          uuid: targetGroup.ruleId,
          priority: priority + index + 1,
          serve: {
            variation: variationIdentifier
          },
          clauses: [
            {
              op: 'segmentMatch',
              values: [targetGroup.value]
            }
          ]
        })
      )
    )
  }

  const createUpdateTargetGroupsInstructions = (
    variationIdentifier: string,
    targetGroups: VariationTargetGroups[]
  ): void => {
    // remove the old-style rules
    patch.feature.addAllInstructions(targetGroups.map(({ ruleId }) => patch.creators.removeRule(ruleId)))
    // add target groups to the variation map one at a time
    patch.feature.addAllInstructions(
      targetGroups
        .map(({ values }) =>
          values.map(value => patch.creators.addSegmentToVariationTargetMap(variationIdentifier, [value]))
        )
        .flat()
    )
  }

  const createRemoveTargetGroupsInstructions = (targetGroups: VariationTargetGroup[]): void => {
    patch.feature.addAllInstructions(
      targetGroups.map(targetGroup => patch.creators.removeRule(targetGroup.ruleId as string))
    )
  }

  const createAddTargetsInstructions = (variationIdentifier: string, targets: string[]): void => {
    patch.feature.addInstruction(patch.creators.addTargetsToVariationTargetMap(variationIdentifier, targets))
  }

  const createRemoveTargetsInstructions = (variationIdentifier: string, removedTargetIds: string[]): void => {
    patch.feature.addInstruction(
      patch.creators.removeTargetsToVariationTargetMap(variationIdentifier, removedTargetIds)
    )
  }

  const createAddPercentageRolloutInstructions = (
    percentageRollout: VariationPercentageRollout,
    index: number
  ): void => {
    patch.feature.addInstruction(
      patch.creators.addRule({
        uuid: percentageRollout.ruleId,
        priority: index + 1,
        serve: {
          distribution: {
            bucketBy: percentageRollout.bucketBy,
            variations: percentageRollout.variations
          }
        },
        clauses: [
          {
            op: 'segmentMatch',
            values: percentageRollout.clauses[0].values
          }
        ]
      })
    )
  }

  const createUpdatePercentageRolloutInstructions = (percentageRollouts: VariationPercentageRollout[]): void => {
    percentageRollouts.forEach(percentageRollout => {
      const { bucketBy, variations } = percentageRollout

      patch.feature.addInstruction(
        patch.creators.updateRuleVariation(percentageRollout.ruleId as string, { bucketBy, variations })
      )
      const { attribute, negate, op, id, values } = percentageRollout.clauses[0]
      patch.feature.addInstruction(
        patch.creators.updateClause(percentageRollout.ruleId as string, id as string, {
          attribute,
          negate,
          op,
          values
        })
      )
    })
  }

  const createRemovePercentageRolloutInstruction = (percentageRollout: VariationPercentageRollout): void => {
    patch.feature.addInstruction(patch.creators.removeRule(percentageRollout.ruleId as string))
  }

  return {
    hasFlagStateChanged,
    hasDefaultOnVariationChanged,
    hasDefaultOffVariationChanged,
    createUpdateFlagStateInstruction,
    addedTargetGroups,
    removedTargetGroups,
    updatedTargetGroups,
    addedTargets,
    removedTargets,
    updatedPercentageRollouts,
    createDefaultServeOnInstruction,
    createDefaultServeOffInstruction,
    createAddTargetGroupInstructions,
    createUpdateTargetGroupsInstructions,
    createRemoveTargetGroupsInstructions,
    createAddTargetsInstructions,
    createRemoveTargetsInstructions,
    createAddPercentageRolloutInstructions,
    createUpdatePercentageRolloutInstructions,
    createRemovePercentageRolloutInstruction
  }
}
