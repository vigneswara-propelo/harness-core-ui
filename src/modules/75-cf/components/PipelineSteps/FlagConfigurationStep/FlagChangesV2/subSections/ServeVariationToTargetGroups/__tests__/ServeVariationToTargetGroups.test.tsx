/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { cloneDeep } from 'lodash-es'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import * as cfServices from 'services/cf'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import MockFeature from '@cf/utils/testData/data/mockFeature'
import {
  CFPipelineInstructionType,
  FeatureFlagConfigurationInstruction
} from '@cf/components/PipelineSteps/FlagConfigurationStep/types'
import { mockTargetGroups } from '../../__tests__/utils.mocks'
import { SubSectionComponentProps } from '../../../subSection.types'
import SubSectionTestWrapper, { SubSectionTestWrapperProps } from '../../__tests__/SubSectionTestWrapper.mock'
import ServeVariationToTargetGroups, {
  hasServeVariationToTargetGroupsRuntime,
  serveVariationToTargetGroupsSchema
} from '../ServeVariationToTargetGroups'

const renderComponent = (
  props: Partial<SubSectionComponentProps> = {},
  testWrapperProps: Partial<SubSectionTestWrapperProps> = {}
): RenderResult =>
  render(
    <SubSectionTestWrapper {...testWrapperProps}>
      <ServeVariationToTargetGroups prefixPath="test" title="Serve variation to target groups" {...props} />
    </SubSectionTestWrapper>
  )

describe('ServeVariationToTargetGroups', () => {
  const useGetAllSegmentsMock = jest.spyOn(cfServices, 'useGetAllSegments')

  beforeEach(() => {
    useGetAllSegmentsMock.mockReturnValue({
      data: { segments: mockTargetGroups },
      loading: false,
      refetch: jest.fn()
    } as any)
  })

  describe('runtime', () => {
    const runtimeInstruction: FeatureFlagConfigurationInstruction = {
      identifier: 'test',
      type: CFPipelineInstructionType.ADD_SEGMENT_TO_VARIATION_TARGET_MAP,
      spec: { variation: RUNTIME_INPUT_VALUE, segments: RUNTIME_INPUT_VALUE }
    }

    test('it should not display the variation when not set as runtime', async () => {
      const instruction = cloneDeep(runtimeInstruction)
      instruction.spec.variation = 'abc'

      renderComponent({}, { flag: MockFeature, mode: StepViewType.DeploymentForm, initialInstructions: [instruction] })

      expect(screen.queryByPlaceholderText('cf.pipeline.flagConfiguration.selectVariation')).not.toBeInTheDocument()
    })

    test('it should not display target groups when not set as runtime', async () => {
      const instruction = cloneDeep(runtimeInstruction)
      instruction.spec.segments = ['a', 'b', 'c']

      renderComponent({}, { flag: MockFeature, mode: StepViewType.DeploymentForm, initialInstructions: [instruction] })

      expect(screen.queryByText('cf.pipeline.flagConfiguration.toTargetGroups')).not.toBeInTheDocument()
    })

    test('it should display a dropdown with all flag variations', async () => {
      const flag = cloneDeep(MockFeature)
      flag.variations = [
        { name: 'Variation A', identifier: 'varA', value: 'varA' },
        { name: 'Variation B', identifier: 'varB', value: 'varB' },
        { name: 'Variation C', identifier: 'varC', value: 'varC' }
      ]

      renderComponent(
        {},
        {
          flag,
          mode: StepViewType.DeploymentForm,
          initialInstructions: [runtimeInstruction]
        }
      )

      await userEvent.click(await screen.findByPlaceholderText('cf.pipeline.flagConfiguration.selectVariation'))

      for (const variation of flag.variations) {
        expect(await screen.findByText(variation.name!)).toBeInTheDocument()
      }
    })

    test('it should display a disabled input when set as read only', async () => {
      const flag = cloneDeep(MockFeature)
      flag.variations = [
        { name: 'Variation A', identifier: 'varA', value: 'varA' },
        { name: 'Variation B', identifier: 'varB', value: 'varB' },
        { name: 'Variation C', identifier: 'varC', value: 'varC' }
      ]

      renderComponent(
        {},
        { flag, mode: StepViewType.DeploymentForm, readonly: true, initialInstructions: [runtimeInstruction] }
      )

      expect(await screen.findByPlaceholderText('cf.pipeline.flagConfiguration.selectVariation')).toBeDisabled()
    })
  })
})

