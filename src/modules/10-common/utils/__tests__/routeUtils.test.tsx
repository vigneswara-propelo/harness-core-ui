/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ModulePathParams, ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import {
  validateReturnUrl,
  returnLaunchUrl,
  withOrgIdentifier,
  withProjectIdentifier,
  withAccountId,
  getScopeBasedRoute,
  returnUrlParams,
  NAV_MODE,
  withMode,
  withModule,
  getRouteParams,
  ModePathProps,
  isNavMode
} from '../routeUtils'

describe('validateReturnUrl', () => {
  test('different hostname url', () => {
    expect(validateReturnUrl('https://www.youtube.com/')).toBeFalsy()
    expect(validateReturnUrl(encodeURIComponent('https://www.youtube.com/'))).toBeFalsy()
  })
  test('invalid url', () => {
    expect(validateReturnUrl('testing')).toBeFalsy()
  })
  test('valid url', () => {
    expect(validateReturnUrl('/testing')).toBeTruthy()
    expect(validateReturnUrl(encodeURIComponent('/testing'))).toBeTruthy()
  })
  test('same hostname  url', () => {
    expect(validateReturnUrl('https://localhost:8181/#/login')).toBeTruthy()
    expect(validateReturnUrl(encodeURIComponent('https://localhost:8181/#/login'))).toBeTruthy()
  })
})

describe('route utils', () => {
  test('Launch redirection url', async () => {
    const redirectionUrl = '#/account/abc123/dashboard'
    const path = returnLaunchUrl(redirectionUrl)
    expect(path).toEqual(`${window.location.pathname}${redirectionUrl}`)
  })
  test('getRouteParams', () => {
    const { accountId, projectIdentifier, orgIdentifier, mode, module } = getRouteParams<
      ProjectPathProps & ModulePathParams & ModePathProps
    >(true, '/account/abcd/module/cd/orgs/default/projects/gef/')

    expect(accountId).toEqual('abcd')
    expect(projectIdentifier).toEqual('gef')
    expect(orgIdentifier).toEqual('default')
    expect(mode).toEqual('module')
    expect(module).toEqual('cd')
  })
  test('with account identifier', () => {
    const withAccountURL = withAccountId(() => '/dummy')
    expect(withAccountURL({ accountId: 'accountId' })).toEqual('/account/accountId/dummy')
  })
  test('with org identifier', () => {
    const withOrgURL = withOrgIdentifier(() => '/dummy')
    expect(withOrgURL({ orgIdentifier: 'orgId' })).toEqual('/orgs/orgId/dummy')
  })
  test('with project identifier', () => {
    const withProjectURL = withProjectIdentifier(() => '/dummy')
    expect(withProjectURL({ projectIdentifier: 'projectId' })).toEqual('/projects/projectId/dummy')
  })
  test('with mode', () => {
    const withModeURL = withMode(() => '/dummy')
    expect(withModeURL({ mode: NAV_MODE.ALL })).toEqual('/all/dummy')
  })
  test('with module', () => {
    const withModuleURL = withModule(() => '/dummy')
    expect(withModuleURL({ module: 'cd' })).toEqual('/cd/dummy')
  })
  test('isNavMode', () => {
    expect(isNavMode('admin')).toBeTruthy()
    expect(isNavMode('module')).toBeTruthy()
    expect(isNavMode('all')).toBeTruthy()
    expect(isNavMode('dashboards')).toBeTruthy()
    expect(isNavMode('cd')).toBeFalsy()
  })
  test('getScopeBasedRoute', () => {
    expect(getScopeBasedRoute({ scope: {}, path: 'dummy' })).toEqual('/settings/dummy')
    expect(getScopeBasedRoute({ scope: { orgIdentifier: 'org' }, path: 'dummy' })).toEqual(
      '/settings/organizations/org/setup/dummy'
    )
    expect(
      getScopeBasedRoute({ scope: { orgIdentifier: 'org', projectIdentifier: 'project' }, path: 'dummy' })
    ).toEqual('/home/orgs/org/projects/project/setup/dummy')
    expect(
      getScopeBasedRoute({ scope: { orgIdentifier: 'org', projectIdentifier: 'project', module: 'cd' }, path: 'dummy' })
    ).toEqual('/cd/orgs/org/projects/project/setup/dummy')
  })
  test('returnUrlParams', () => {
    expect(returnUrlParams('/dummy?a=b')).toEqual('?returnUrl=%2Fdummy%3Fa%3Db')
  })
})
