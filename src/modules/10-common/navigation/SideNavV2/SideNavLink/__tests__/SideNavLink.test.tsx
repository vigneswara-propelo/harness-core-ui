/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor, queryByText } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LayoutContext, SIDE_NAV_STATE } from '@modules/10-common/router/RouteWithLayoutV2'
import { Scope } from 'framework/types/types'
import * as SideNavUtils from '@common/navigation/SideNavV2/SideNavV2.utils'
import routes from '@common/RouteDefinitionsV2'
import { TestWrapper, findDialogContainer, findPopoverContainer } from '@common/utils/testUtils'
import SideNavLink from '../SideNavLink'

describe('SideNavLink', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should render link', async () => {
    const { container } = render(
      <TestWrapper>
        <SideNavLink
          label={'text'}
          icon={'add'}
          to={routes.toOverview({
            accountId: 'abcd',
            projectIdentifier: 'abcd',
            orgIdentifier: 'abcd',
            module: 'cd'
          })}
        />
      </TestWrapper>
    )
    const link = queryByText(container, 'text') as HTMLElement
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/account/abcd/cd/orgs/abcd/projects/abcd/overview')
    const icon = container.querySelector('[data-icon="add"]') as HTMLInputElement
    expect(icon).toBeInTheDocument()
  })

  test('show scope switch dialog when target scope is account', async () => {
    jest.spyOn(SideNavUtils, 'useGetSelectedScope').mockReturnValue({
      scope: Scope.ORGANIZATION
    })
    const { container, getByTestId } = render(
      <TestWrapper
        defaultAppStoreValues={{ selectedProject: { orgIdentifier: 'orgIdentifier', identifier: '', name: '' } }}
      >
        <SideNavLink
          label={'text'}
          scope={Scope.ACCOUNT}
          to={routes.toOverview({
            accountId: 'abcd',
            projectIdentifier: 'abcd',
            orgIdentifier: 'abcd',
            module: 'cd'
          })}
        />
      </TestWrapper>
    )
    const link = queryByText(container, 'text') as HTMLElement
    const user = userEvent.setup()
    await user.click(link)

    await waitFor(() => {
      const dialog = findDialogContainer() as HTMLElement
      expect(queryByText(dialog, 'common.scopeSwitchDialog.secondary.title')).toBeInTheDocument()
      user.click(screen.getByText('continue'))
    })
    await waitFor(() => getByTestId('location'))
    expect(getByTestId('location')).toHaveTextContent('/overview')
  })

  test('show scope switch dialog when target scope is organization', async () => {
    const { container, getByTestId } = render(
      <TestWrapper
        defaultAppStoreValues={{ selectedProject: { orgIdentifier: 'orgIdentifier', identifier: '', name: '' } }}
      >
        <SideNavLink
          label={'text'}
          scope={Scope.ORGANIZATION}
          to={routes.toOverview({
            accountId: 'abcd',
            projectIdentifier: 'abcd',
            orgIdentifier: 'abcd',
            module: 'cd'
          })}
        />
      </TestWrapper>
    )
    jest.spyOn(SideNavUtils, 'useGetSelectedScope').mockReturnValue({
      scope: Scope.PROJECT
    })
    const link = queryByText(container, 'text') as HTMLElement
    const user = userEvent.setup()
    user.click(link)

    await waitFor(() => {
      const dialog = findDialogContainer() as HTMLElement
      expect(queryByText(dialog, 'common.scopeSwitchDialog.secondary.title')).toBeInTheDocument()
      user.click(screen.getByText('continue'))
    })
    await waitFor(() => getByTestId('location'))
    expect(getByTestId('location')).toHaveTextContent('/orgs/abcd/overview')
  })

  test('show scope switch dialog when target scope is project', async () => {
    const { container, getByTestId } = render(
      <TestWrapper
        defaultAppStoreValues={{ selectedProject: { orgIdentifier: 'orgIdentifier', identifier: '', name: '' } }}
      >
        <SideNavLink
          label={'text'}
          scope={Scope.PROJECT}
          to={routes.toOverview({
            accountId: 'abcd',
            projectIdentifier: 'abcd',
            orgIdentifier: 'abcd',
            module: 'cd'
          })}
        />
      </TestWrapper>
    )
    jest.spyOn(SideNavUtils, 'useGetSelectedScope').mockReturnValue({
      scope: Scope.ORGANIZATION
    })
    const link = queryByText(container, 'text') as HTMLElement
    const user = userEvent.setup()
    user.click(link)
    await waitFor(() => {
      const dialog = findDialogContainer() as HTMLElement
      expect(queryByText(dialog, 'common.scopeSwitchDialog.secondary.title')).toBeInTheDocument()
      user.click(screen.getByText('continue'))
    })
    await waitFor(() => getByTestId('location'))
    expect(getByTestId('location')).toHaveTextContent('/orgs/abcd/projects/abcd/overview')
  })

  test('show scope switch dialog when target scope is project and project identifier is not present', async () => {
    const { container, getByTestId } = render(
      <TestWrapper
        defaultAppStoreValues={{ selectedProject: { orgIdentifier: 'orgIdentifier', identifier: '', name: '' } }}
      >
        <SideNavLink
          label={'text'}
          scope={Scope.PROJECT}
          to={routes.toOverview({
            accountId: 'abcd',
            orgIdentifier: 'abcd',
            module: 'cd'
          })}
        />
      </TestWrapper>
    )
    jest.spyOn(SideNavUtils, 'useGetSelectedScope').mockReturnValue({
      scope: Scope.ORGANIZATION
    })
    const link = queryByText(container, 'text') as HTMLElement
    const user = userEvent.setup()
    user.click(link)
    await waitFor(() => {
      const dialog = findDialogContainer() as HTMLElement
      expect(queryByText(dialog, 'common.scopeSwitchDialog.secondary.title')).toBeInTheDocument()
      user.click(screen.getByText('continue'))
    })
    await waitFor(() => getByTestId('location'))
    expect(getByTestId('location')).toHaveTextContent('/all?noscope=true')
  })
})