describe('serveVariationToTargetGroupsSchema', () => {
  test('it should throw when variation is not set', async () => {
    const schema = serveVariationToTargetGroupsSchema(str => str)

    expect(() => schema.validateSync({ spec: { segments: ['a', 'b', 'c'] } })).toThrow('cf.shared.variationRequired')
  })

  test('it should throw when variation is empty', async () => {
    const schema = serveVariationToTargetGroupsSchema(str => str)

    expect(() => schema.validateSync({ spec: { variation: '', segments: ['a', 'b', 'c'] } })).toThrow(
      'cf.shared.variationRequired'
    )
  })

  test('it should throw when segments is not set', async () => {
    const schema = serveVariationToTargetGroupsSchema(str => str)

    expect(() => schema.validateSync({ spec: { variation: 'test' } })).toThrow(
      'cf.featureFlags.flagPipeline.validation.serveVariationToTargetGroups.segments'
    )
  })

  test('it should throw when segments is empty', async () => {
    const schema = serveVariationToTargetGroupsSchema(str => str)

    expect(() => schema.validateSync({ spec: { variation: 'test', segments: [] } })).toThrow(
      'cf.featureFlags.flagPipeline.validation.serveVariationToTargetGroups.segments'
    )

    expect(() => schema.validateSync({ spec: { variation: 'test', segments: '' } })).toThrow(
      'cf.featureFlags.flagPipeline.validation.serveVariationToTargetGroups.segments'
    )
  })

  test('it should not throw when variation and segments are set', async () => {
    const schema = serveVariationToTargetGroupsSchema(str => str)

    expect(() => schema.validateSync({ spec: { variation: 'test', segments: ['a', 'b', 'c'] } })).not.toThrow()
  })
})

describe('hasServeVariationToTargetGroupsRuntime', () => {
  test('it should return true when the instruction is a segment variation target map rule and the variation is set as runtime', async () => {
    expect(
      hasServeVariationToTargetGroupsRuntime({
        identifier: 'test',
        type: CFPipelineInstructionType.ADD_SEGMENT_TO_VARIATION_TARGET_MAP,
        spec: { variation: RUNTIME_INPUT_VALUE, segments: ['a', 'b', 'c'] }
      })
    ).toBeTruthy()
  })

  test('it should return true when the instruction is a segment variation target map rule and segments is set as runtime', async () => {
    expect(
      hasServeVariationToTargetGroupsRuntime({
        identifier: 'test',
        type: CFPipelineInstructionType.ADD_SEGMENT_TO_VARIATION_TARGET_MAP,
        spec: { variation: 'test', segments: RUNTIME_INPUT_VALUE }
      })
    ).toBeTruthy()
  })

  test('it should return false when the instruction is a segment variation target map rule and neither the variation nor segments are set as runtime', async () => {
    expect(
      hasServeVariationToTargetGroupsRuntime({
        identifier: 'test',
        type: CFPipelineInstructionType.ADD_SEGMENT_TO_VARIATION_TARGET_MAP,
        spec: { variation: 'test', segments: ['a', 'b', 'c'] }
      })
    ).toBeFalsy()
  })

  test('it should return false when the instruction is not a segment variation target map rule and the variation is set as runtime', async () => {
    expect(
      hasServeVariationToTargetGroupsRuntime({
        identifier: 'test',
        type: CFPipelineInstructionType.SET_FEATURE_FLAG_STATE,
        spec: { variation: RUNTIME_INPUT_VALUE }
      })
    ).toBeFalsy()
  })
})
