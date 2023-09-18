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
import { Feature } from 'services/cf'
import { FeatureFlagConfigurationInstruction, FlagConfigurationStepFormDataValues } from '../types'
import { SubSectionComponent, subSectionNames } from './subSection.types'
import SubSections from './SubSections'

// sub-sections
import SetFlagSwitch from './subSections/SetFlagSwitch'

export const allSubSections: SubSectionComponent[] = [
  SetFlagSwitch
  // DefaultRules,
  // ServeVariationToIndividualTarget,
  // ServeVariationToTargetGroup,
  // ServePercentageRollout
]

export interface FlagChangesFormProps {
  prefix: (fieldName: string) => string
  initialInstructions?: FeatureFlagConfigurationInstruction[]
  selectedFeature?: Feature
}

const FlagChangesForm: FC<FlagChangesFormProps> = ({ prefix, initialInstructions }) => {
  const { getString } = useStrings()
  const { setFieldValue, values } = useFormikContext<FlagConfigurationStepFormDataValues>()

  const [subSections, setSubSections] = useState<SubSectionComponent[]>(() => {
    if (!Array.isArray(initialInstructions) || initialInstructions.length === 0) {
      return []
    }

    return [
      ...new Set(
        initialInstructions.map(instruction => {
          switch (instruction.type) {
            // case CFPipelineInstructionType.SET_DEFAULT_ON_VARIATION:
            // case CFPipelineInstructionType.SET_DEFAULT_OFF_VARIATION:
            // case CFPipelineInstructionType.SET_DEFAULT_VARIATIONS:
            //   return DefaultRules
            // case CFPipelineInstructionType.ADD_RULE:
            //   return ServePercentageRollout
            // case CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP:
            //   return ServeVariationToIndividualTarget
            // case CFPipelineInstructionType.ADD_SEGMENT_TO_VARIATION_TARGET_MAP:
            //   return ServeVariationToTargetGroup
            // case CFPipelineInstructionType.SET_FEATURE_FLAG_STATE:
            default:
              return SetFlagSwitch
          }
        })
      )
    ]
  })

  const availableSubSections = useMemo<SubSectionComponent[]>(
    () => allSubSections.filter(section => !subSections.includes(section)),
    [subSections]
  )

  const onAddSubSection = useCallback((subSection: SubSectionComponent): void => {
    setSubSections(currentSubSections => [...currentSubSections, subSection])
  }, [])

  const removeSubSection = (subSection: SubSectionComponent): void => {
    setSubSections(currentSubSections => {
      const subSectionIndex = currentSubSections.indexOf(subSection)

      const path = prefix('spec.instructions')
      const instructions = get(values, path)
      instructions.splice(subSectionIndex, 1)
      setFieldValue(path, instructions)

      return currentSubSections.filter((_, index) => index !== subSectionIndex)
    })
  }

  return (
    <>
      <SubSections prefix={prefix} subSections={subSections} onRemove={removeSubSection} />

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
                  text={getString(subSectionNames[subSection.name])}
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
