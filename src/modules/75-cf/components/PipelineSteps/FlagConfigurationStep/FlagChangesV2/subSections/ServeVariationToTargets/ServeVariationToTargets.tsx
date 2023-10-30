/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import { useFormikContext } from 'formik'
import * as Yup from 'yup'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { UseStringsReturn } from 'framework/strings'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  CFPipelineInstructionType,
  FeatureFlagConfigurationInstruction
} from '@cf/components/PipelineSteps/FlagConfigurationStep/types'
import SubSection from '../../SubSection'
import { SubSectionComponent } from '../../subSection.types'
import { withPrefix } from '../../utils/withPrefix'
import { useFlagChanges } from '../../../FlagChangesContextProvider'
import VariationField from './VariationField'
import TargetsField from './TargetsField'

export const serveVariationToTargetsSchema = (getString: UseStringsReturn['getString']): Yup.Schema<unknown> =>
  Yup.object({
    spec: Yup.object({
      variation: Yup.string().required(
        getString('cf.featureFlags.flagPipeline.validation.serveVariationToTargets.variation')
      ),
      targets: Yup.lazy(val =>
        (Array.isArray(val) ? Yup.array().of(Yup.string()) : Yup.string()).required(
          getString('cf.featureFlags.flagPipeline.validation.serveVariationToTargets.targets')
        )
      )
    })
  })

const hasVariationRuntime = (instruction: FeatureFlagConfigurationInstruction): boolean =>
  instruction.type === CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP &&
  instruction.spec.variation === RUNTIME_INPUT_VALUE

const hasTargetsRuntime = (instruction: FeatureFlagConfigurationInstruction): boolean =>
  instruction.type === CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP &&
  instruction.spec.targets === RUNTIME_INPUT_VALUE

export const hasServeVariationToTargetsRuntime = (instruction: FeatureFlagConfigurationInstruction): boolean =>
  hasVariationRuntime(instruction) || hasTargetsRuntime(instruction)

const ServeVariationToTargets: SubSectionComponent = ({ prefixPath, ...props }) => {
  const { setFieldValue } = useFormikContext()
  const { mode, initialInstructions } = useFlagChanges()

  useEffect(() => {
    setFieldValue(
      withPrefix(prefixPath, 'identifier'),
      `${CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP}Identifier`
    )
    setFieldValue(withPrefix(prefixPath, 'type'), CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP)
  }, [prefixPath, setFieldValue])

  const displayVariationField = useMemo<boolean>(
    () =>
      mode !== StepViewType.DeploymentForm ||
      !!initialInstructions?.some(instruction => hasVariationRuntime(instruction)),
    [initialInstructions, mode]
  )

  const displayTargetsField = useMemo<boolean>(
    () =>
      mode !== StepViewType.DeploymentForm ||
      !!initialInstructions?.some(instruction => hasTargetsRuntime(instruction)),
    [initialInstructions, mode]
  )

  return (
    <SubSection data-testid="flagChanges-serveVariationToTargets" {...props}>
      {displayVariationField && <VariationField prefixPath={prefixPath} />}
      {displayTargetsField && <TargetsField prefixPath={prefixPath} />}
    </SubSection>
  )
}

export default ServeVariationToTargets
