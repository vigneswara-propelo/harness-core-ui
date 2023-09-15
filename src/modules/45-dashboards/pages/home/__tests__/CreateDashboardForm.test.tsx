/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, RenderResult, screen, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { StringKeys } from 'framework/strings'
import * as customDashboardServices from 'services/custom-dashboards'
import { FolderType } from '@dashboards/constants/FolderType'
import CreateDashboardForm, { CreateDashboardFormProps } from '../CreateDashboardForm'

const defaultProps: CreateDashboardFormProps = {
  editableFolders: [],
  hideModal: jest.fn()
}

const renderComponent = (props: CreateDashboardFormProps): RenderResult => {
  return render(
    <TestWrapper>
      <CreateDashboardForm {...props} />
    </TestWrapper>
  )
}

const mockEmptyGetFolderResponse: customDashboardServices.GetFolderResponse = {
  resource: [] as any
}

describe('CreateDashboardForm', () => {
  beforeEach(() => {
    jest
      .spyOn(customDashboardServices, 'useSearchFolders')
      .mockImplementation(() => ({ data: mockEmptyGetFolderResponse, loading: false } as any))
  })
  afterEach(() => {
    jest.spyOn(customDashboardServices, 'useCreateDashboard').mockReset()
    jest.spyOn(customDashboardServices, 'useSearchFolders').mockReset()
  })

  test('it should display Create Dashboard Form', () => {
    renderComponent(defaultProps)

    const formTitle: StringKeys = 'dashboards.createModal.stepOne'
    expect(screen.getByText(formTitle)).toBeInTheDocument()
  })

  test('it should trigger callbacks and show toast upon successful submission', async () => {
    const resourceIdentifier = '456'
    const mockCallbackCreate = jest.fn(() => Promise.resolve({ resource: { resourceIdentifier } }))
    jest
      .spyOn(customDashboardServices, 'useCreateDashboard')
      .mockImplementation(() => ({ mutate: mockCallbackCreate, loading: false } as any))
    const mockCallbackHide = jest.fn()

    const testProps: CreateDashboardFormProps = {
      editableFolders: [{ id: 'one', name: 'two', sub_folders: [], type: FolderType.ACCOUNT }],
      hideModal: mockCallbackHide
    }

    renderComponent(testProps)

    const nameInput = screen.getByPlaceholderText('dashboards.createModal.namePlaceholder')
    fireEvent.change(nameInput, { target: { value: '23' } })

    const formButtonText: StringKeys = 'continue'
    const formButton = screen.getByText(formButtonText)
    expect(formButton).toBeInTheDocument()

    act(() => {
      fireEvent.click(formButton)
    })

    const successToastText: StringKeys = 'dashboards.createModal.success'
    await waitFor(() => expect(screen.getByText(successToastText)).toBeInTheDocument())

    expect(mockCallbackCreate).toHaveBeenCalled()
    expect(mockCallbackHide).toHaveBeenCalled()
  })

  test('it should show failure toast upon unsuccessful submission', async () => {
    const mockCallbackCreate = jest.fn(() => Promise.reject())
    jest
      .spyOn(customDashboardServices, 'useCreateDashboard')
      .mockImplementation(() => ({ mutate: mockCallbackCreate, loading: false } as any))
    const mockCallbackHide = jest.fn()

    const testProps: CreateDashboardFormProps = {
      editableFolders: [{ id: 'one', name: 'two', sub_folders: [], type: FolderType.ACCOUNT }],
      hideModal: mockCallbackHide
    }

    renderComponent(testProps)

    const nameInput = screen.getByPlaceholderText('dashboards.createModal.namePlaceholder')
    fireEvent.change(nameInput, { target: { value: '23' } })

    const formButtonText: StringKeys = 'continue'
    const formButton = screen.getByText(formButtonText)
    expect(formButton).toBeInTheDocument()

    act(() => {
      fireEvent.click(formButton)
    })

    const failToastText: StringKeys = 'dashboards.createModal.submitFail'
    await waitFor(() => expect(screen.getByText(failToastText)).toBeInTheDocument())

    expect(mockCallbackCreate).toHaveBeenCalledTimes(1)
    expect(mockCallbackHide).toHaveBeenCalledTimes(0)
  })
})
