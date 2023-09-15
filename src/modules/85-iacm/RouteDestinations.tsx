/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Route } from 'react-router-dom'
import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import { IACMSideNavProps, RedirectToIACMProject } from '@iacm/utils/IACMChildAppUtils'
import { PipelineRouteDestinations } from '@pipeline/RouteDestinations'
import PipelineStudio from '@pipeline/components/PipelineStudio/PipelineStudio'
import { PipelineDeploymentList } from '@pipeline/pages/pipeline-deployment-list/PipelineDeploymentList'
import '@iacm/components/IACMStage'
import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ConnectorRouteDestinations } from '@platform/connectors/RouteDestinations'
import { SecretRouteDestinations } from '@secrets/RouteDestinations'
import { VariableRouteDestinations } from '@variables/RouteDestinations'
import { AccessControlRouteDestinations } from '@rbac/RouteDestinations'
import { DelegateRouteDestinations } from '@delegates/RouteDestinations'
import { DefaultSettingsRouteDestinations } from '@default-settings/RouteDestinations'
import { GovernanceRouteDestinations } from '@governance/RouteDestinations'
import PipelineStudioV1 from '@pipeline/v1/components/PipelineStudioV1/PipelineStudioV1'
import { TriggersRouteDestinations } from '@triggers/RouteDestinations'
import AuditTrailFactory, { ResourceScope } from 'framework/AuditTrail/AuditTrailFactory'
import type { ResourceDTO } from 'services/audit'
import { IACMApp } from './components/IACMApp'

const moduleParams: ModulePathParams = {
  module: ':module(iacm)'
}

function IACMRoutes(): JSX.Element {
  const { IACM_OPA_WORKSPACE_GOVERNANCE } = useFeatureFlags()

  return (
    <>
      <RouteWithLayout sidebarProps={IACMSideNavProps} path={routes.toIACM({ ...accountPathProps })} exact>
        <RedirectToIACMProject />
      </RouteWithLayout>
      <Route
        sidebarProps={IACMSideNavProps}
        path={routes.toIACMSetup({ ...projectPathProps, ...accountPathProps, ...orgPathProps })}
      >
        <AccessControlRouteDestinations moduleParams={moduleParams} sidebarProps={IACMSideNavProps} />
        <ConnectorRouteDestinations moduleParams={moduleParams} sidebarProps={IACMSideNavProps} />
        <SecretRouteDestinations moduleParams={moduleParams} sidebarProps={IACMSideNavProps} />
        <VariableRouteDestinations moduleParams={moduleParams} sidebarProps={IACMSideNavProps} />
        <DelegateRouteDestinations moduleParams={moduleParams} sidebarProps={IACMSideNavProps} />
        <DefaultSettingsRouteDestinations moduleParams={moduleParams} sidebarProps={IACMSideNavProps} />
        {IACM_OPA_WORKSPACE_GOVERNANCE && (
          <GovernanceRouteDestinations
            sidebarProps={IACMSideNavProps}
            pathProps={{ ...accountPathProps, ...projectPathProps, ...moduleParams }}
          />
        )}
      </Route>
      <Route
        sidebarProps={IACMSideNavProps}
        path={routes.toIACMPipelines({ ...projectPathProps, ...accountPathProps, ...orgPathProps })}
      >
        <PipelineRouteDestinations
          pipelineStudioComponent={PipelineStudio}
          pipelineDeploymentListComponent={PipelineDeploymentList}
          moduleParams={moduleParams}
          sidebarProps={IACMSideNavProps}
          pipelineStudioComponentV1={PipelineStudioV1}
        />
        <TriggersRouteDestinations moduleParams={moduleParams} sidebarProps={IACMSideNavProps} />
      </Route>
      <RouteWithLayout
        sidebarProps={IACMSideNavProps}
        path={[
          routes.toIACMOverview({ ...accountPathProps }),
          routes.toIACMMicroFrontend({ ...projectPathProps, ...accountPathProps, ...orgPathProps })
        ]}
      >
        <IACMApp />
      </RouteWithLayout>
    </>
  )
}

export default IACMRoutes

AuditTrailFactory.registerResourceHandler('WORKSPACE', {
  moduleIcon: {
    name: 'iacm'
  },
  moduleLabel: 'common.iacm',
  resourceLabel: 'pipelineSteps.workspace',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { orgIdentifier, accountIdentifier, projectIdentifier } = resourceScope
    return routes.toIACMWorkspace({
      orgIdentifier,
      accountId: accountIdentifier,
      projectIdentifier,
      workspaceIdentifier: resource.identifier
    })
  }
})
