/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import * as cvService from 'services/cv'
import ServiceMapping from '../ServiceMapping'
import { selectAgentDropdown } from './ServiceMapping.test.utils'
import { AutoDiscoveryStatus } from '../ServiceMapping.constant'

const reImportAutoDiscovery = jest.fn().mockImplementation(() =>
  Promise.resolve({
    resource: { correlationId: 'correlationId1', status: 'Running' }
  })
)

const createAutoDiscovery = jest.fn().mockImplementation(() =>
  Promise.resolve({
    resource: { monitoredServicesCreated: ['Monitored servie 1', 'Monitored servie 2'], serviceDependenciesImported: 2 }
  })
)

const refetch = jest.fn()

jest.mock('services/cv', () => ({
  useReImportAutoDiscovery: jest.fn().mockImplementation(() => {
    return {
      data: { resource: { correlationId: 'correlationId1', status: 'Running' } },
      mutate: reImportAutoDiscovery,
      refetch: jest.fn(),
      loading: false
    }
  }),
  useGetReImportStatus: jest.fn().mockImplementation(() => {
    return { data: {}, refetch, loading: false }
  }),
  useCreateAutoDiscovery: jest.fn().mockImplementation(() => {
    return { data: {}, mutate: createAutoDiscovery, refetch: jest.fn(), loading: false }
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

describe('ServiceMapping', () => {
  test('should render', async () => {
    const onImport = jest.fn()
    const { getByTestId } = render(
      <TestWrapper>
        <ServiceMapping onImport={onImport} />
      </TestWrapper>
    )

    expect(getByTestId('importServiceMapping')).toBeInTheDocument()
    expect(getByTestId('reImportServiceMapping')).toBeInTheDocument()

    fireEvent.click(getByTestId('reImportServiceMapping'))
    expect(reImportAutoDiscovery).toHaveBeenCalled()

    await waitFor(() => expect(refetch).toHaveBeenCalled(), { timeout: 6000 })

    // service mapping dialog opens
    fireEvent.click(getByTestId('importServiceMapping'))
    expect(document.body.querySelector('.bp3-dialog')).toBeInTheDocument()
    await selectAgentDropdown(document.body)

    fireEvent.click(getByTestId('submitFormButton'))

    await waitFor(() => expect(onImport).toHaveBeenCalled())

    await waitFor(() => expect(document.body.querySelector('[data-testid="discoveryDetailCard"]')).toBeInTheDocument())
    await waitFor(() =>
      expect(document.body.querySelector('[data-testid="closeDiscoveryDetailCard"]')).toBeInTheDocument()
    )
    fireEvent.click(document.body.querySelector('[data-testid="closeDiscoveryDetailCard"]')!)
    await waitFor(() =>
      expect(document.body.querySelector('[data-testid="discoveryDetailCard"]')).not.toBeInTheDocument()
    )
  })

  test('should validate API failure', async () => {
    jest.clearAllMocks()

    jest.spyOn(cvService, 'useGetReImportStatus').mockReturnValue({
      data: {
        resource: {
          correlationId: 'correlationId123',
          monitoredServicesCreated: ['MS 1', 'MS 2'],
          serviceDependenciesImported: 0,
          status: AutoDiscoveryStatus.COMPLETED
        }
      },
      cancel: jest.fn(),
      error: null,
      loading: false,
      absolutePath: '',
      refetch: jest.fn(),
      response: null
    })
    const onImport = jest.fn()
    const { getByTestId, getByText } = render(
      <TestWrapper>
        <ServiceMapping onImport={onImport} />
      </TestWrapper>
    )

    fireEvent.click(getByTestId('reImportServiceMapping'))
    await waitFor(() => expect(document.body.querySelector('[data-testid="discoveryDetailCard"]')).toBeInTheDocument())
    await waitFor(() => expect(getByText('MS 1')).toBeInTheDocument())
    await waitFor(() => expect(getByText('MS 2')).toBeInTheDocument())

    await waitFor(() => expect(onImport).toHaveBeenCalled())
  })

  test('should validate reimport success', async () => {
    jest.clearAllMocks()
    jest.spyOn(cvService, 'useReImportAutoDiscovery').mockReturnValue({
      mutate: jest.fn().mockReturnValue({
        resource: {
          correlationId: 'correlationId123',
          monitoredServicesCreated: ['MS 1', 'MS 2'],
          serviceDependenciesImported: 5,
          status: AutoDiscoveryStatus.COMPLETED
        }
      }),
      cancel: jest.fn(),
      error: null,
      loading: false
    })

    const onImport = jest.fn()
    const { getByTestId, getByText } = render(
      <TestWrapper>
        <ServiceMapping onImport={onImport} />
      </TestWrapper>
    )

    fireEvent.click(getByTestId('reImportServiceMapping'))

    await waitFor(() => expect(document.body.querySelector('[data-testid="discoveryDetailCard"]')).toBeInTheDocument())
    await waitFor(() => expect(getByText('MS 1')).toBeInTheDocument())
    await waitFor(() => expect(getByText('MS 2')).toBeInTheDocument())
    await waitFor(() => expect(onImport).toHaveBeenCalled())
  })
})
