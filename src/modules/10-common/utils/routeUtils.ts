/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { matchPath } from 'react-router-dom'

import { defaultTo } from 'lodash-es'
import type {
  AccountPathProps,
  OrgPathProps,
  ProjectPathProps,
  PipelinePathProps,
  TriggerPathProps,
  ExecutionPathProps,
  ConnectorPathProps,
  SecretsPathProps,
  PipelineType,
  FeatureFlagPathProps,
  SegmentPathProps,
  CVDataSourceTypePathProps,
  BuildPathProps,
  EnvironmentPathProps,
  DelegatePathProps,
  DelegateConfigProps,
  InputSetPathProps,
  VerificationPathProps,
  TargetPathProps,
  ModulePathParams,
  RolePathProps,
  ResourceGroupPathProps,
  UserGroupPathProps,
  UserPathProps,
  ServiceAccountPathProps,
  ServicePathProps,
  TemplateStudioPathProps,
  EnvironmentGroupPathProps,
  VariablesPathProps,
  AccountRoutePlacement,
  DiscoveryPathProps,
  Module,
  NetworkMapPathProps,
  WebhooksPathProps,
  DashboardFolderPathProps,
  DashboardEmbedPathProps
} from '@common/interfaces/RouteInterfaces'
import { getLocationPathName } from 'framework/utils/WindowLocation'

export const accountPathProps: AccountPathProps = {
  accountId: ':accountId'
}

export const modePathProps: ModePathProps = {
  mode: ':mode'
}

export const orgPathProps: OrgPathProps = {
  ...accountPathProps,
  orgIdentifier: ':orgIdentifier'
}

export const projectPathProps: ProjectPathProps = {
  ...orgPathProps,
  projectIdentifier: ':projectIdentifier'
}

export const pipelinePathProps: PipelinePathProps = {
  ...projectPathProps,
  pipelineIdentifier: ':pipelineIdentifier'
}

export const templatePathProps: TemplateStudioPathProps = {
  ...projectPathProps,
  templateIdentifier: ':templateIdentifier',
  templateType: ':templateType'
}

export const inputSetFormPathProps: InputSetPathProps = {
  ...pipelinePathProps,
  inputSetIdentifier: ':inputSetIdentifier'
}

export const triggerPathProps: TriggerPathProps = {
  ...pipelinePathProps,
  triggerIdentifier: ':triggerIdentifier'
}

export const executionPathProps: ExecutionPathProps = {
  ...pipelinePathProps,
  executionIdentifier: ':executionIdentifier',
  source: ':source(deployments|executions|builds)'
}

export const connectorPathProps: ConnectorPathProps = {
  connectorId: ':connectorId'
}
export const verificationPathProps: VerificationPathProps = {
  verificationId: ':verificationId'
}

export const secretPathProps: SecretsPathProps = {
  secretId: ':secretId'
}
export const variablePathProps: VariablesPathProps = {
  variableId: ':variableId'
}

export const discoveryPathProps: DiscoveryPathProps = {
  ...projectPathProps,
  dAgentId: ':dAgentId'
}

export const networkMapPathProps: NetworkMapPathProps = {
  ...projectPathProps,
  dAgentId: ':dAgentId',
  networkMapId: ':networkMapId'
}

export const rolePathProps: RolePathProps = {
  roleIdentifier: ':roleIdentifier'
}

export const userGroupPathProps: UserGroupPathProps = {
  userGroupIdentifier: ':userGroupIdentifier'
}

export const userPathProps: UserPathProps = {
  userIdentifier: ':userIdentifier'
}

export const serviceAccountProps: ServiceAccountPathProps = {
  serviceAccountIdentifier: ':serviceAccountIdentifier'
}

export const resourceGroupPathProps: ResourceGroupPathProps = {
  resourceGroupIdentifier: ':resourceGroupIdentifier'
}

export const dashboardFolderPathProps: DashboardFolderPathProps = {
  ...accountPathProps,
  folderId: ':folderId'
}

