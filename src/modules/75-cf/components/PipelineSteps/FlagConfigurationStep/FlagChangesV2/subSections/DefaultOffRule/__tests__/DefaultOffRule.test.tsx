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
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import MockFeature from '@cf/utils/testData/data/mockFeature'
import { CFPipelineInstructionType } from '@cf/components/PipelineSteps/FlagConfigurationStep/types'
import { SubSectionComponentProps } from '../../../subSection.types'
import SubSectionTestWrapper, { SubSectionTestWrapperProps } from '../../__tests__/SubSectionTestWrapper.mock'
import DefaultOffRule, { defaultOffRuleSchema, hasDefaultOffRuleRuntime } from '../DefaultOffRule'

const renderComponent = (
  props: Partial<SubSectionComponentProps> = {},
  testWrapperProps: Partial<SubSectionTestWrapperProps> = {}
): RenderResult =>
  render(
    <SubSectionTestWrapper {...testWrapperProps}>
      <DefaultOffRule prefixPath="test" title="Default OFF rule" {...props} />
    </SubSectionTestWrapper>
  )

describe('DefaultOffRule', () => {
  test('it should display the title', async () => {
    const title = 'TEST TITLE'
    renderComponent({ title })

    expect(await screen.findByRole('heading', { name: title })).toBeInTheDocument()
  })

  describe('edit', () => {
    test('it should display a dropdown with all flag variations', async () => {
      const flag = cloneDeep(MockFeature)
      flag.variations = [
        { name: 'Variation A', identifier: 'varA', value: 'varA' },
        { name: 'Variation B', identifier: 'varB', value: 'varB' },
        { name: 'Variation C', identifier: 'varC', value: 'varC' }
      ]

      renderComponent({}, { flag, mode: StepViewType.Edit })

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

      renderComponent({}, { flag, mode: StepViewType.Edit, readonly: true })

      expect(await screen.findByPlaceholderText('cf.pipeline.flagConfiguration.selectVariation')).toBeDisabled()
    })
  })

  describe('runtime', () => {
    test('it should display a dropdown with all flag variations', async () => {
      const flag = cloneDeep(MockFeature)
      flag.variations = [
        { name: 'Variation A', identifier: 'varA', value: 'varA' },
        { name: 'Variation B', identifier: 'varB', value: 'varB' },
        { name: 'Variation C', identifier: 'varC', value: 'varC' }
      ]

      renderComponent({}, { flag, mode: StepViewType.DeploymentForm })

      await userEvent.click(await screen.findByPlaceholderText('- cf.pipeline.flagConfiguration.selectVariation -'))

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

      renderComponent({}, { flag, mode: StepViewType.DeploymentForm, readonly: true })

      expect(await screen.findByPlaceholderText('- cf.pipeline.flagConfiguration.selectVariation -')).toBeDisabled()
    })
  })
})

describe('defaultOffRuleSchema', () => {
  test('it should throw when variation is not set', async () => {
    const schema = defaultOffRuleSchema(str => str)

    expect(() => schema.validateSync({ spec: {} })).toThrow(
      'cf.featureFlags.flagPipeline.validation.defaultOffRule.offVariation'
    )
  })

  test('it should throw when variation is empty', async () => {
    const schema = defaultOffRuleSchema(str => str)

    expect(() => schema.validateSync({ spec: { variation: '' } })).toThrow(
      'cf.featureFlags.flagPipeline.validation.defaultOffRule.offVariation'
    )
  })

  test('it should not throw when variation is set', async () => {
    const schema = defaultOffRuleSchema(str => str)

    expect(() => schema.validateSync({ spec: { variation: 'test' } })).not.toThrow()
  })
})

describe('hasDefaultOffRuleRuntime', () => {
  test('it should return true when the instruction is a default off rule and the variation is set as runtime', async () => {
    expect(
      hasDefaultOffRuleRuntime({
        identifier: 'test',
        type: CFPipelineInstructionType.SET_DEFAULT_OFF_VARIATION,
        spec: { variation: RUNTIME_INPUT_VALUE }
      })
    ).toBeTruthy()
  })

  test('it should return false when the instruction is a default off rule and the variation is not set as runtime', async () => {
    expect(
      hasDefaultOffRuleRuntime({
        identifier: 'test',
        type: CFPipelineInstructionType.SET_DEFAULT_OFF_VARIATION,
        spec: { variation: 'test' }
      })
    ).toBeFalsy()
  })

  test('it should return false when the instruction is not a default off rule and the variation is set as runtime', async () => {
    expect(
      hasDefaultOffRuleRuntime({
        identifier: 'test',
        type: CFPipelineInstructionType.SET_FEATURE_FLAG_STATE,
        spec: { variation: RUNTIME_INPUT_VALUE }
      })
    ).toBeFalsy()
  })
})
