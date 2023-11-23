/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { UseGetReturn } from 'restful-react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import K8sNamespaceAndWorkload from '../K8sNamespaceAndWorkload'

describe('Unit tests for K8sNamespaceAndWorkload', () => {
  test('Ensure that loading placeholder is displayed for namespace', async () => {
    jest.spyOn(cvService, 'useGetNamespaces').mockReturnValue({ loading: true, refetch: jest.fn() as unknown } as any)
    const { container } = render(
      <TestWrapper>
        <K8sNamespaceAndWorkload onChange={jest.fn()} connectorIdentifier="1234_connectorIdentifier" />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelectorAll('[class*="selectContainer"]').length).toBe(2))
    expect(container.querySelector('input[placeholder="loading..."]'))
  })

  test('Ensure that loading placeholder is displayed for workload', async () => {
    jest.spyOn(cvService, 'useGetNamespaces').mockReturnValue({
      data: { data: { content: ['namespace1', 'namespace2'] } },
      refetch: jest.fn() as unknown
    } as any)
    jest.spyOn(cvService, 'useGetWorkloads').mockReturnValue({ loading: true, refetch: jest.fn() as unknown } as any)

    const { container, getByText } = render(
      <TestWrapper>
        <K8sNamespaceAndWorkload onChange={jest.fn()} connectorIdentifier="1234_connectorIdentifier" />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelectorAll('[class*="selectContainer"]').length).toBe(2))

    const carets = container.querySelectorAll('[data-icon="chevron-down"]')
    fireEvent.click(carets[0])
    await waitFor(() => container.querySelector('[class*="menuItem"]'))
    fireEvent.click(getByText('namespace1'))
    await waitFor(() => expect(container.querySelector('input[name="workload"][placeholder="loading..."]')).toBeNull())
  })

  test('Ensure that error message is displayed for namespace', async () => {
    jest
      .spyOn(cvService, 'useGetNamespaces')
      .mockReturnValue({ error: { message: 'mockError' }, refetch: jest.fn() as unknown } as UseGetReturn<
        any,
        any,
        any,
        any
      >)
    const { container } = render(
      <TestWrapper>
        <K8sNamespaceAndWorkload onChange={jest.fn()} connectorIdentifier="1234_connectorIdentifier" />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelectorAll('[class*="selectContainer"]').length).toBe(2))
    expect(container.querySelector('[class*="errorMsg"]')).not.toBeNull()
  })

  test('Ensure that error message is displayed for workload', async () => {
    jest.spyOn(cvService, 'useGetNamespaces').mockReturnValue({
      data: { data: { content: ['namespace1', 'namespace2'] } },
      refetch: jest.fn() as unknown
    } as any)
    jest
      .spyOn(cvService, 'useGetWorkloads')
      .mockReturnValue({ error: { message: 'mockError' }, refetch: jest.fn() as unknown } as UseGetReturn<
        any,
        any,
        any,
        any
      >)

    const { container, getByText } = render(
      <TestWrapper>
        <K8sNamespaceAndWorkload onChange={jest.fn()} connectorIdentifier="1234_connectorIdentifier" />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelectorAll('[class*="selectContainer"]').length).toBe(2))
    const carets = container.querySelectorAll('[data-icon="chevron-down"]')
    fireEvent.click(carets[0])
    await waitFor(() => container.querySelector('[class*="menuItem"]'))
    fireEvent.click(getByText('namespace1'))
    await waitFor(() => expect(container.querySelector('input[name="workload"][disabled]')).toBeNull())

    expect(container.querySelector('[class*="errorMsg"]')).not.toBeNull()
  })

  test('should render options correctly', async () => {
    const onChange = jest.fn()
    jest.spyOn(cvService, 'useGetNamespaces').mockReturnValue({
      data: { data: { content: ['namespace1', 'namespace2'] } },
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetWorkloads').mockReturnValue({
      data: { data: { content: ['workload1', 'workload2'] } },
      refetch: jest.fn() as unknown
    } as any)

    const { container, getByText } = render(
      <TestWrapper>
        <K8sNamespaceAndWorkload onChange={onChange} connectorIdentifier="1234_connectorIdentifier" />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelectorAll('[class*="selectContainer"]').length).toBe(2))

    const carets = container.querySelectorAll('[data-icon="chevron-down"]')
    fireEvent.click(carets[0])
    await waitFor(() => container.querySelector('[class*="menuItem"]'))
    fireEvent.click(getByText('namespace1'))
    await waitFor(() => expect(container.querySelector('input[name="workload"][disabled]')).toBeNull())

    const workload = container.getElementsByClassName('bp3-multi-select-tag-input-input')[0]
    fireEvent.click(workload)
    await waitFor(() => expect(container.querySelector('input[value="workload1"]')).toBeInTheDocument())
    fireEvent.click(container.querySelector('input[value="workload1"]')!)

    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('namespace1', ['workload1']))
  })

  test('Ensure edit mode works', async () => {
    const onChange = jest.fn()
    jest.spyOn(cvService, 'useGetNamespaces').mockReturnValue({
      data: { data: { content: ['namespace1', 'namespace2'] } },
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetWorkloads').mockReturnValue({
      data: { data: { content: ['workload1', 'workload2'] } },
      refetch: jest.fn() as unknown
    } as any)

    const { container, rerender } = render(
      <TestWrapper>
        <K8sNamespaceAndWorkload onChange={onChange} connectorIdentifier="1234_connectorIdentifier" />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelectorAll('[class*="selectContainer"]').length).toBe(2))
    rerender(
      <TestWrapper>
        <K8sNamespaceAndWorkload
          onChange={onChange}
          connectorIdentifier="1234_connectorIdentifier"
          dependencyMetaData={{
            monitoredServiceIdentifier: '1235_sourceIdentifier',
            type: 'KUBERNETES',
            dependencyMetadata: {
              namespace: 'namespace2',
              workloads: ['workload2']
            }
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('input[name="namespace"][value="namespace2"]')).not.toBeNull())
    await waitFor(() => expect(container.querySelector('span[data-tag-index="0"]')).not.toBeNull())
  })
})