export const dashboardEmbedPathProps: DashboardEmbedPathProps = {
  ...dashboardFolderPathProps,
  viewId: ':viewId'
}

export const delegatePathProps: DelegatePathProps = {
  delegateIdentifier: ':delegateIdentifier'
}

export const delegateConfigProps: DelegateConfigProps = {
  delegateConfigIdentifier: ':delegateConfigIdentifier'
}

export const modulePathProps: ModulePathParams = {
  module: ':module'
}

export const pipelineModuleParams: Record<keyof PipelineType<unknown>, 'ci' | 'cd' | 'cf' | ':module'> = {
  module: ':module'
}

export const featureFlagPathProps: FeatureFlagPathProps = {
  featureFlagIdentifier: ':featureFlagIdentifier'
}

export const cvDataSourceTypePathProps: CVDataSourceTypePathProps = {
  dataSourceType: ':dataSourceType'
}

export const buildPathProps: BuildPathProps = {
  ...projectPathProps,
  buildIdentifier: ':buildIdentifier'
}

export const environmentPathProps: EnvironmentPathProps = {
  environmentIdentifier: ':environmentIdentifier'
}
export const webhooksPathProps: WebhooksPathProps = {
  webhookIdentifier: ':webhookIdentifier'
}

export const environmentGroupPathProps: EnvironmentGroupPathProps = {
  environmentGroupIdentifier: ':environmentGroupIdentifier'
}

export const segmentPathProps: SegmentPathProps = {
  segmentIdentifier: ':segmentIdentifier'
}

export const targetPathProps: TargetPathProps = {
  targetIdentifier: ':targetIdentifier'
}

export const servicePathProps: ServicePathProps = {
  serviceId: ':serviceId'
}

export function withAccountId<T>(fn: (args: T) => string) {
  return (params: T & { accountId: string }): string => {
    const path = fn(params)

    return `/account/${params.accountId}/${path.replace(/^\//, '')}`
  }
}

export function withOrgIdentifier<T>(fn: (args: T) => string) {
  return (params: T & { orgIdentifier: string }): string => {
    const path = fn(params)

    return `/orgs/${params.orgIdentifier}/${path.replace(/^\//, '')}`
  }
}

export function withProjectIdentifier<T>(fn: (args: T) => string) {
  return (params: T & { projectIdentifier: string }): string => {
    const path = fn(params)

    return `/projects/${params.projectIdentifier}/${path.replace(/^\//, '')}`
  }
}

export function withMode<T>(fn: (args: T) => string) {
  return (params: T & { mode: string }): string => {
    const path = fn(params)

    return `/${params.mode}/${path.replace(/^\//, '')}`
  }
}

export function withModule<T>(fn: (args: T) => string) {
  return (params: T & { module: string }): string => {
    const path = fn(params)

    return `/${params.module}/${path.replace(/^\//, '')}`
  }
}

/**Most routes at project level follow this pattern */
export function withProjectLevelRoute<T>(fn: (args: T) => string) {
  return (
    params: T & { accountId: string; projectIdentifier: string; orgIdentifier: string; module: Module }
  ): string => {
    const path = fn(params)

    const { accountId, orgIdentifier, projectIdentifier, module = 'home' } = params

    return `/account/${accountId}/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/${path.replace(
      /^\//,
      ''
    )}`
  }
}

