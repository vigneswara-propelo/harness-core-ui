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
import { useGetAllSegments } from 'services/cf'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  CFPipelineInstructionType,
  FeatureFlagConfigurationInstruction
} from '@cf/components/PipelineSteps/FlagConfigurationStep/types'
import type { SubSectionComponent } from '../../subSection.types'
import { useFlagChanges } from '../../../FlagChangesContextProvider'
import ServeVariationToItems from '../ServeVariationToItems/ServeVariationToItems'

export const serveVariationToTargetGroupsSchema = (getString: UseStringsReturn['getString']): Yup.Schema<unknown> =>
  Yup.object({
    spec: Yup.object({
      variation: Yup.string().required(getString('cf.shared.variationRequired')),
      segments: Yup.lazy(val =>
        (Array.isArray(val) ? Yup.array().of(Yup.string()) : Yup.string()).required(
          getString('cf.featureFlags.flagPipeline.validation.serveVariationToTargetGroups.segments')
        )
      )
    })
  })

const hasVariationRuntime = (instruction: FeatureFlagConfigurationInstruction): boolean =>
  instruction.type === CFPipelineInstructionType.ADD_SEGMENT_TO_VARIATION_TARGET_MAP &&
  instruction.spec.variation === RUNTIME_INPUT_VALUE

const hasTargetGroupsRuntime = (instruction: FeatureFlagConfigurationInstruction): boolean =>
  instruction.type === CFPipelineInstructionType.ADD_SEGMENT_TO_VARIATION_TARGET_MAP &&
  instruction.spec.segments === RUNTIME_INPUT_VALUE

export const hasServeVariationToTargetGroupsRuntime = (instruction: FeatureFlagConfigurationInstruction): boolean =>
  hasVariationRuntime(instruction) || hasTargetGroupsRuntime(instruction)

const ServeVariationToTargetGroups: SubSectionComponent = ({ prefixPath, ...props }) => {
  const { mode, environmentIdentifier, initialInstructions } = useFlagChanges()
  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()

  const { data: targetGroupsData, refetch: fetchTargetGroups } = useGetAllSegments({
    queryParams: { accountIdentifier, orgIdentifier, projectIdentifier, environmentIdentifier },
    lazy: true,
    debounce: 200
  })

  const fetchItems = useCallback(() => {
    if (accountIdentifier && orgIdentifier && projectIdentifier && environmentIdentifier) {
      fetchTargetGroups({
        queryParams: {
          accountIdentifier,
          orgIdentifier,
          projectIdentifier,
          environmentIdentifier
        }
      })
    }
  }, [accountIdentifier, environmentIdentifier, fetchTargetGroups, orgIdentifier, projectIdentifier])

  const targetGroups = useMemo<SelectOption[]>(
    () => (targetGroupsData?.segments || []).map(({ name, identifier }) => ({ label: name, value: identifier })),
    [targetGroupsData]
  )

  const onQueryChange = useCallback(
    (query: string) => {
      fetchTargetGroups({
        queryParams: { accountIdentifier, orgIdentifier, projectIdentifier, environmentIdentifier, name: query }
      })
    },
    [accountIdentifier, environmentIdentifier, fetchTargetGroups, orgIdentifier, projectIdentifier]
  )

  const displayVariationField = useMemo<boolean>(
    () =>
      mode !== StepViewType.DeploymentForm ||
      !!initialInstructions?.some(instruction => hasVariationRuntime(instruction)),
    [initialInstructions, mode]
  )

  const displayTargetGroupsField = useMemo<boolean>(
    () =>
      mode !== StepViewType.DeploymentForm ||
      !!initialInstructions?.some(instruction => hasTargetGroupsRuntime(instruction)),
    [initialInstructions, mode]
  )

  return (
    <ServeVariationToItems
      prefixPath={prefixPath}
      items={targetGroups}
      fetchItems={fetchItems}
      displayItemsField={displayTargetGroupsField}
      displayVariationField={displayVariationField}
      onQueryChange={onQueryChange}
      instructionType={CFPipelineInstructionType.ADD_SEGMENT_TO_VARIATION_TARGET_MAP}
      {...props}
    />
  )
}

export default ServeVariationToTargetGroups
