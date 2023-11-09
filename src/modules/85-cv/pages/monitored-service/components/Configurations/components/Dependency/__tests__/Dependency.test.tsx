/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, queryByText } from '@testing-library/react'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import {
  monitoredServiceList,
  monitoredServiceForm,
  testWrapperProps,
  testWrapperEditProps,
  pathParams,
  monitoredServiceOfTypeInfrastructure
} from './Dependency.mock'
import Dependency from '../Dependency'

describe('Dependency component', () => {
  test('should render all cards', async () => {
    jest
      .spyOn(cvService, 'useGetMonitoredServicePlatformList')
      .mockReturnValue({ data: monitoredServiceList, refetch: jest.fn() } as any)
    const onSuccessMock = jest.fn()

    const { container, getByText } = render(
      <TestWrapper>
        <Dependency onSuccess={onSuccessMock} value={monitoredServiceForm} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="leftSection"]')).not.toBeNull())
    expect(container.querySelectorAll('[class~="serviceCard"]').length).toBe(5)
    expect(container.querySelector('[class*="monitoredServiceCategory"][class*="infrastructure"]')).not.toBeNull()
    expect(container.querySelector('[class*="monitoredServiceCategory"][class*="application"]')).not.toBeNull()
    fireEvent.click(getByText('save'))
    await waitFor(() =>
      expect(onSuccessMock).toHaveBeenLastCalledWith({
        dependencies: [],
        description: '',
        environmentRef: 'production',
        environmentRefList: ['production'],
        identifier: 'manager_production',
        isEdit: false,
        name: 'manager_production',
        serviceRef: 'manager',
        sources: {
          changeSources: [
            {
              category: 'Deployment',
              enabled: true,
              identifier: 'harness_cd',
              name: 'Harness CD',
              spec: {},
              type: 'HarnessCD'
            }
          ],
          healthSources: []
        },
        tags: {},
        type: 'Application'
      })
    )
  })

  test('Pressing save button after selecting a service', async () => {
    jest
      .spyOn(cvService, 'useGetMonitoredServicePlatformList')
      .mockReturnValue({ data: monitoredServiceList, refetch: jest.fn() } as any)
    jest.spyOn(cvService, 'useGetNamespaces').mockReturnValue({ data: {}, refetch: jest.fn() } as any)

    const { container, getByText } = render(
      <TestWrapper>
        <Dependency onSuccess={jest.fn()} onDiscard={jest.fn()} value={monitoredServiceForm} />
      </TestWrapper>
    )

    const checkbox = container.querySelectorAll('input[type="checkbox"]')[0]
    fireEvent.click(checkbox!)
    await waitFor(() => expect(getByText('unsavedChanges')).toBeInTheDocument())

    fireEvent.click(getByText('save'))
    await waitFor(() => expect(container.querySelector('[class*="spinner"]')).not.toBeNull())
  })

  test('Pressing discard button after selecting a service', async () => {
    jest
      .spyOn(cvService, 'useGetMonitoredServicePlatformList')
      .mockReturnValue({ data: monitoredServiceList, refetch: jest.fn() } as any)
    jest.spyOn(cvService, 'useGetNamespaces').mockReturnValue({ data: {}, refetch: jest.fn() } as any)

    const { container, getByText } = render(
      <TestWrapper>
        <Dependency onSuccess={jest.fn()} onDiscard={jest.fn()} value={monitoredServiceForm} />
      </TestWrapper>
    )

    const checkbox = container.querySelectorAll('input[type="checkbox"]')[0]
    fireEvent.click(checkbox!)
    await waitFor(() => expect(getByText('unsavedChanges')).toBeInTheDocument())

    fireEvent.click(getByText('common.discard'))
    await waitFor(() => expect(queryByText(container, 'unsavedChanges')).toBeNull())
  })

  test('Ensure loading is displayed on api loading', async () => {
    jest
      .spyOn(cvService, 'useGetMonitoredServicePlatformList')
      .mockReturnValue({ loading: true, refetch: jest.fn() } as any)
    const onSuccessMock = jest.fn()

    const { container } = render(
      <TestWrapper>
        <Dependency onSuccess={onSuccessMock} value={monitoredServiceForm} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="leftSection"]')).not.toBeNull())
    await waitFor(() => expect(container.querySelector('[class*="spinner"]')).not.toBeNull())
  })

  test('Ensure error page is displayed on getting error from MS list API', async () => {
    jest
      .spyOn(cvService, 'useGetMonitoredServicePlatformList')
      .mockReturnValue({ error: { data: { message: 'Error from response' } }, refetch: jest.fn() } as any)
    const onSuccessMock = jest.fn()

    const { getByText } = render(
      <TestWrapper>
        <Dependency onSuccess={onSuccessMock} value={monitoredServiceForm} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('Retry')).toBeInTheDocument())
  })

  test('Ensure API useGetMonitoredServicePlatformList is called with environmentIdentifiers - Create - Application', () => {
    const refetch = jest.fn()
    jest
      .spyOn(cvService, 'useGetMonitoredServicePlatformList')
      .mockReturnValue({ data: monitoredServiceList, refetch } as any)

    render(
      <TestWrapper {...testWrapperProps}>
        <Dependency onSuccess={jest.fn()} value={monitoredServiceForm} />
      </TestWrapper>
    )

    expect(refetch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        queryParams: { ...pathParams, environmentIdentifiers: ['production'], offset: 0, pageSize: 10 },
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
    )
  })

  test('Ensure API useGetMonitoredServicePlatformList is called with environmentIdentifiers - Application', () => {
    const refetch = jest.fn()
    jest
      .spyOn(cvService, 'useGetMonitoredServicePlatformList')
      .mockReturnValue({ data: monitoredServiceList, refetch } as any)

    render(
      <TestWrapper {...testWrapperEditProps}>
        <Dependency onSuccess={jest.fn()} value={monitoredServiceForm} />
      </TestWrapper>
    )

    expect(refetch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        queryParams: { ...pathParams, environmentIdentifiers: ['production'], offset: 0, pageSize: 10 },
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
    )
  })

  test('Ensure API useGetMonitoredServicePlatformList is called with environmentIdentifiers - Create - Infrastructure', () => {
    const refetch = jest.fn()
    jest
      .spyOn(cvService, 'useGetMonitoredServicePlatformList')
      .mockReturnValue({ data: monitoredServiceList, refetch } as any)

    render(
      <TestWrapper {...testWrapperEditProps}>
        <Dependency onSuccess={jest.fn()} value={monitoredServiceOfTypeInfrastructure} />
      </TestWrapper>
    )

    expect(refetch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        queryParams: {
          ...pathParams,
          environmentIdentifiers: ['production_one', 'production_two'],
          offset: 0,
          pageSize: 10
        },
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
    )
  })

  test('Ensure API useGetMonitoredServicePlatformList is called with environmentIdentifiers - Infrastructure', () => {
    const refetch = jest.fn()
    jest
      .spyOn(cvService, 'useGetMonitoredServicePlatformList')
      .mockReturnValue({ data: monitoredServiceList, refetch } as any)

    render(
      <TestWrapper {...testWrapperEditProps}>
        <Dependency onSuccess={jest.fn()} value={monitoredServiceOfTypeInfrastructure} />
      </TestWrapper>
    )

    expect(refetch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        queryParams: {
          ...pathParams,
          environmentIdentifiers: ['production_one', 'production_two'],
          offset: 0,
          pageSize: 10
        },
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
    )
  })
})
