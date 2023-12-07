/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import routes from '@common/RouteDefinitionsV2'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import {
  NAV_MODE,
  accountPathProps,
  modulePathProps,
  orgPathProps,
  pathArrayForAllScopes,
  projectPathProps
} from '@common/utils/routeUtils'
import { AccountSettingsPage } from '@common/pages/SettingsPages/AccountSettingsPage'
import { LICENSE_STATE_NAMES, LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import { RedirectToModuleTrialHomeFactory } from '@common/Redirects'
import { ModuleName } from 'framework/types/ModuleName'
import { RedirectToSubscriptions } from '@cf/components/routing/License'
import ExternalTicketSettings from '@sto/components/ExternalTickets/Settings/ExternalTicketSettings'
import { OrgSettingsPage } from '@projects-orgs/components/SettingsPageComponent/OrgSettingsPage'
import { ProjectSettingsPage } from '@projects-orgs/components/SettingsPageComponent/ProjectSettingsPage'
import CDSettingsRouteDestinations from '@modules/75-cd/SettingsRouteDestinations'
import CertificatesSettingsRouteDestinations from '@platform/certificates/SettingsRouteDestinations'
import ConnectorsSettingsRouteDestinations from '@platform/connectors/SettingsRouteDestinations'
import TemplateSettingsRouteDestinations from '@modules/72-templates-library/SettingsRouteDestinations'
import AuthSettingsRouteDestinations from '@modules/27-platform/auth-settings/SettingsRouteDestinations'
import FreezeWindowSettingsRouteDestinations from '@freeze-windows/SettingsRouteDestinations'
import GovernanceSettingsRouteDestinations from '@governance/SettingsRouteDestinations'
import AuditTrailsSettingsRouteDestinations from '@audit-trail/SettingsRouteDestinations'
import DiscoverySettingsRouteDestinations from '@discovery/SettingsRouteDestinations'
import CVSettingsRouteDestinations from '@cv/SettingsRouteDestinations'
import DelegateSettingsRouteDestinations from '@platform/delegates/SettingsRouteDestinations'
import NotificationsManagementSettingsRouteDestinations from '@modules/27-platform/notifications/SettingsRouteDestinations'
import SecretSettingsRouteDestinations from '@platform/secrets/SettingsRouteDestinations'
import RbacSettingsRouteDestinations from '@rbac/SettingsRouteDestinations'
import GitSyncSettingsRouteDestinations from '@gitsync/SettingsRouteDestinations'
import DefaultSettingsRouteDestinations from '@platform/default-settings/SettingsRouteDestinations'
import UserProfileSettingsRouteDestinations from '@user-profile/SettingsRouteDestinations'
import GitOpsSettingsRouteDestinations from '@gitops/SettingsRouteDestinations'
import FileStoreSettingsRouteDestinations from '@platform/filestore/SettingsRouteDestinations'
import VariableSettingsRouteDestinations from '@platform/variables/SettingsRouteDestinations'
import { CESettingsRouteDestination } from '@ce/RouteDestinationsV2'
import CFSettingsRouteDestinations from '@modules/75-cf/SettingsRouteDestinations'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import CETSettingsRouteDestinations from '@cet/CETSettingsRouteDestinations'

const licenseRedirectDataCD: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.CD_LICENSE_STATE,
  startTrialRedirect: RedirectToModuleTrialHomeFactory(ModuleName.CD),
  expiredTrialRedirect: RedirectToSubscriptions
}

function SettingsRouteDestinations({ mode }: { mode: NAV_MODE }): React.ReactElement {
  const { PL_CENTRAL_NOTIFICATIONS, PL_CENTRAL_CERTIFICATES_MANAGEMENT } = useFeatureFlags()
  return (
    <>
      {/* Settings Pages */}
      <RouteWithContext
        exact
        path={[
          routes.toSettings({ ...accountPathProps, ...modulePathProps, mode }),
          routes.toSettings({ ...accountPathProps, mode })
        ]}
      >
        <AccountSettingsPage />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={[
          routes.toSettings({ ...orgPathProps, ...modulePathProps, mode }),
          routes.toSettings({ ...orgPathProps, mode })
        ]}
      >
        <OrgSettingsPage />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={[
          routes.toSettings({ ...projectPathProps, ...modulePathProps, mode }),
          routes.toSettings({ ...projectPathProps, mode })
        ]}
      >
        <ProjectSettingsPage />
      </RouteWithContext>

      {/* Settings Resources */}
      {CDSettingsRouteDestinations({ mode, licenseRedirectData: licenseRedirectDataCD }).props.children}

      {DelegateSettingsRouteDestinations({ mode }).props.children}

      {PL_CENTRAL_CERTIFICATES_MANAGEMENT && CertificatesSettingsRouteDestinations({ mode }).props.children}

      {ConnectorsSettingsRouteDestinations({ mode }).props.children}

      {UserProfileSettingsRouteDestinations({ mode }).props.children}

      {TemplateSettingsRouteDestinations({ mode }).props.children}

      {AuthSettingsRouteDestinations({ mode }).props.children}

      {FreezeWindowSettingsRouteDestinations({ mode }).props.children}

      {GovernanceSettingsRouteDestinations({ mode }).props.children}

      {SecretSettingsRouteDestinations({ mode }).props.children}

      {AuditTrailsSettingsRouteDestinations({ mode }).props.children}

      {FileStoreSettingsRouteDestinations({ mode }).props.children}

      {RbacSettingsRouteDestinations({ mode }).props.children}

      {DefaultSettingsRouteDestinations({ mode }).props.children}

      {VariableSettingsRouteDestinations({ mode }).props.children}

      {GitOpsSettingsRouteDestinations({ mode }).props.children}

      {GitSyncSettingsRouteDestinations({ mode }).props.children}

      {DiscoverySettingsRouteDestinations({ mode }).props.children}

      {CVSettingsRouteDestinations({ mode }).props.children}

      {CFSettingsRouteDestinations({ mode }).props.children}

      {CETSettingsRouteDestinations({ mode }).props.children}

      {PL_CENTRAL_NOTIFICATIONS && NotificationsManagementSettingsRouteDestinations({ mode }).props.children}

      {/* CCM Setting pages */}
      {
        CESettingsRouteDestination({
          path: [
            ...pathArrayForAllScopes(routes.toCECloudIntegration, mode),
            ...pathArrayForAllScopes(routes.toCECurrencyPreferences, mode)
          ]
        }).props.children
      }

      <RouteWithContext exact path={pathArrayForAllScopes(routes.toTicketSettings, mode)}>
        <ExternalTicketSettings />
      </RouteWithContext>
    </>
  )
}

export default SettingsRouteDestinations
