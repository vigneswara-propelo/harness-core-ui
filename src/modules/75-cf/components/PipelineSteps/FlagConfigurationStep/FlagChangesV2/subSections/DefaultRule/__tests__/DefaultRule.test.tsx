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
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import MockFeature from '@cf/utils/testData/data/mockFeature'
import { CFPipelineInstructionType } from '@cf/components/PipelineSteps/FlagConfigurationStep/types'
import { SubSectionComponentProps } from '../../../subSection.types'
import SubSectionTestWrapper, { SubSectionTestWrapperProps } from '../../__tests__/SubSectionTestWrapper.mock'
import DefaultRule from '../DefaultRule'

const renderComponent = (
  props: Partial<SubSectionComponentProps> = {},
  testWrapperProps: Partial<SubSectionTestWrapperProps> = {}
): RenderResult =>
  render(
    <SubSectionTestWrapper {...testWrapperProps}>
      <DefaultRule
        instructionType={CFPipelineInstructionType.SET_DEFAULT_ON_VARIATION}
        prefixPath="test"
        title="Default rule"
        {...props}
      />
    </SubSectionTestWrapper>
  )

describe('DefaultRule', () => {
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

      renderComponent({}, { flag, mode: StepViewType.DeploymentForm, readonly: true })

      expect(await screen.findByPlaceholderText('cf.pipeline.flagConfiguration.selectVariation')).toBeDisabled()
    })
  })
})
