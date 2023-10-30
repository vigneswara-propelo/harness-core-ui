/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import routes from '@common/RouteDefinitionsV2'
import { TestWrapper } from '@common/utils/testUtils'
import { AccountSettingsPage } from '@common/pages/SettingsPages/AccountSettingsPage'
import * as Licenses from '@common/hooks/useModuleLicenses'
import { LICENSE_STATE_VALUES } from 'framework/LicenseStore/licenseStoreUtil'
import { NAV_MODE, modulePathProps, accountPathProps } from '@common/utils/routeUtils'
import mockImport from 'framework/utils/mockImport'
import { Editions } from '@modules/10-common/constants/SubscriptionTypes'

const testPath = routes.toSettings({ ...accountPathProps, ...modulePathProps, mode: NAV_MODE.MODULE })

jest.mock('services/cd-ng', () => ({
  useGetSettingValue: jest.fn().mockImplementation(() => {
    return { data: { data: { value: 'true' } } }
  }),
  useGetSmtpConfig: jest.fn().mockImplementation(() => ({
    loading: false,
    data: {
      status: 'SUCCESS',
      data: {
        uuid: 'fdfdsfd',
        accountId: 'dummy',
        name: 'check1',
        value: {
          host: '192.168.0.102',
          port: 465,
          fromAddress: null,
          useSSL: true,
          startTLS: false,
          username: 'apikey',
          password: '*******'
        }
      },
      metaData: null,
      correlationId: 'dummy'
    },
    refetch: jest.fn()
  }))
}))

mockImport('framework/LicenseStore/LicenseStoreContext', {
  useLicenseStore: jest.fn().mockImplementation(() => ({
    licenseInformation: {
      CD: {
        edition: Editions.ENTERPRISE
      }
    },
    CI_LICENSE_STATE: LICENSE_STATE_VALUES.ACTIVE,
    STO_LICENSE_STATE: LICENSE_STATE_VALUES.ACTIVE,
    CD_LICENSE_STATE: LICENSE_STATE_VALUES.ACTIVE,
    CV_LICENSE_STATE: LICENSE_STATE_VALUES.ACTIVE
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

describe('Account Settings Page', () => {
  test('should render account settings page', async () => {
    jest.spyOn(Licenses, 'useAnyEnterpriseLicense').mockReturnValue(true)
    const { getAllByText, queryByText } = render(
      <TestWrapper
        path={testPath}
        pathParams={{ accountId: 'abcd', module: 'cd', orgIdentifier: 'efgh', projectIdentifier: 'ijkl' }}
        defaultFeatureFlagValues={{
          CDS_SERVICE_OVERRIDES_2_0: true,
          STO_JIRA_INTEGRATION: true,
          PIE_GIT_BI_DIRECTIONAL_SYNC: true,
          NG_LICENSES_ENABLED: true,
          CCM_CURRENCY_PREFERENCES: true,
          FFM_9497_PROXY_KEY_MANAGEMENT: true
        }}
      >
        <AccountSettingsPage />
      </TestWrapper>
    )

    expect(getAllByText('common.accountSettings')).toHaveLength(2)
    expect(getAllByText('common.settingCategory.general')).toHaveLength(2)
    expect(getAllByText('common.settingsPage.title.accountLevelResources')).toHaveLength(2)
    expect(getAllByText('GitOps')).toHaveLength(2)
    expect(getAllByText('accessControl')).toHaveLength(2)
    expect(getAllByText('common.settingsPage.title.securityGovernance')).toHaveLength(2)
    expect(getAllByText('common.subscriptions.title')).toHaveLength(3)
    expect(getAllByText('common.tickets.externalTickets')).toHaveLength(3)

    expect(queryByText('common.accountDetails')).toBeInTheDocument()
    expect(queryByText('common.defaultSettings')).toBeInTheDocument()
    expect(queryByText('common.ccmSettings.cloudCostIntegration')).toBeInTheDocument()
    expect(queryByText('common.ccmSettings.cloudCostCurrency')).toBeInTheDocument()
    expect(queryByText('services')).toBeInTheDocument()
    expect(queryByText('environments')).toBeInTheDocument()
    expect(queryByText('connectorsLabel')).toBeInTheDocument()
    expect(queryByText('delegate.delegates')).toBeInTheDocument()
    expect(queryByText('common.secrets')).toBeInTheDocument()
    expect(queryByText('resourcePage.fileStore')).toBeInTheDocument()
    expect(queryByText('common.templates')).toBeInTheDocument()
    expect(queryByText('common.webhooks')).toBeInTheDocument()
    expect(queryByText('common.variables')).toBeInTheDocument()
    expect(queryByText('common.ffProxy')).toBeInTheDocument()
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
    expect(queryByText('authentication')).toBeInTheDocument()
    expect(queryByText('common.governance')).toBeInTheDocument()
    expect(queryByText('common.freezeWindows')).toBeInTheDocument()
    expect(queryByText('common.auditTrail')).toBeInTheDocument()
    expect(queryByText('common.billing')).toBeInTheDocument()
    expect(queryByText('common.subscriptions.tabs.plans')).toBeInTheDocument()
  })
})
