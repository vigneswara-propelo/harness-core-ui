/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { RUNTIME_INPUT_VALUE, SelectOption } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import { useGetAllTargets } from 'services/cf'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  CFPipelineInstructionType,
  FeatureFlagConfigurationInstruction
} from '@cf/components/PipelineSteps/FlagConfigurationStep/types'
import type { SubSectionComponent } from '../../subSection.types'
import { useFlagChanges } from '../../../FlagChangesContextProvider'
import ServeVariationToItems from '../ServeVariationToItems/ServeVariationToItems'

export const serveVariationToTargetsSchema = (getString: UseStringsReturn['getString']): Yup.Schema<unknown> =>
  Yup.object({
    spec: Yup.object({
      variation: Yup.string().required(getString('cf.shared.variationRequired')),
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
  const { mode, environmentIdentifier, initialInstructions } = useFlagChanges()
  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()

  const { data: targetsData, refetch: fetchTargets } = useGetAllTargets({
    queryParams: { accountIdentifier, orgIdentifier, projectIdentifier, environmentIdentifier },
    lazy: true,
    debounce: 200
  })

  const fetchItems = useCallback(() => {
    if (accountIdentifier && orgIdentifier && projectIdentifier && environmentIdentifier) {
      fetchTargets({
        queryParams: {
          accountIdentifier,
          orgIdentifier,
          projectIdentifier,
          environmentIdentifier
        }
      })
    }
  }, [accountIdentifier, environmentIdentifier, fetchTargets, orgIdentifier, projectIdentifier])

  const targets = useMemo<SelectOption[]>(
    () => (targetsData?.targets || []).map(({ name, identifier }) => ({ label: name, value: identifier })),
    [targetsData]
  )

  const onQueryChange = useCallback(
    (query: string) => {
      fetchTargets({
        queryParams: { accountIdentifier, orgIdentifier, projectIdentifier, environmentIdentifier, targetName: query }
      })
    },
    [accountIdentifier, environmentIdentifier, fetchTargets, orgIdentifier, projectIdentifier]
  )

  const displayVariationField = useMemo<boolean>(
    () =>
      mode !== StepViewType.DeploymentForm ||
      (Array.isArray(initialInstructions) && initialInstructions.some(instruction => hasVariationRuntime(instruction))),
    [initialInstructions, mode]
  )

  const displayTargetsField = useMemo<boolean>(
    () =>
      mode !== StepViewType.DeploymentForm ||
      (Array.isArray(initialInstructions) && initialInstructions.some(instruction => hasTargetsRuntime(instruction))),
    [initialInstructions, mode]
  )

  return (
    <ServeVariationToItems
      prefixPath={prefixPath}
      items={targets}
      fetchItems={fetchItems}
      displayItemsField={displayTargetsField}
      displayVariationField={displayVariationField}
      onQueryChange={onQueryChange}
      instructionType={CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP}
      {...props}
    />
  )
}

ServeVariationToTargets.stringIdentifier = 'cf.shared.serveVariationToTargets'

export default ServeVariationToTargets
