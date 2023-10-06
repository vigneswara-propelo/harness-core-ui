/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitionsV2'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { NAV_MODE, pathArrayForAllScopes } from '@common/utils/routeUtils'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { GovernancePathProps } from '@common/interfaces/RouteInterfaces'
import PolicyManagementMFE from './GovernanceApp'

const RedirectToDefaultGovernanceRoute = (): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<GovernancePathProps>()
  return (
    <Redirect
      to={routes.toGovernancePolicyDashboardSettings({
        accountId,
        projectIdentifier,
        orgIdentifier,
        module
      })}
    />
  )
}

function GovernanceSettingsRouteDestinations({ mode }: { mode: NAV_MODE }): React.ReactElement {
  return (
    <>
      <RouteWithContext
        exact
        path={pathArrayForAllScopes(routes.toGovernanceSettings, mode)}
        pageName={PAGE_NAME.OPAPolicyDashboard}
      >
        <RedirectToDefaultGovernanceRoute />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={[
          ...pathArrayForAllScopes(routes.toGovernancePolicyDashboardSettings, mode),
          ...pathArrayForAllScopes(routes.toGovernanceNewPolicySettings, mode),
          ...pathArrayForAllScopes(routes.toGovernancePolicyListingSettings, mode),
          ...pathArrayForAllScopes(routes.toGovernanceEditPolicy, mode, {
            policyIdentifier: ':policyIdentifier'
          }),
          ...pathArrayForAllScopes(routes.toGovernanceViewPolicySettings, mode, {
            policyIdentifier: ':policyIdentifier'
          }),
          ...pathArrayForAllScopes(routes.toGovernancePolicySetsListingSettings, mode),
          ...pathArrayForAllScopes(routes.toGovernancePolicySetDetail, mode, {
            policySetIdentifier: ':policySetIdentifier'
          }),
          ...pathArrayForAllScopes(routes.toGovernanceEvaluationsListing, mode),
          ...pathArrayForAllScopes(routes.toGovernanceOnboarding, mode),
          ...pathArrayForAllScopes(routes.toGovernanceEvaluationDetail, mode, {
            evaluationId: ':evaluationId'
          })
        ]}
        pageName={PAGE_NAME.OPAPolicyDashboard}
      >
        <PolicyManagementMFE />
      </RouteWithContext>
    </>
  )
}

export default GovernanceSettingsRouteDestinations
