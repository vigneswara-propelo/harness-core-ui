/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { findByText, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { cloneDeep } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { stageDataMock } from './mock'
import { PrimaryArtifactSelectionDropDown } from '../PrimaryArtifactSelectionDropDown/PrimaryArtifactSelectionDropDown'

const updateStage = jest.fn()

const getContextValue = (): PipelineContextInterface => {
  return {
    state: {
      selectionState: { selectedStageId: 'stage_id' }
    },
    updateStage: updateStage,
    getStageFromPipeline: jest.fn(() => {
      return {
        stage: stageDataMock
      }
    })
  } as any
}

describe('PrimaryArtifactSelectionDropDown - ', () => {
  beforeEach(() => jest.clearAllMocks())

  test('should change multitype options and validate onTypeChange & getPrimaryArtifactRefFromDropDown Functions', async () => {
    const { container, getByDisplayValue, getByPlaceholderText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <PrimaryArtifactSelectionDropDown isPropagating={false} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // MultiType Change - test changing to runtime and expression type
    const multiTypeIcon = container.querySelector('.MultiTypeInput--btn')!

    await userEvent.click(multiTypeIcon)
    const runtimeMenu = await findByText(document.body, 'Runtime input')
    await userEvent.click(runtimeMenu)

    // Runtime should be selected
    expect(getByDisplayValue('<+input>')).toBeInTheDocument()

    await userEvent.click(multiTypeIcon)
    const expressionMenu = await findByText(document.body, 'Expression')
    await userEvent.click(expressionMenu)

    //Expression Type should be selected
    expect(getByPlaceholderText('<+expression>')).toBeInTheDocument()
  })

  test('should change primaryArtifactRef from the options and validate updateStage fn', async () => {
    const { getByDisplayValue, getByPlaceholderText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <PrimaryArtifactSelectionDropDown isPropagating={false} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    await userEvent.click(getByPlaceholderText('- Select -') as HTMLElement)
    const primaryArtifactRefOptions = await screen.findAllByRole('listitem')

    //updateStage should not be called as until now we haven't done any change
    expect(updateStage).toBeCalledTimes(0)

    await waitFor(() => expect(primaryArtifactRefOptions).toHaveLength(3))
    await userEvent.click(primaryArtifactRefOptions[2] as HTMLElement)

    // updateStage should be called once as now the dropdown value will change
    expect(updateStage).toBeCalledTimes(1)
    const updatedValue = cloneDeep(stageDataMock.stage)
    updatedValue.spec.serviceConfig.serviceDefinition.spec.artifacts.primary.primaryArtifactRef =
      'dcrTemplateartjiounoinoin'

    // assert if updateStage is called with correct value
    expect(updateStage).toHaveBeenCalledWith(updatedValue)
    expect(getByDisplayValue('dcrTemplateartjiounoinoin')).toBeInTheDocument()
  })

  test('Dropdown value should be empty when isPropagating = true', () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <PrimaryArtifactSelectionDropDown isPropagating={true} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Existing PrimaryArtifactRef should not be present - reason the yaml format will be different
    expect(container.querySelector('input[value="Harnessdoc"]')).not.toBeInTheDocument()
  })
})
