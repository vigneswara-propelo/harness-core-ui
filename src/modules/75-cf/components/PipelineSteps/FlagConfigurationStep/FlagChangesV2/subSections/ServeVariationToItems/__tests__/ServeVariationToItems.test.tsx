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
import SubSectionTestWrapper, { SubSectionTestWrapperProps } from '../../__tests__/SubSectionTestWrapper.mock'
import ServeVariationToItems, { ServeVariationToItemsProps } from '../ServeVariationToItems'

const renderComponent = (
  props: Partial<ServeVariationToItemsProps> = {},
  testWrapperProps: Partial<SubSectionTestWrapperProps> = {}
): RenderResult =>
  render(
    <SubSectionTestWrapper {...testWrapperProps}>
      <ServeVariationToItems
        prefixPath="test"
        title="Serve variation to items"
        items={[]}
        fetchItems={jest.fn()}
        onQueryChange={jest.fn()}
        instructionType={CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP}
        displayItemsField
        displayVariationField
        {...props}
      />
    </SubSectionTestWrapper>
  )

describe('ServeVariationToItems', () => {
  test('it should display the title', async () => {
    const title = 'TEST TITLE'
    renderComponent({ title })

    expect(await screen.findByRole('heading', { name: title })).toBeInTheDocument()
  })

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

  test('it should call the fetchItems callback', async () => {
    const fetchItemsMock = jest.fn()
    renderComponent({ fetchItems: fetchItemsMock })

    expect(fetchItemsMock).toHaveBeenCalled()
  })

  test('it should display the "to Targets" label when the instructions type is set as targets', async () => {
    renderComponent({ instructionType: CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP })

    expect(await screen.findByText('cf.pipeline.flagConfiguration.toTargets')).toBeInTheDocument()
  })

  test('it should display the "to Target Groups" label when the instructions type is set as target groups', async () => {
    renderComponent({ instructionType: CFPipelineInstructionType.ADD_SEGMENT_TO_VARIATION_TARGET_MAP })

    expect(await screen.findByText('cf.pipeline.flagConfiguration.toTargetGroups')).toBeInTheDocument()
  })

  test('it should display the passed items', async () => {
    const items: ServeVariationToItemsProps['items'] = [
      { label: 'OPTION 1', value: 'opt1' },
      { label: 'OPTION 2', value: 'opt2' },
      { label: 'OPTION 3', value: 'opt3' }
    ]
    renderComponent({ items, instructionType: CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP })

    await userEvent.click(await screen.findByPlaceholderText('- cf.pipeline.flagConfiguration.selectTargets -'))

    for (const item of items) {
      expect(await screen.findByText(item.label)).toBeInTheDocument()
    }
  })

  test('it should call the onQueryChange callback when typing in the item input', async () => {
    const onQueryChangeMock = jest.fn()
    renderComponent({
      onQueryChange: onQueryChangeMock,
      instructionType: CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP
    })

    expect(onQueryChangeMock).not.toHaveBeenCalled()

    await userEvent.type(await screen.findByPlaceholderText('- cf.pipeline.flagConfiguration.selectTargets -'), 'test')

    expect(onQueryChangeMock).toHaveBeenCalledWith('test', undefined)
  })

  test('it should hide the items field when displayItemsField is set as false', async () => {
    renderComponent({
      displayItemsField: false,
      instructionType: CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP
    })

    expect(screen.queryByText('cf.pipeline.flagConfiguration.toTargets')).not.toBeInTheDocument()
  })

  test('it should hide the variation field when displayVariationField is set as false', async () => {
    renderComponent({ displayVariationField: false })

    expect(screen.queryByText('cf.pipeline.flagConfiguration.serveVariation')).not.toBeInTheDocument()
  })

  test('it should show the please select flag message if the mode is deployment form and no flag is selected', async () => {
    renderComponent({}, { mode: StepViewType.DeploymentForm, flag: undefined })

    expect(await screen.findByText('cf.pipeline.flagConfiguration.pleaseSelectFlag')).toBeInTheDocument()
  })

  test('it should show the please select environment message if the mode is deployment form and no environment is selected', async () => {
    renderComponent({}, { mode: StepViewType.DeploymentForm, environmentIdentifier: undefined })

    expect(await screen.findByText('cf.pipeline.flagConfiguration.pleaseSelectEnvironment')).toBeInTheDocument()
  })
})
