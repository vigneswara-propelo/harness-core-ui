/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import routes from '@common/RouteDefinitionsV2'
import * as cdngServices from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { OrgSettingsPage } from '@projects-orgs/components/SettingsPageComponent/OrgSettingsPage'
import * as Licenses from '@common/hooks/useModuleLicenses'
import { LICENSE_STATE_VALUES } from 'framework/LicenseStore/licenseStoreUtil'
import { NAV_MODE, modulePathProps, orgPathProps } from '@common/utils/routeUtils'
import mockImport from 'framework/utils/mockImport'
import { Editions } from '@modules/10-common/constants/SubscriptionTypes'

const testPath = routes.toSettings({ ...orgPathProps, ...modulePathProps, mode: NAV_MODE.MODULE })

mockImport('framework/LicenseStore/LicenseStoreContext', {
  useLicenseStore: jest.fn().mockImplementation(() => ({
    licenseInformation: {
      CD: {
        edition: Editions.ENTERPRISE
      }
    },
    CI_LICENSE_STATE: LICENSE_STATE_VALUES.ACTIVE,
    STO_LICENSE_STATE: LICENSE_STATE_VALUES.ACTIVE,
    CD_LICENSE_STATE: LICENSE_STATE_VALUES.ACTIVE
  }))
})

mockImport('framework/AppStore/AppStoreContext', {
  useAppStore: jest.fn().mockImplementation(() => ({
    currentModule: 'cd',
    isGitSimplificationEnabled: true,
    isGitSyncEnabled: true,
    gitSyncEnabledOnlyForFF: false
  }))
})

describe('Organization Settings Page', () => {
  test('should render organization settings page', async () => {
    jest
      .spyOn(cdngServices, 'useGetSettingValue')
      .mockImplementation(() => ({ data: { data: { value: 'true' } } } as any))
    jest.spyOn(Licenses, 'useAnyEnterpriseLicense').mockReturnValue(true)
    const { getAllByText, queryByText } = render(
      <TestWrapper
        path={testPath}
        pathParams={{ accountId: 'abcd', module: 'cd', orgIdentifier: 'efgh', projectIdentifier: 'ijkl' }}
        defaultFeatureFlagValues={{
          CDS_SERVICE_OVERRIDES_2_0: true,
          STO_JIRA_INTEGRATION: true
        }}
      >
        <OrgSettingsPage />
      </TestWrapper>
    )
    expect(queryByText('common.settingsPage.title.orgSettingsTitle')).toBeInTheDocument()
    expect(getAllByText('common.settingCategory.general')).toHaveLength(2)
    expect(getAllByText('common.settingsPage.title.orgLevelResources')).toHaveLength(2)
    expect(getAllByText('GitOps')).toHaveLength(2)
    expect(getAllByText('accessControl')).toHaveLength(2)
    expect(getAllByText('common.settingsPage.title.securityGovernance')).toHaveLength(2)
    expect(getAllByText('common.tickets.externalTickets')).toHaveLength(3)

    expect(queryByText('common.defaultSettings')).toBeInTheDocument()
    expect(queryByText('services')).toBeInTheDocument()
    expect(queryByText('environments')).toBeInTheDocument()
    expect(queryByText('connectorsLabel')).toBeInTheDocument()
    expect(queryByText('delegate.delegates')).toBeInTheDocument()
    expect(queryByText('common.secrets')).toBeInTheDocument()
    expect(queryByText('resourcePage.fileStore')).toBeInTheDocument()
    expect(queryByText('common.templates')).toBeInTheDocument()
    expect(queryByText('common.variables')).toBeInTheDocument()
    expect(queryByText('common.overrides')).toBeInTheDocument()
    expect(queryByText('common.gitopsAgents')).toBeInTheDocument()
    expect(queryByText('repositories')).toBeInTheDocument()
    expect(queryByText('common.clusters')).toBeInTheDocument()
    expect(queryByText('common.repositoryCertificates')).toBeInTheDocument()
    expect(queryByText('common.gnupgKeys')).toBeInTheDocument()
    expect(queryByText('users')).toBeInTheDocument()
    expect(queryByText('common.userGroups')).toBeInTheDocument()
    expect(queryByText('common.serviceAccounts')).toBeInTheDocument()
    expect(queryByText('resourceGroups')).toBeInTheDocument()
    expect(queryByText('roles')).toBeInTheDocument()
    expect(queryByText('common.governance')).toBeInTheDocument()
    expect(queryByText('common.freezeWindows')).toBeInTheDocument()
    expect(queryByText('common.auditTrail')).toBeInTheDocument()
  })
})
