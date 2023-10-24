/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen, fireEvent, getAllByText, act } from '@testing-library/react'
import { TestWrapper, findPopoverContainer, findDialogContainer } from '@common/utils/testUtils'
import ProjectsHeader from '@projects-orgs/components/SettingsPageComponent/ProjectsHeader'
import {
  createMockData,
  projectMockDataWithModules,
  userMockData,
  invitesMockData,
  response,
  roleMockData
} from './Mocks'

const deleteProject = jest.fn()
const deleteProjectMock = (): Promise<{ status: string }> => {
  deleteProject()
  return Promise.resolve({ status: 'SUCCESS', data: true })
}

jest.mock('services/cd-ng', () => ({
  useDeleteProject: jest.fn().mockImplementation(() => ({ mutate: deleteProjectMock })),
  usePutProject: jest.fn().mockImplementation(() => createMockData),
  useGetProject: jest.fn().mockImplementation(() => {
    return { ...projectMockDataWithModules, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetProjectAggregateDTOList: jest.fn().mockImplementation(() => {
    return { data: projectMockDataWithModules, refetch: jest.fn(), error: null }
  }),
  useGetInvites: jest.fn().mockImplementation(() => ({ data: invitesMockData, loading: false, refetch: jest.fn() })),
  useAddUsers: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useDeleteInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useUpdateInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) }))
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: userMockData, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('services/rbac', () => ({
  useGetRoleList: jest.fn().mockImplementation(() => ({ data: roleMockData, loading: false, refetch: jest.fn() }))
}))

function WrapperComponent(): JSX.Element {
  return (
    <TestWrapper>
      <ProjectsHeader data={projectMockDataWithModules as any} refetch={jest.fn()} />
    </TestWrapper>
  )
}

describe('Projects Header', () => {
  test('should display project name', async () => {
    render(<WrapperComponent />)
    await waitFor(() => {
      expect(screen.getByText('project-name')).toBeInTheDocument()
    })
  })
  test('should open popover menu on click', () => {
    render(<WrapperComponent />)
    fireEvent.click(screen.getByRole('button'))
    const popover = findPopoverContainer()
    expect(popover).toBeDefined()
  })
  test('collaborator modal should open on clicking +', async () => {
    const { container } = render(<WrapperComponent />)
    const plus = getAllByText(container, '+')[1]
    await act(async () => {
      fireEvent.click(plus)
    })
    const form = findDialogContainer()
    expect(form).toBeDefined()
  })
})
