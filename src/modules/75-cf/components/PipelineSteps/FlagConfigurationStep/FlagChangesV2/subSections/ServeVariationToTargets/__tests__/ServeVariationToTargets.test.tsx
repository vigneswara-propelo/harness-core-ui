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
import { mockTargets } from '../../__tests__/utils.mocks'
import { SubSectionComponentProps } from '../../../subSection.types'
import SubSectionTestWrapper, { SubSectionTestWrapperProps } from '../../__tests__/SubSectionTestWrapper.mock'
import ServeVariationToTargets, {
  hasServeVariationToTargetsRuntime,
  serveVariationToTargetsSchema
} from '../ServeVariationToTargets'

const renderComponent = (
  props: Partial<SubSectionComponentProps> = {},
  testWrapperProps: Partial<SubSectionTestWrapperProps> = {}
): RenderResult =>
  render(
    <SubSectionTestWrapper {...testWrapperProps}>
      <ServeVariationToTargets prefixPath="test" title="Serve variation to targets" {...props} />
    </SubSectionTestWrapper>
  )

describe('ServeVariationToTargets', () => {
  const useGetAllTargetsMock = jest.spyOn(cfServices, 'useGetAllTargets')

  beforeEach(() => {
    useGetAllTargetsMock.mockReturnValue({ data: { targets: mockTargets }, loading: false, refetch: jest.fn() } as any)
  })

  describe('runtime', () => {
    const runtimeInstruction: FeatureFlagConfigurationInstruction = {
      identifier: 'test',
      type: CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP,
      spec: { variation: RUNTIME_INPUT_VALUE, targets: RUNTIME_INPUT_VALUE }
    }

    test('it should not display the variation when not set as runtime', async () => {
      const instruction = cloneDeep(runtimeInstruction)
      instruction.spec.variation = 'abc'

      renderComponent({}, { flag: MockFeature, mode: StepViewType.DeploymentForm, initialInstructions: [instruction] })

      expect(screen.queryByPlaceholderText('cf.pipeline.flagConfiguration.selectVariation')).not.toBeInTheDocument()
    })

    test('it should not display targets when not set as runtime', async () => {
      const instruction = cloneDeep(runtimeInstruction)
      instruction.spec.targets = ['a', 'b', 'c']

      renderComponent({}, { flag: MockFeature, mode: StepViewType.DeploymentForm, initialInstructions: [instruction] })

      expect(screen.queryByText('cf.pipeline.flagConfiguration.toTargets')).not.toBeInTheDocument()
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

describe('serveVariationToTargetsSchema', () => {
  test('it should throw when variation is not set', async () => {
    const schema = serveVariationToTargetsSchema(str => str)

    expect(() => schema.validateSync({ spec: { targets: ['a', 'b', 'c'] } })).toThrow('cf.shared.variationRequired')
  })

  test('it should throw when variation is empty', async () => {
    const schema = serveVariationToTargetsSchema(str => str)

    expect(() => schema.validateSync({ spec: { variation: '', targets: ['a', 'b', 'c'] } })).toThrow(
      'cf.shared.variationRequired'
    )
  })

  test('it should throw when targets is not set', async () => {
    const schema = serveVariationToTargetsSchema(str => str)

    expect(() => schema.validateSync({ spec: { variation: 'test' } })).toThrow(
      'cf.featureFlags.flagPipeline.validation.serveVariationToTargets.targets'
    )
  })

  test('it should throw when targets is empty', async () => {
    const schema = serveVariationToTargetsSchema(str => str)

    expect(() => schema.validateSync({ spec: { variation: 'test', targets: [] } })).toThrow(
      'cf.featureFlags.flagPipeline.validation.serveVariationToTargets.targets'
    )

    expect(() => schema.validateSync({ spec: { variation: 'test', targets: '' } })).toThrow(
      'cf.featureFlags.flagPipeline.validation.serveVariationToTargets.targets'
    )
  })

  test('it should not throw when variation is set', async () => {
    const schema = serveVariationToTargetsSchema(str => str)

    expect(() => schema.validateSync({ spec: { variation: 'test', targets: ['a', 'b', 'c'] } })).not.toThrow()
  })
})

describe('hasServeVariationToTargetsRuntime', () => {
  test('it should return true when the instruction is a variation target map rule and the variation is set as runtime', async () => {
    expect(
      hasServeVariationToTargetsRuntime({
        identifier: 'test',
        type: CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP,
        spec: { variation: RUNTIME_INPUT_VALUE, targets: ['a', 'b', 'c'] }
      })
    ).toBeTruthy()
  })

  test('it should return true when the instruction is a variation target map rule and targets is set as runtime', async () => {
    expect(
      hasServeVariationToTargetsRuntime({
        identifier: 'test',
        type: CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP,
        spec: { variation: 'test', targets: RUNTIME_INPUT_VALUE }
      })
    ).toBeTruthy()
  })

  test('it should return false when the instruction is a variation target map rule and neither the variation nor targets are set as runtime', async () => {
    expect(
      hasServeVariationToTargetsRuntime({
        identifier: 'test',
        type: CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP,
        spec: { variation: 'test', targets: ['a', 'b', 'c'] }
      })
    ).toBeFalsy()
  })

  test('it should return false when the instruction is not a variation target map rule and the variation is set as runtime', async () => {
    expect(
      hasServeVariationToTargetsRuntime({
        identifier: 'test',
        type: CFPipelineInstructionType.SET_FEATURE_FLAG_STATE,
        spec: { variation: RUNTIME_INPUT_VALUE }
      })
    ).toBeFalsy()
  })
})
