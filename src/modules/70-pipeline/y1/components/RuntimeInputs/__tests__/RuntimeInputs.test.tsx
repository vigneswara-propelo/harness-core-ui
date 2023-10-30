/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { PipelineInfoConfig } from 'services/pipeline-ng'
import { RuntimeInputs } from '../RuntimeInputs'

describe('RuntimeInputs', () => {
  test('should render an empty state when there are no runtime inputs', async () => {
    render(
      <TestWrapper>
        <RuntimeInputs
          pipeline={{ identifier: 'test', name: 'test' }}
          onClose={jest.fn()}
          isReadonly={false}
          onUpdateInputs={jest.fn()}
        />
      </TestWrapper>
    )

    expect(await screen.findByText('pipeline.noRuntimeInputsCreated')).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'pipeline.addRuntimeInput'
      })
    ).toBeInTheDocument()
  })

  test('should render runtime inputs and filter them based on the search term', async () => {
    const user = userEvent.setup()

    const { baseElement } = render(
      <TestWrapper>
        <RuntimeInputs
          pipeline={
            {
              version: 1,
              kind: 'pipeline',
              spec: {
                inputs: {
                  'input-1': {
                    type: 'string',
                    required: true,
                    default: 'input-1 value',
                    description: 'input-1 description'
                  },
                  'input-2': {
                    type: 'string',
                    required: true,
                    default: 'input-2 value',
                    description: 'input-2 description'
                  }
                }
              }
            } as unknown as PipelineInfoConfig
          }
          onClose={jest.fn()}
          isReadonly={false}
          onUpdateInputs={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByRole('button', { name: 'input-1' })).toBeInTheDocument()
    expect(screen.getByText('input-1 value'))
    expect(screen.getByRole('button', { name: 'input-2' })).toBeInTheDocument()
    expect(screen.getByText('input-2 value'))

    await user.hover(screen.getByRole('button', { name: 'input-1' }))

    await waitFor(() => expect(baseElement.querySelector('[data-icon=copy-alt]')).toBeInTheDocument())

    const searchInput = screen.getByPlaceholderText('Search')

    await user.type(searchInput, 'input-2')

    expect(await screen.findByRole('button', { name: 'input-2' })).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('button', { name: 'input-1' })).toBeNull())

    await user.click(screen.getByRole('button', { name: 'input-2' }))

    expect(await screen.findByText('pipeline.editInput')).toBeInTheDocument()

    await user.clear(searchInput)
    await user.type(searchInput, 'input-1')

    // selected input should render even when it doesn't match the search term
    expect(await screen.findByRole('button', { name: 'input-1' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'input-2' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'input-2' }))
    await user.clear(searchInput)
    await user.type(searchInput, 'input that does not exist')

    expect(await screen.findByText('common.noSearchResultsFound')).toBeInTheDocument()
  })
})
