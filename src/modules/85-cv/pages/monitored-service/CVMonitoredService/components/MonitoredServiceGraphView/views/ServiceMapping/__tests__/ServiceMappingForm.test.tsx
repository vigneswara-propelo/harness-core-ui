/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import * as serviceDiscovery from 'services/servicediscovery'
import ServiceMappingForm from '../ServiceMappingForm'
import { selectAgentDropdown } from './ServiceMapping.test.utils'

const mutate = jest.fn()
jest.mock('services/cv', () => ({
  useCreateAutoDiscovery: jest.fn().mockImplementation(() => {
    return { data: {}, mutate, refetch: jest.fn(), loading: false }
  })
}))

jest.mock('services/servicediscovery', () => ({
  useListAgent: jest.fn().mockImplementation(() => {
    return {
      data: { items: [{ name: 'Agent 1', identity: 'agent1' }] },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))

describe('ServiceMappingForm', () => {
  test('should validate form', async () => {
    const onSubmit = jest.fn()
    const onCancel = jest.fn()
    const { getByTestId, getByText } = render(
      <TestWrapper>
        <ServiceMappingForm onCancel={onCancel} onSubmit={onSubmit} />
      </TestWrapper>
    )

    expect(getByTestId('submitFormButton')).toBeInTheDocument()
    fireEvent.click(getByTestId('submitFormButton'))
    await waitFor(() => expect(getByText('common.validation.fieldIsRequired')).toBeInTheDocument())
  })

  test('should submit form', async () => {
    const onSubmit = jest.fn()
    const onCancel = jest.fn()
    const { container, getByTestId } = render(
      <TestWrapper>
        <ServiceMappingForm onCancel={onCancel} onSubmit={onSubmit} />
      </TestWrapper>
    )

    expect(container.querySelector('[name="agentIdentifier"]')).toBeInTheDocument()

    await selectAgentDropdown(container)

    fireEvent.click(getByTestId('submitFormButton'))

    await waitFor(() =>
      expect(mutate).toHaveBeenLastCalledWith({
        agentIdentifier: 'agent1',
        autoCreateMonitoredService: false
      })
    )
  })
  test('should handle API failure', async () => {
    jest.spyOn(serviceDiscovery, 'useListAgent').mockReturnValue({
      absolutePath: '',
      cancel: jest.fn(),
      refetch: jest.fn(),
      data: null,
      response: null,
      error: {
        data: { message: 'error message' },
        message: 'error message'
      },
      loading: false
    })

    const onSubmit = jest.fn()
    const onCancel = jest.fn()
    const { getByText } = render(
      <TestWrapper>
        <ServiceMappingForm onCancel={onCancel} onSubmit={onSubmit} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('error message')).toBeInTheDocument())
  })
})
