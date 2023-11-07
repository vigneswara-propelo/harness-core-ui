/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { IDPStage } from '../IDPStage'
import { getPropsForMinimalStage, getDummyPipelineContextValue } from './mocks'

describe('IDP Stage Minimal View', () => {
  test('Basic render, selection and setup stage', async () => {
    const props = getPropsForMinimalStage()
    const pipelineContextMockValue = getDummyPipelineContextValue()
    const { container, getByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <IDPStage
            minimal={true}
            stageProps={props.stageProps as Record<string, unknown>}
            name={''}
            type={''}
            icon={'idp'}
            isDisabled={false}
            isApproval={false}
            title="IDP Stage"
            description={''}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    await act(async () => {
      await fireEvent.click(getByText('pipelineSteps.build.create.setupStage'))
    })
    expect(getByText('pipelineSteps.build.create.stageNameRequiredError')).toBeDefined()
    expect(() => getByText('pipeline.approvalTypeRequired')).toThrow()
    const nameInput = container.querySelector('.bp3-input')
    act(() => {
      fireEvent.change(nameInput!, { target: { value: 'stagename' } })
    })
    expect(props.stageProps?.onChange).toBeCalledTimes(3)
    act(() => {
      fireEvent.click(getByText('pipelineSteps.build.create.setupStage'))
    })

    await waitFor(() =>
      expect(props.stageProps?.onSubmit).toBeCalledWith(
        {
          stage: {
            name: 'stagename',
            identifier: 'stagename',
            description: undefined,
            tags: {}
          }
        },
        'stagename'
      )
    )
  })
})
