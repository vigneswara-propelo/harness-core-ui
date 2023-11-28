/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useCallback, useMemo, useState } from 'react'
import { get } from 'lodash-es'
import { useFormikContext } from 'formik'
import { Button, ButtonVariation } from '@harness/uicore'
import { Menu } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  CFPipelineInstructionType,
  FeatureFlagConfigurationInstruction,
  FlagConfigurationStepFormDataValues
} from '../types'
import { SubSectionComponent } from './subSection.types'
import SubSections from './SubSections'
import { useFlagChanges } from '../FlagChangesContextProvider'
import { withPrefix } from './utils/withPrefix'

// sub-sections
import SetFlagSwitch, { hasSetFlagSwitchRuntime } from './subSections/SetFlagSwitch/SetFlagSwitch'
import DefaultOnRule, { hasDefaultOnRuleRuntime } from './subSections/DefaultOnRule/DefaultOnRule'
import DefaultOffRule, { hasDefaultOffRuleRuntime } from './subSections/DefaultOffRule/DefaultOffRule'
import ServeVariationToTargets, {
  hasServeVariationToTargetsRuntime
} from './subSections/ServeVariationToTargets/ServeVariationToTargets'
import ServeVariationToTargetGroups, {
  hasServeVariationToTargetGroupsRuntime
} from './subSections/ServeVariationToTargetGroups/ServeVariationToTargetGroups'
import ServePercentageRolloutToTargetGroup, {
  hasServePercentageRolloutToTargetGroupRuntime
} from './subSections/ServePercentageRolloutToTargetGroup/ServePercentageRolloutToTargetGroup'

export const allSubSections: SubSectionComponent[] = [
  SetFlagSwitch,
  DefaultOnRule,
  DefaultOffRule,
  ServeVariationToTargets,
  ServeVariationToTargetGroups,
  ServePercentageRolloutToTargetGroup
]

export interface FlagChangesFormProps {
  prefixPath: string
  initialInstructions?: FeatureFlagConfigurationInstruction[]
}

const FlagChangesForm: FC<FlagChangesFormProps> = ({ prefixPath, initialInstructions }) => {
  const { getString } = useStrings()
  const { setFieldValue, values } = useFormikContext<FlagConfigurationStepFormDataValues>()
  const { mode } = useFlagChanges()

  const [subSections, setSubSections] = useState<SubSectionComponent[]>(() => {
    if (!Array.isArray(initialInstructions) || initialInstructions.length === 0) {
      return []
    }

    if (mode === StepViewType.DeploymentForm) {
      return initialInstructions.reduce<SubSectionComponent[]>((components, instruction) => {
        if (hasSetFlagSwitchRuntime(instruction)) {
          return [...components, SetFlagSwitch]
        }

        if (hasDefaultOnRuleRuntime(instruction)) {
          return [...components, DefaultOnRule]
        }

        if (hasDefaultOffRuleRuntime(instruction)) {
          return [...components, DefaultOffRule]
        }

        if (hasServeVariationToTargetsRuntime(instruction)) {
          return [...components, ServeVariationToTargets]
        }

        if (hasServeVariationToTargetGroupsRuntime(instruction)) {
          return [...components, ServeVariationToTargetGroups]
        }

        if (hasServePercentageRolloutToTargetGroupRuntime(instruction)) {
          return [...components, ServePercentageRolloutToTargetGroup]
        }

        return components
      }, [])
    }

    return [
      ...new Set(
        initialInstructions.map(instruction => {
          switch (instruction.type) {
            case CFPipelineInstructionType.SET_DEFAULT_ON_VARIATION:
              return DefaultOnRule
            case CFPipelineInstructionType.SET_DEFAULT_OFF_VARIATION:
              return DefaultOffRule
            case CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP:
              return ServeVariationToTargets
            case CFPipelineInstructionType.ADD_SEGMENT_TO_VARIATION_TARGET_MAP:
              return ServeVariationToTargetGroups
            case CFPipelineInstructionType.ADD_RULE:
              return ServePercentageRolloutToTargetGroup
            default:
              return SetFlagSwitch
          }
        })
      )
    ]
  })

  const availableSubSections = useMemo<SubSectionComponent[]>(
    () =>
      mode === StepViewType.DeploymentForm ? [] : allSubSections.filter(section => !subSections.includes(section)),
    [mode, subSections]
  )

  const onAddSubSection = useCallback((subSection: SubSectionComponent): void => {
    setSubSections(currentSubSections => [...currentSubSections, subSection])
  }, [])

  const removeSubSection = (subSection: SubSectionComponent): void => {
    setSubSections(currentSubSections => {
      const subSectionIndex = currentSubSections.indexOf(subSection)

      const path = withPrefix(prefixPath, 'spec.instructions')
      const instructions = get(values, path, [])
      instructions.splice(subSectionIndex, 1)
      setFieldValue(path, instructions)

      return currentSubSections.filter((_, index) => index !== subSectionIndex)
    })
  }

  return (
    <>
      <SubSections
        prefixPath={prefixPath}
        subSections={subSections}
        onRemove={mode === StepViewType.Edit ? removeSubSection : undefined}
      />

      {!!availableSubSections.length && (
        <Button
          variation={ButtonVariation.SECONDARY}
          icon="plus"
          rightIcon="chevron-down"
          text={getString('cf.pipeline.flagConfiguration.addFlagChange')}
          tooltipProps={{ interactionKind: 'click', usePortal: true, position: 'bottom-left', minimal: true }}
          tooltip={
            <Menu>
              {availableSubSections.map(subSection => (
                <Menu.Item
                  key={subSection.name}
                  text={getString(subSection.stringIdentifier)}
                  onClick={() => onAddSubSection(subSection)}
                />
              ))}
            </Menu>
          }
        />
      )}
    </>
  )
}

export default FlagChangesForm
