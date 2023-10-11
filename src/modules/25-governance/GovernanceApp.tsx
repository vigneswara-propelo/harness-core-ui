/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { lazy, FC } from 'react'
import { useRouteMatch } from 'react-router-dom'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import routes from '@common/RouteDefinitions'
import type { GovernanceCustomMicroFrontendProps } from './GovernanceCustomMicroFrontendProps.types'
import { customComponents, customHooks, RouteMatch } from './GovernanceCustomMicroFrontendProps'

// eslint-disable-next-line import/no-unresolved
const RemoteGovernanceApp = lazy(() => import('governance/App'))
// eslint-disable-next-line import/no-unresolved
const RemotePipelineGovernanceView = lazy(() => import('governance/PipelineGovernanceView'))
// eslint-disable-next-line import/no-unresolved
const RemotePolicySetWizard = lazy(() => import('governance/PolicySetWizard'))
// eslint-disable-next-line import/no-unresolved
const RemotePolicyResourceBody = lazy(() => import('governance/PolicyResourceModalBody'))
// eslint-disable-next-line import/no-unresolved
const RemotePolicyResourceRenderer = lazy(() => import('governance/PolicyResourceRenderer'))
// eslint-disable-next-line import/no-unresolved
const RemotePolicySetResourceBody = lazy(() => import('governance/PolicySetsResourceModalBody'))
// eslint-disable-next-line import/no-unresolved
const RemotePolicySetResourceRenderer = lazy(() => import('governance/PolicySetResourceRenderer'))
/*
 * Would like to change these baseRoutePath and accountId props to use the default
 * renderUrl.
 */
const PolicyManagementMFE: FC = props => {
  const { path }: RouteMatch = useRouteMatch()
  return (
    <ChildAppMounter<GovernanceCustomMicroFrontendProps>
      ChildApp={RemoteGovernanceApp}
      customHooks={customHooks}
      customComponents={customComponents}
      customRoutes={routes}
      baseRoutePath={path}
      {...props}
    />
  )
}

export const PolicyManagementPipelineView: FC<any> = (props: any) => {
  const { path }: RouteMatch = useRouteMatch()
  return (
    <ChildAppMounter<GovernanceCustomMicroFrontendProps>
      ChildApp={RemoteGovernanceApp}
      customHooks={customHooks}
      customComponents={customComponents}
      customRoutes={routes}
      baseRoutePath={path}
    >
      <RemotePipelineGovernanceView {...props} />
    </ChildAppMounter>
  )
}

export const PolicyManagementPolicySetWizard: FC<any> = (props: any) => {
  const { path }: RouteMatch = useRouteMatch()
  return (
    <ChildAppMounter<GovernanceCustomMicroFrontendProps>
      ChildApp={RemoteGovernanceApp}
      customHooks={customHooks}
      customComponents={customComponents}
      customRoutes={routes}
      baseRoutePath={path}
    >
      <RemotePolicySetWizard {...props} />
    </ChildAppMounter>
  )
}

export const PolicyManagementResourceBody: FC<any> = (props: any) => {
  const { path }: RouteMatch = useRouteMatch()

  return (
    <ChildAppMounter<GovernanceCustomMicroFrontendProps>
      ChildApp={RemoteGovernanceApp}
      customHooks={customHooks}
      customComponents={customComponents}
      customRoutes={routes}
      baseRoutePath={path}
      {...props}
    >
      <RemotePolicyResourceBody {...props} />
    </ChildAppMounter>
  )
}

export const PolicyResourceRenderer: FC<any> = (props: any) => {
  const { path }: RouteMatch = useRouteMatch()
  return (
    <ChildAppMounter<GovernanceCustomMicroFrontendProps>
      ChildApp={RemoteGovernanceApp}
      customHooks={customHooks}
      customComponents={customComponents}
      customRoutes={routes}
      baseRoutePath={path}
      {...props}
    >
      <RemotePolicyResourceRenderer {...props} />
    </ChildAppMounter>
  )
}

export const PolicySetResourceBody: FC<any> = (props: any) => {
  const { path }: RouteMatch = useRouteMatch()
  return (
    <ChildAppMounter<GovernanceCustomMicroFrontendProps>
      ChildApp={RemoteGovernanceApp}
      customHooks={customHooks}
      customComponents={customComponents}
      customRoutes={routes}
      baseRoutePath={path}
      {...props}
    >
      <RemotePolicySetResourceBody {...props} />
    </ChildAppMounter>
  )
}

export const PolicySetResourceRenderer: FC<any> = (props: any) => {
  const { path }: RouteMatch = useRouteMatch()
  return (
    <ChildAppMounter<GovernanceCustomMicroFrontendProps>
      ChildApp={RemoteGovernanceApp}
      customHooks={customHooks}
      customComponents={customComponents}
      customRoutes={routes}
      baseRoutePath={path}
      {...props}
    >
      <RemotePolicySetResourceRenderer {...props} />
    </ChildAppMounter>
  )
}

export default PolicyManagementMFE