describe('sidenav links rendered differently', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('collapsed nav', async () => {
    const { container } = render(
      <TestWrapper
        defaultAppStoreValues={{ selectedProject: { orgIdentifier: 'orgIdentifier', identifier: '', name: '' } }}
      >
        <LayoutContext.Provider value={{ sideNavState: SIDE_NAV_STATE.COLLAPSED, setSideNavState: jest.fn() }}>
          <SideNavLink
            label={'text'}
            scope={Scope.PROJECT}
            to={routes.toOverview({
              accountId: 'abcd',
              orgIdentifier: 'abcd',
              module: 'cd'
            })}
          />
        </LayoutContext.Provider>
      </TestWrapper>
    )

    const link = container.querySelector('.collapsed') as HTMLElement
    const user = userEvent.setup()
    await user.hover(link)
    expect(queryByText(container, 'text')).not.toBeInTheDocument()

    await waitFor(() => {
      const popover = findPopoverContainer() as HTMLElement
      expect(popover).toBeInTheDocument()
      expect(queryByText(popover, 'text')).toBeInTheDocument()
    })
  })

  test('accordion link', async () => {
    const { container } = render(
      <TestWrapper
        defaultAppStoreValues={{ selectedProject: { orgIdentifier: 'orgIdentifier', identifier: '', name: '' } }}
      >
        <LayoutContext.Provider value={{ sideNavState: SIDE_NAV_STATE.EXPANDED, setSideNavState: jest.fn() }}>
          <SideNavLink
            label={'text'}
            isRenderedInAccordion={true}
            scope={Scope.PROJECT}
            to={routes.toOverview({
              accountId: 'abcd',
              orgIdentifier: 'abcd',
              module: 'cd'
            })}
          />
        </LayoutContext.Provider>
      </TestWrapper>
    )

    expect(queryByText(container, 'text')).toBeInTheDocument()
    const icon = container.querySelector('[data-icon="add"]') as HTMLInputElement
    expect(icon).not.toBeInTheDocument()
  })

  test('hidden link', async () => {
    const { container } = render(
      <TestWrapper
        defaultAppStoreValues={{ selectedProject: { orgIdentifier: 'orgIdentifier', identifier: '', name: '' } }}
      >
        <SideNavLink
          label={'text'}
          isRenderedInAccordion={true}
          scope={Scope.PROJECT}
          hidden={true}
          to={routes.toOverview({
            accountId: 'abcd',
            orgIdentifier: 'abcd',
            module: 'cd'
          })}
        />
      </TestWrapper>
    )

    expect(queryByText(container, 'text')).not.toBeInTheDocument()
  })
})
