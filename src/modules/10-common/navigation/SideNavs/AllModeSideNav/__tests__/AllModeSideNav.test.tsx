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
import AllModeSideNav from '@common/navigation/SideNavs/AllModeSideNav/AllModeSideNav'
import { usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import CDRouteDestinations from '@modules/75-cd/RouteDestinationsV2'
import { SideNav } from '@common/navigation/SideNavV2/SideNavV2'
import routes from '@modules/10-common/RouteDefinitionsV2'
import { Scope } from 'framework/types/types'

const navModuleInfoMapMock = {
  CD: {
    icon: 'cd-main',
    label: 'common.cdAndGitops',
    homePageUrl: '/account/px7xd_BFRCi-pfWPYXVjvw/module/cd?noscope=true',
    shouldVisible: true,
    hasLicense: true,
    color: '--cd-border',
    backgroundColor: '',
    shortLabel: 'deploymentsText',
    moduleIntro: 'common.moduleIntro.deployments'
  },
  IDP: {
    icon: 'idp-main',
    label: 'common.idp',
    homePageUrl: '/account/px7xd_BFRCi-pfWPYXVjvw/module/idp?noscope=true',
    shouldVisible: true,
    hasLicense: true,
    color: '--idp-border',
    backgroundColor: '',
    shortLabel: 'idp',
    moduleIntro: 'common.moduleIntro.idp'
  }
}

jest.mock('@common/hooks/useNavModuleInfo', () => {
  return {
    __esModule: true,
    default: () => {
      return {
        icon: 'cd-main',
        label: 'common.cdAndGitops',
        homePageUrl: '/account/px7xd_BFRCi-pfWPYXVjvw/cd',
        shouldVisible: true,
        hasLicense: true,
        color: '--cd-border',
        backgroundColor: '--cd-background',
        shortLabel: 'deploymentsText',
        moduleIntro: 'common.moduleIntro.deployments'
      }
    },
    useNavModuleInfoMap: () => {
      return navModuleInfoMapMock
    },
    DEFAULT_MODULES_ORDER: ['CD']
  }
})

jest.mock('@common/utils/routeUtils', () => {
  return {
    ...jest.requireActual('@common/utils/routeUtils'),
    getRouteParams: jest
      .fn()
      .mockReturnValue({ orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' })
  }
})

const mockSideNavLinks: JSX.Element = (
  <SideNav.Main>
    <SideNav.Section>
      <SideNav.Scope scope={Scope.PROJECT}>
        <SideNav.Title label={'overview'} />
        <SideNav.Link
          icon="nav-home"
          label={'overview'}
          to={routes.toOverview({
            accountId: 'abcd',
            projectIdentifier: 'abcd',
            orgIdentifier: 'abcd',
            module: 'cd'
          })}
          hidden={false}
        />
      </SideNav.Scope>
    </SideNav.Section>
  </SideNav.Main>
)

jest.mock('@modules/ModuleRouteConfig', () => ({
  CD: {
    sideNavLinks: jest.fn().mockImplementation(() => mockSideNavLinks),
    routes: jest.fn().mockImplementation(() => CDRouteDestinations())
  },
  IDP: {
    sideNavLinks: jest.fn().mockImplementation(() => undefined),
    routes: jest.fn().mockImplementation(() => undefined)
  }
}))

jest.mock('framework/PreferenceStore/PreferenceStoreContext')
;(usePreferenceStore as jest.Mock).mockImplementation(() => {
  return {
    setPreference: jest.fn(),
    preference: {
      orderedModules: ['CD', 'IDP'],
      selectedModules: ['CD', 'IDP']
    },
    clearPreference: jest.fn()
  }
})

describe('All mode side nav', () => {
  test('should render all mode side nav', () => {
    render(
      <TestWrapper>
        <AllModeSideNav />
      </TestWrapper>
    )
    expect(screen.getByText('overview')).toBeInTheDocument()
    expect(screen.getByText('pipelines')).toBeInTheDocument()
    expect(screen.getByText('executionsText')).toBeInTheDocument()
    expect(screen.getByText('common.settingsPage.title.projectSettingsTitle')).toBeInTheDocument()
    expect(document.querySelector('[data-testid="CD-summary"]')).toBeInTheDocument()
  })
  test('should render modules accordion on click', async () => {
    render(
      <TestWrapper>
        <AllModeSideNav />
      </TestWrapper>
    )
    expect(document.querySelector('[data-testid="CD-summary"]')).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(document.querySelector('[data-testid="CD-summary"]') as HTMLElement)

    expect(document.querySelector('[data-testid="CD-details"]')).toBeInTheDocument()
  })
})
