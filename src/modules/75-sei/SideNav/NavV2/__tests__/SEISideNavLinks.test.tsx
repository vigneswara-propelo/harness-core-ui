/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'
import { Scope } from 'framework/types/types'
import { ScopeSwitchProps } from '@modules/10-common/navigation/SideNavV2/SideNavV2'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import { NAV_MODE } from '@modules/10-common/utils/routeUtils'
import { getAccountLevelRedirectionProps, getProjectLevelRedirectionProps } from '../SEISideNavLinks.utils'
import SEISideNavLinks from '../SEISideNavLinks'

describe('SEISideNavLinks Component', () => {
  const props = {
    mode: NAV_MODE.MODULE
  } as any

  test('renders SEISideNavLinks component', () => {
    render(
      <MemoryRouter>
        <TestWrapper>
          <SEISideNavLinks {...props} />
        </TestWrapper>
      </MemoryRouter>
    )

    const dataSettingsLabel = screen.getByText('sei.accountSettings.dataSettings.label')
    const integrationsLabel = screen.getByText('sei.accountSettings.dataSettings.integrations')
    const contributorsLabel = screen.getByText('sei.accountSettings.dataSettings.contributors')

    expect(dataSettingsLabel).toBeInTheDocument()
    expect(integrationsLabel).toBeInTheDocument()
    expect(contributorsLabel).toBeInTheDocument()
  })
})

describe('getProjectLevelRedirectionProps function', () => {
  const getString = (key: string): string => key
  test('should return the correct object for Scope.ACCOUNT when account access is present', () => {
    const history = { push: jest.fn() } as any

    const accountId = '123'

    const result = getProjectLevelRedirectionProps(history, accountId, getString) as Partial<
      Record<Scope, ScopeSwitchProps>
    >

    expect(result?.[Scope.ACCOUNT]?.link?.icon).toBe('ccm-cloud-integration-settings')
    expect(result?.[Scope.ACCOUNT]?.link?.label).toBe('sei.goToIntegrations')
    expect(typeof result?.[Scope.ACCOUNT]?.link?.onClick).toBe('function')

    result?.[Scope.ACCOUNT]?.link?.onClick()
    expect(history.push).toHaveBeenCalledWith('/account/123/sei/configuration/integrations')
  })
})

describe('getAccountLevelRedirectionProps function', () => {
  const getString = (key: string): string => key
  test('should return the correct object for Scope.PROJECT', () => {
    const history = { push: jest.fn() } as any
    const accountId = '123'
    const targetScopeParams = {
      projectIdentifier: 'project123',
      orgIdentifier: 'org456',
      accountId: 'accountId'
    }

    const result = getAccountLevelRedirectionProps(history, accountId, getString)

    expect(result?.[Scope.PROJECT]?.link?.icon).toBe('graph-increase')
    expect(result?.[Scope.PROJECT]?.link?.label).toBe('sei.goToInsights')
    expect(typeof result?.[Scope.PROJECT]?.link?.onClick).toBe('function')

    result?.[Scope.PROJECT]?.link?.onClick(targetScopeParams)
    expect(history.push).toHaveBeenCalledWith('/account/123/sei/orgs/org456/projects/project123/dashboards')
  })
})
