/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import AdminSideNav from '@common/navigation/SideNavs/AdminSideNav/AdminSideNav'
import mockImport from 'framework/utils/mockImport'
import * as SideNavUtils from '@common/navigation/SideNavV2/SideNavV2.utils'
import { Scope } from 'framework/types/types'

mockImport('framework/AppStore/AppStoreContext', {
  useAppStore: jest.fn().mockImplementation(() => ({
    selectedProject: {
      orgIdentifier: 'default',
      identifier: 'vbtestci',
      name: 'vb-test-ci',
      color: '#0063f7',
      modules: [
        'CD',
        'CI',
        'CV',
        'CF',
        'CE',
        'STO',
        'CHAOS',
        'SRM',
        'IACM',
        'CET',
        'IDP',
        'CODE',
        'CORE',
        'PMS',
        'TEMPLATESERVICE'
      ],
      description: '',
      tags: {}
    }
  }))
})

describe('Admin Sidenav', () => {
  test('should render side nav', () => {
    const { queryByText } = render(
      <TestWrapper pathParams={{ accountId: 'abcd', orgIdentifier: 'efgh', projectIdentifier: 'svsdv' }}>
        <AdminSideNav />
      </TestWrapper>
    )
    expect(queryByText('common.accountOverview')).toBeInTheDocument()
    expect(queryByText('orgsText')).toBeInTheDocument()
    expect(queryByText('projectsText')).toBeInTheDocument()
    expect(queryByText('common.accountSettings')).toBeInTheDocument()
  })
  test('should redirect correctly on clicking organizations link', async () => {
    const { getByTestId } = render(
      <TestWrapper pathParams={{ accountId: 'abcd', orgIdentifier: 'efgh', projectIdentifier: 'svsdv' }}>
        <AdminSideNav />
      </TestWrapper>
    )
    const user = userEvent.setup()
    await user.click(screen.getByText('orgsText'))
    expect(getByTestId('location')).toHaveTextContent('/organizations')
  })
  test('should redirect correctly on clicking projects link', async () => {
    const { getByTestId } = render(
      <TestWrapper pathParams={{ accountId: 'abcd', orgIdentifier: 'efgh', projectIdentifier: 'svsdv' }}>
        <AdminSideNav />
      </TestWrapper>
    )
    const user = userEvent.setup()
    await user.click(screen.getByText('projectsText'))
    expect(getByTestId('location')).toHaveTextContent('/projects')
  })
  test('should redirect correctly on clicking account settings link', async () => {
    const { getByTestId } = render(
      <TestWrapper pathParams={{ accountId: 'abcd', orgIdentifier: 'efgh', projectIdentifier: 'svsdv' }}>
        <AdminSideNav />
      </TestWrapper>
    )
    const user = userEvent.setup()
    await user.click(screen.getByText('common.accountSettings'))
    expect(getByTestId('location')).toHaveTextContent('/settings')
  })
  test('should render back to orgs link in org scope', () => {
    jest.spyOn(SideNavUtils, 'useGetSelectedScope').mockReturnValue({
      scope: Scope.ORGANIZATION
    })
    const { queryByText } = render(
      <TestWrapper pathParams={{ accountId: 'abcd', orgIdentifier: 'efgh', projectIdentifier: 'svsdv' }}>
        <AdminSideNav />
      </TestWrapper>
    )
    expect(queryByText('common.backToOrgs')).toBeInTheDocument()
  })
  test('should render back to projects link in project scope', () => {
    jest.spyOn(SideNavUtils, 'useGetSelectedScope').mockReturnValue({
      scope: Scope.PROJECT
    })
    const { queryByText } = render(
      <TestWrapper pathParams={{ accountId: 'abcd', orgIdentifier: 'efgh', projectIdentifier: 'svsdv' }}>
        <AdminSideNav />
      </TestWrapper>
    )
    expect(queryByText('back')).toBeInTheDocument()
  })
})
