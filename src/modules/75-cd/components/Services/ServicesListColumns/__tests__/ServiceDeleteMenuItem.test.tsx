/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByText, render, waitFor } from '@testing-library/react'
import { TestWrapper, findDialogContainer } from '@modules/10-common/utils/testUtils'
import { useDeleteServiceV2 } from 'services/cd-ng'
import ServiceDeleteMenuItem from '../ServiceDeleteMenuItem'

const deleteService = jest.fn().mockReturnValue({
  status: 'SUCCESS'
})

jest.mock('services/cd-ng')
const useDeleteServiceV2Mock = useDeleteServiceV2 as jest.MockedFunction<any>

useDeleteServiceV2Mock.mockImplementation(() => {
  return {
    mutate: deleteService
  }
})

describe('service delete menu item tests', () => {
  test('open delete confirmation dialog and cancel', async () => {
    const { findByText } = render(
      <TestWrapper>
        <ServiceDeleteMenuItem identifier="serviceIdentifier" name="serviceTestName" remoteQueryParams="test" />
      </TestWrapper>
    )

    const deleteBtn = await findByText('delete')
    fireEvent.click(deleteBtn)
    const confirmationDialog = findDialogContainer() as HTMLElement
    expect(getByText(confirmationDialog, 'common.deleteServiceConfirmation')).toBeInTheDocument()
    const cancelBtn = document.body.querySelector('button[aria-label="cancel"]')
    expect(cancelBtn).not.toBeNull()
    fireEvent.click(cancelBtn!)
    expect(findDialogContainer() as HTMLElement).toBeNull()
  })

  test('delete service success', async () => {
    const onSuccess = jest.fn().mockImplementation(() => void 0)
    const { findByText } = render(
      <TestWrapper>
        <ServiceDeleteMenuItem
          identifier="serviceIdentifier"
          name="serviceTestName"
          remoteQueryParams="test"
          onServiceDeleteSuccess={onSuccess}
        />
      </TestWrapper>
    )

    const deleteBtn = await findByText('delete')
    fireEvent.click(deleteBtn)
    const confirmBtn = document.body.querySelector('button[aria-label="confirm"]')
    expect(confirmBtn).not.toBeNull()
    fireEvent.click(confirmBtn!)
    expect(deleteService).toBeCalled()
    await waitFor(() => expect(onSuccess).toBeCalled())
  })

  test('delete service fail with force delete true and error code ENTITY_REFERENCE_EXCEPTION', async () => {
    const deleteServiceMock = jest.fn().mockImplementation(() => {
      return Promise.reject({
        data: {
          code: 'ENTITY_REFERENCE_EXCEPTION'
        }
      })
    })
    useDeleteServiceV2Mock.mockImplementation(() => {
      return {
        mutate: deleteServiceMock
      }
    })

    const onSuccess = jest.fn().mockImplementation(() => void 0)
    const { findByText } = render(
      <TestWrapper>
        <ServiceDeleteMenuItem
          identifier="serviceIdentifier"
          name="serviceTestName"
          remoteQueryParams="test"
          onServiceDeleteSuccess={onSuccess}
          isForceDeleteEnabled={true}
        />
      </TestWrapper>
    )

    const deleteBtn = await findByText('delete')
    fireEvent.click(deleteBtn)
    const confirmBtn = document.body.querySelector('button[aria-label="confirm"]')

    await act(() => {
      fireEvent.click(confirmBtn!)
    })

    await waitFor(() => expect(getByText(document.body, 'common.cantDeleteEntity')).toBeInTheDocument())

    expect(getByText(document.body, 'common.referenceTextWarning')).toBeInTheDocument()

    const checkbox = document.body.querySelector('input[name="forcedDelete-SERVICE"]')
    await act(() => {
      fireEvent.click(checkbox!)
    })

    const deleteBtnReferenceDialog = document.body.querySelector('button[aria-label="delete"]')
    await act(() => {
      fireEvent.click(deleteBtnReferenceDialog!)
    })

    expect(deleteServiceMock).toBeCalled()
  })

  test('delete service fail with force delete true and error code ACTIVE_SERVICE_INSTANCES_PRESENT_EXCEPTION', async () => {
    const deleteServiceMock = jest.fn().mockImplementation(() => {
      return Promise.reject({
        data: {
          code: 'ACTIVE_SERVICE_INSTANCES_PRESENT_EXCEPTION'
        }
      })
    })
    useDeleteServiceV2Mock.mockImplementation(() => {
      return {
        mutate: deleteServiceMock
      }
    })

    const onSuccess = jest.fn().mockImplementation(() => void 0)
    const { findByText, container } = render(
      <TestWrapper>
        <ServiceDeleteMenuItem
          identifier="serviceIdentifier"
          name="serviceTestName"
          remoteQueryParams="test"
          onServiceDeleteSuccess={onSuccess}
          isForceDeleteEnabled={true}
        />
      </TestWrapper>
    )

    const deleteBtn = await findByText('delete')
    fireEvent.click(deleteBtn)
    const confirmBtn = document.body.querySelector('button[aria-label="confirm"]')

    await act(async () => {
      await fireEvent.click(confirmBtn!)
    })

    await waitFor(() => expect(getByText(document.body, 'common.cantDeleteEntity')).toBeInTheDocument())

    const checkbox = document.body.querySelector('input[name="forcedDelete-SERVICE"]')
    await act(() => {
      fireEvent.click(checkbox!)
    })

    expect(container).toBeDefined()

    const deleteBtnReferenceDialog = document.body.querySelector('button[aria-label="delete"]')
    await act(async () => {
      await fireEvent.click(deleteBtnReferenceDialog!)
    })

    expect(deleteServiceMock).toBeCalledTimes(2)
  })

  test('delete service fail with some random error', async () => {
    useDeleteServiceV2Mock.mockImplementation(() => {
      return {
        mutate: jest.fn().mockImplementation(() => {
          return Promise.reject({
            data: {
              code: 'TEST'
            }
          })
        })
      }
    })

    const onSuccess = jest.fn().mockImplementation(() => void 0)
    const { findByText } = render(
      <TestWrapper>
        <ServiceDeleteMenuItem
          identifier="serviceIdentifier"
          name="serviceTestName"
          remoteQueryParams="test"
          onServiceDeleteSuccess={onSuccess}
        />
      </TestWrapper>
    )

    const deleteBtn = await findByText('delete')
    fireEvent.click(deleteBtn)
    const confirmBtn = document.body.querySelector('button[aria-label="confirm"]')

    await act(() => {
      fireEvent.click(confirmBtn!)
    })

    expect(document.body.querySelector('svg[data-icon="warning-sign"]')).toBeInTheDocument()
  })
})