/** Used for settings resources at Account, Org and Project levels */
export const getScopeBasedRoute = ({
  scope: { orgIdentifier, projectIdentifier, module },
  path
}: {
  scope: Partial<ProjectPathProps & ModulePathParams>
  path: string
}): string => {
  if (module && orgIdentifier && projectIdentifier) {
    return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/${path}`
  } else if (orgIdentifier && projectIdentifier) {
    return `/home/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/${path}`
  } else if (orgIdentifier) {
    return `/settings/organizations/${orgIdentifier}/setup/${path}`
  }
  return `/settings/${path}`
}

export const returnUrlParams = (url: string): string => `?returnUrl=${encodeURIComponent(url)}`

export const validateReturnUrl = (url: string): boolean => {
  const decodedUrl = decodeURIComponent(url)

  if (decodedUrl.startsWith('/')) {
    return true
  }

  try {
    const validUrl = new URL(decodedUrl)
    return window.location.hostname === validUrl.hostname
  } catch (_e) {
    return false
  }
}

export const returnLaunchUrl = (url: string): string => {
  return `${getLocationPathName().replace(/\/ng\/?/, '/')}${url}`
}

export const getEnvServiceRoute = ({
  scope: { orgIdentifier, projectIdentifier, module },
  path,
  accountRoutePlacement
}: {
  scope: Partial<ProjectPathProps & ModulePathParams>
  path: string
  accountRoutePlacement?: AccountRoutePlacement
}): string => {
  if (orgIdentifier && projectIdentifier) {
    const basePath = module || 'home'
    return `/${basePath}/orgs/${orgIdentifier}/projects/${projectIdentifier}/${path}`
  } else if (orgIdentifier) {
    return `/settings/organizations/${orgIdentifier}/setup/resources/${path}`
  } else if (accountRoutePlacement) {
    return accountRoutePlacement === 'settings' ? `settings/resources/${path}` : `${path}`
  } else {
    return window.location.href.includes('settings') ? `settings/resources/${path}` : `${path}`
  }
}

export const NEW_ROUTE_PATHS = [
  '/account/:accountId/:mode/:module/orgs/:orgIdentifier/projects/:projectIdentifier',
  '/account/:accountId/:mode/:module/orgs/:orgIdentifier',
  '/account/:accountId/:mode/orgs/:orgIdentifier/projects/:projectIdentifier',
  '/account/:accountId/:mode/orgs/:orgIdentifier',
  '/account/:accountId/:mode/:module(cd|ci|cv|cf|ce|code|sto|chaos|iacm|ssca|idp|cet|sei|idp-admin)',
  '/account/:accountId/:mode'
]

export const getRouteParams = <T>(includePath?: boolean, url?: string): T => {
  const { params = {} } =
    matchPath(url || location.pathname, {
      path: NEW_ROUTE_PATHS.map(path => `${url ? '' : '/ng'}${path}${includePath ? '/:path*' : ''}`)
    }) || {}

  return params as T
}

export const MODE_PATH = [
  `${
    window.harnessNameSpace || ''
  }/ng/account/:accountId/:mode/:module(cd|ci|cv|cf|ce|code|sto|chaos|iacm|ssca|idp||idp-admin|cet|sei)`,
  `${window.harnessNameSpace || ''}/ng/account/:accountId/:mode`
]

export const MODULE_PATH = [
  `${
    window.harnessNameSpace || ''
  }/ng/account/:accountId/:mode/:module(cd|ci|cv|cf|ce|code|sto|chaos|iacm|ssca|idp|cet|sei)`,
  `${window.harnessNameSpace || ''}/ng/account/:accountId/:module(cd|ci|cv|cf|ce|code|sto|chaos|iacm|ssca|idp|cet|sei)`
]

export enum NAV_MODE {
  ADMIN = 'admin',
  ALL = 'all',
  MODULE = 'module',
  DASHBOARDS = 'dashboards'
}

export interface ModePathProps {
  mode: string
}

export function isNavMode(str: string): boolean {
  return Object.values(NAV_MODE).includes(str as NAV_MODE)
}

export function pathArrayForAllScopes(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  routeToMatch: (params?: any) => string,
  mode: NAV_MODE,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalPathProps?: any
): string[] {
  const additionalProps = defaultTo(additionalPathProps, {})
  const propLists = [
    { ...projectPathProps, ...modulePathProps, mode, ...additionalProps },
    { ...projectPathProps, mode, ...additionalProps },
    { ...orgPathProps, ...modulePathProps, mode, ...additionalProps },
    { ...orgPathProps, mode, ...additionalProps },
    { ...accountPathProps, ...modulePathProps, mode, ...additionalProps },
    { ...accountPathProps, mode, ...additionalProps }
  ]
  return propLists.map(props => routeToMatch(props))
}
