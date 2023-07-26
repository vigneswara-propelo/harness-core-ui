/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { queryByAttribute, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper, queryByNameAttribute } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import IDPProjectSetup from '../IDPProjectSetup'
import { projectMock, orgMockData, createMockData, invitesMockData, response, roleMockData } from './mock'

jest.mock('services/cd-ng', () => ({
  useGetProjectAggregateDTOList: jest.fn().mockImplementation(() => {
    return { data: projectMock, refetch: jest.fn(), error: null }
  }),
  useDeleteProject: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetOrganizationList: jest.fn().mockImplementation(() => {
    return { ...orgMockData, refetch: jest.fn(), error: null }
  }),
  usePostProject: jest.fn().mockImplementation(() => createMockData),
  useGetInvites: jest.fn().mockImplementation(() => ({ data: invitesMockData, loading: false, refetch: jest.fn() })),
  useAddUsers: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useDeleteInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useUpdateInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useResendVerifyEmail: jest.fn().mockImplementation(() => {
    return {
      cancel: jest.fn(),
      loading: false,
      mutate: jest.fn().mockImplementation(() => {
        return {
          status: 'SUCCESS'
        }
      })
    }
  }),
  useGetUsers: jest.fn().mockReturnValue(() => ({
    mutate: jest.fn()
  }))
}))

jest.mock('services/rbac', () => ({
  useGetRoleList: jest.fn().mockImplementation(() => ({ data: roleMockData, loading: false, refetch: jest.fn() }))
}))

describe('IDP Project Setup', () => {
  test('component renders correctly and project card are visible', () => {
    const { getByText } = render(
      <TestWrapper
        path={routes.toIDPProjectSetup({
          ...accountPathProps
        })}
        pathParams={{
          accountId: 'accountId'
        }}
      >
        <IDPProjectSetup />
      </TestWrapper>
    )
    expect(getByText('common.projectSetup')).toBeInTheDocument()
    expect(document.getElementsByClassName('Breadcrumbs--breadcrumb').length).toBe(2)
    expect(getByText('idp.createChooseProject')).toBeInTheDocument()
    expect(document.getElementsByClassName('projectCard').length).toBe(7)
  })

  test('select a project ', async () => {
    const { getByText, getByTestId } = render(
      <TestWrapper
        path={routes.toIDPProjectSetup({
          ...accountPathProps
        })}
        pathParams={{
          accountId: 'accountId'
        }}
      >
        <IDPProjectSetup />
      </TestWrapper>
    )
    expect(getByText('idp.chooseProject')).toBeDefined()
    expect(getByText('idp.createProject')).toBeDefined()
    const projectCard = getByText('Project 1')
    expect(projectCard).toBeDefined()
    await userEvent.click(projectCard)

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/accountId/idp-admin/orgs/Cisco_Prime/projects/Project_1/pipelines
      </div>
    `)
  })

  test('create a new IDP project', async () => {
    const { container, getByText, getByTestId } = render(
      <TestWrapper
        path={routes.toIDPProjectSetup({
          ...accountPathProps
        })}
        pathParams={{
          accountId: 'accountId'
        }}
      >
        <IDPProjectSetup />
      </TestWrapper>
    )
    const createProjectBtn = getByText('idp.createProject')
    expect(createProjectBtn).toBeInTheDocument()
    await userEvent.click(createProjectBtn)

    const nameInput = queryByNameAttribute('name', container)
    expect(nameInput).toBeDefined()
    await userEvent.type(nameInput!, 'IDP Test Project')
    await waitFor(() => expect(nameInput).toHaveDisplayValue('IDP Test Project'))
    expect(getByText('IDP_Test_Project')).toBeInTheDocument()

    const orgIdentifier = queryByNameAttribute('orgIdentifier', container)
    expect(orgIdentifier).toBeDefined()
    await userEvent.click(orgIdentifier!)
    expect(getByText('Org Name')).toBeInTheDocument()
    const orgToBeSelected = getByText('default')
    expect(orgToBeSelected).toBeInTheDocument()
    await userEvent.click(orgToBeSelected)

    const placeholderText = 'http://localhost/#/account/accountId/home/orgs/default/projects/IDP_Test_Project/details'
    expect(queryByAttribute('placeholder', container, placeholderText)).toBeInTheDocument()

    const submitProjectBtn = screen.getByRole('button', { name: 'saveAndContinue' })
    expect(submitProjectBtn).toBeDefined()
    await userEvent.click(submitProjectBtn)
    expect(getByTestId('location')).toMatchInlineSnapshot(`
        <div
          data-testid="location"
        >
          /account/accountId/idp-admin/orgs/default/projects/IDP_Test_Project/pipelines
        </div>
      `)
  })
})
