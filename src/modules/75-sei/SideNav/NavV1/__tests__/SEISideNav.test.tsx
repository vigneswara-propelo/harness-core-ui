/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import mockImport from 'framework/utils/mockImport'
import * as usePermission from '@rbac/hooks/usePermission'
import SEISideNav from '../SEISideNav'

jest.mock('@projects-orgs/components/ProjectSelector/ProjectSelector', () => ({
  ProjectSelector: function ProjectSelectorComp(props: any) {
    return (
      <button
        type="button"
        onClick={() => props.onSelect({ identifier: 'project', orgIdentifier: 'org' })}
        id="projectSelectorId"
      />
    )
  }
}))

describe('SEI Sidenav Render', () => {
  test('should go to SEI dashboard when project is selected', async () => {
    jest.spyOn(usePermission, 'usePermission').mockImplementation(() => [true])
    const { container, getByTestId } = render(
      <TestWrapper
        path={routes.toModuleHome({ accountId: ':accountId', module: ':module' })}
        pathParams={{ accountId: 'dummy', module: 'sei' }}
      >
        <SEISideNav />
      </TestWrapper>
    )

    const projectButtonSel = '#projectSelectorId'
    const projectButton = await waitFor(() => container.querySelector(projectButtonSel))
    if (projectButton) fireEvent.click(projectButton)

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/dummy/sei/orgs/org/projects/project/dashboards
      </div>
    `)
  })

  test('should display project setup when  project and org is selected', () => {
    jest.spyOn(usePermission, 'usePermission').mockImplementation(() => [true])
    const orgObject = {
      identifier: '2313'
    }
    mockImport('framework/AppStore/AppStoreContext', {
      useAppStore: jest.fn().mockImplementation(() => ({
        currentUserInfo: {},
        selectedOrg: orgObject,
        selectedProject: orgObject
      }))
    })
    const { getByText } = render(
      <TestWrapper
        path={routes.toModuleHome({ accountId: ':accountId', module: ':module' })}
        pathParams={{ accountId: 'dummy', module: 'sei' }}
      >
        <SEISideNav />
      </TestWrapper>
    )
    expect(getByText('projectLabel')).toBeInTheDocument()
    expect(getByText('sei.insights')).toBeInTheDocument()
  })

  describe('Account tab', () => {
    beforeEach(() => {
      jest.spyOn(usePermission, 'usePermission').mockImplementation(() => [true])
      render(
        <TestWrapper
          path={routes.toSEIMicroFrontend({
            accountId: ':accountId',
            orgIdentifier: ':orgIdentifier',
            projectIdentifier: ':projectIdentifier'
          })}
          pathParams={{ accountId: 'dummyAccID', orgIdentifier: 'dummyOrgID', projectIdentifier: 'dummyProjID' }}
        >
          <SEISideNav />
        </TestWrapper>
      )
      const tab = screen.getByRole('tab', { name: 'account' })
      fireEvent.click(tab)
    })

    test('should go to Connectors screen', () => {
      const optionLink = screen.getByText('Integrations', { exact: false })
      if (optionLink) fireEvent.click(optionLink)
      expect(screen.getByTestId('location')).toMatchInlineSnapshot(`
        <div
          data-testid="location"
        >
          /account/dummyAccID/sei/configuration/integrations
        </div>
      `)
    })

    test('should go to contributors screen', () => {
      const optionLink = screen.getByText('contributors', { exact: false })
      if (optionLink) fireEvent.click(optionLink)
      expect(screen.getByTestId('location')).toMatchInlineSnapshot(`
        <div
          data-testid="location"
        >
          /account/dummyAccID/sei/configuration/organization_users
        </div>
      `)
    })

    test('should go to workflow screen', () => {
      const optionLink = screen.getByText('workflow', { exact: false })
      if (optionLink) fireEvent.click(optionLink)
      expect(screen.getByTestId('location')).toMatchInlineSnapshot(`
        <div
          data-testid="location"
        >
          /account/dummyAccID/sei/configuration/lead-time-profile
        </div>
      `)
    })

    test('should go to investment screen', () => {
      const optionLink = screen.getByText('investment', { exact: false })
      if (optionLink) fireEvent.click(optionLink)
      expect(screen.getByTestId('location')).toMatchInlineSnapshot(`
        <div
          data-testid="location"
        >
          /account/dummyAccID/sei/configuration/effort-investment
        </div>
      `)
    })

    test('should go to trellis screen', () => {
      const optionLink = screen.getByText('trellis', { exact: false })
      if (optionLink) fireEvent.click(optionLink)
      expect(screen.getByTestId('location')).toMatchInlineSnapshot(`
        <div
          data-testid="location"
        >
          /account/dummyAccID/sei/configuration/trellis_score_profile
        </div>
      `)
    })

    test('should go to tables screen', () => {
      const optionLink = screen.getByText('tables', { exact: false })
      if (optionLink) fireEvent.click(optionLink)
      expect(screen.getByTestId('location')).toMatchInlineSnapshot(`
        <div
          data-testid="location"
        >
          /account/dummyAccID/sei/tables
        </div>
      `)
    })

    test('should go to propels screen', () => {
      const optionLink = screen.getByText('propels', { exact: false })
      if (optionLink) fireEvent.click(optionLink)
      expect(screen.getByTestId('location')).toMatchInlineSnapshot(`
        <div
          data-testid="location"
        >
          /account/dummyAccID/sei/propels
        </div>
      `)
    })
  })

  test('should not display account if not having access for config', () => {
    jest.spyOn(usePermission, 'usePermission').mockImplementation(() => [false])
    const orgObject = {
      identifier: '2313'
    }
    mockImport('framework/AppStore/AppStoreContext', {
      useAppStore: jest.fn().mockImplementation(() => ({
        currentUserInfo: {},
        selectedOrg: orgObject,
        selectedProject: orgObject
      }))
    })
    const { container } = render(
      <TestWrapper
        path={routes.toModuleHome({ accountId: ':accountId', module: ':module' })}
        pathParams={{ accountId: 'dummy', module: 'sei' }}
      >
        <SEISideNav />
      </TestWrapper>
    )
    expect(container).not.toContain('projectLabel')
  })
})
