/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { NAV_MODE } from '@common/utils/routeUtils'
import NGBreadcrumbsV2 from '@common/components/NGBreadcrumbs/NGBreadcrumbsV2'
import { Scope } from 'framework/types/types'
import mockImport from 'framework/utils/mockImport'

mockImport('framework/AppStore/AppStoreContext', {
  useAppStore: jest.fn().mockImplementation(() => ({
    selectedProject: { name: 'selectedProjectName' },
    selectedOrg: { name: 'selectedOrgName' },
    accountInfo: { name: 'accountName' },
    currentMode: NAV_MODE.ALL
  }))
})

mockImport('@common/navigation/SideNavV2/SideNavV2.utils', {
  useGetSelectedScope: jest.fn().mockImplementation(() => ({
    scope: Scope.PROJECT
  }))
})

mockImport('@common/navigation/SideNavV2/ScopeSwitchDialog/useSecondaryScopeSwiitchDialog', {
  useSecondaryScopeSwitchDialog: jest.fn().mockImplementation(() => ({
    showDialog: jest.fn(),
    closeDialog: jest.fn()
  }))
})

jest.mock('@common/utils/routeUtils', () => {
  return {
    ...jest.requireActual('@common/utils/routeUtils'),
    getRouteParams: jest
      .fn()
      .mockReturnValue({ module: 'cd', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' })
  }
})

function WrapperComponent(): JSX.Element {
  return (
    <TestWrapper>
      <NGBreadcrumbsV2 links={[{ url: 'url', label: 'label' }]} />
    </TestWrapper>
  )
}

describe('NGBreadcrumbsV2', () => {
  test('should render correctly', async () => {
    const { container } = render(<WrapperComponent />)
    fireEvent.click(container.querySelector('span[class="bp3-popover-target"]') as HTMLElement)
    await waitFor(() => {
      expect(screen.getByText('account: accountName')).toBeInTheDocument()
      expect(screen.getByText('orgLabel: selectedOrgName')).toBeInTheDocument()
      expect(screen.getByText('projectLabel: selectedProjectName')).toBeInTheDocument()
      expect(screen.getByText('label')).toBeInTheDocument()
    })
  })
  test('on clicking account should call showSecondaryScopeSwitchDialog', async () => {
    const { container, getByTestId } = render(<WrapperComponent />)
    fireEvent.click(container.querySelector('span[class="bp3-popover-target"]') as HTMLElement)
    fireEvent.click(screen.getByText('account: accountName'))
    await waitFor(() => getByTestId('location'))
    expect(getByTestId('location')).toHaveTextContent('/')
  })
  test('on clicking org should call showSecondaryScopeSwitchDialog', async () => {
    const { container, getByTestId } = render(<WrapperComponent />)
    fireEvent.click(container.querySelector('span[class="bp3-popover-target"]') as HTMLElement)
    fireEvent.click(screen.getByText('orgLabel: selectedOrgName'))
    act(() => {
      waitFor(() => getByTestId('location'))
    })
    expect(getByTestId('location')).toHaveTextContent('/')
  })
  test('should render name only if label is not present', async () => {
    mockImport('framework/AppStore/AppStoreContext', {
      useAppStore: jest.fn().mockImplementation(() => ({
        selectedProject: { name: 'selectedProjectName' }
      }))
    })
    const { container } = render(<WrapperComponent />)
    fireEvent.click(container.querySelector('span[class="bp3-popover-target"]') as HTMLElement)
    await waitFor(() => {
      expect(screen.getByText('account')).toBeInTheDocument()
      expect(screen.getByText('orgLabel')).toBeInTheDocument()
      expect(screen.getByText('projectLabel: selectedProjectName')).toBeInTheDocument()
    })
  })
})
