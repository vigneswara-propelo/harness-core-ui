/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { omit } from 'lodash-es'
import { ModulePathParams, ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import { NAV_MODE } from '@modules/10-common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import routesV2 from '@common/RouteDefinitionsV2'
import { ServiceResponseDTO } from 'services/cd-ng'
import { getScopedServiceUrl } from '../scopedUrlUtils'

describe('Test scopedUrlUtils', () => {
  const commonParams: ProjectPathProps & ModulePathParams = {
    accountId: 'test_account',
    orgIdentifier: 'test_org',
    projectIdentifier: 'test_project',
    module: 'cd'
  }
  test('Test scopedUrlUtils', () => {
    // Project Scope
    expect(
      getScopedServiceUrl(
        {
          ...commonParams,
          scopedServiceIdentifier: 'test_service',
          serviceMetadata: {}
        },
        false
      )
    ).toBe(
      routes.toServiceStudio({
        ...commonParams,
        serviceId: 'test_service'
      })
    )
    // Project Scope with accountRoutePlacement & queryParams
    expect(
      getScopedServiceUrl(
        {
          ...commonParams,
          scopedServiceIdentifier: 'test_service',
          accountRoutePlacement: 'dashboard',
          serviceMetadata: {
            storeType: 'REMOTE',
            connectorRef: 'test_connector',
            entityGitDetails: {
              repoName: 'test_repo'
            }
          } as ServiceResponseDTO
        },
        false
      )
    ).toBe(
      `${routes.toServiceStudio({
        ...commonParams,
        serviceId: 'test_service',
        accountRoutePlacement: 'dashboard'
      })}?storeType=REMOTE&connectorRef=test_connector&repoName=test_repo`
    )
    // Org Scope
    expect(
      getScopedServiceUrl(
        {
          ...commonParams,
          scopedServiceIdentifier: 'org.test_service',
          serviceMetadata: {}
        },
        false
      )
    ).toBe(
      routes.toServiceStudio({
        ...omit(commonParams, ['projectIdentifier']),
        serviceId: 'test_service'
      })
    )
    // Account Scope
    expect(
      getScopedServiceUrl(
        {
          ...commonParams,
          scopedServiceIdentifier: 'account.test_service',
          serviceMetadata: {}
        },
        false
      )
    ).toBe(
      routes.toServiceStudio({
        ...omit(commonParams, ['orgIdentifier', 'projectIdentifier']),
        serviceId: 'test_service'
      })
    )
  })
  test('Test scopedUrlUtils for CDS_NAV_2_0', () => {
    // Project Scope
    expect(
      getScopedServiceUrl(
        {
          ...commonParams,
          scopedServiceIdentifier: 'test_service',
          serviceMetadata: {}
        },
        true
      )
    ).toBe(
      routesV2.toSettingsServiceDetails({
        ...commonParams,
        serviceId: 'test_service',
        mode: NAV_MODE.MODULE
      })
    )
    // Org Scope
    expect(
      getScopedServiceUrl(
        {
          ...commonParams,
          scopedServiceIdentifier: 'org.test_service',
          serviceMetadata: {}
        },
        true
      )
    ).toBe(
      routesV2.toSettingsServiceDetails({
        ...omit(commonParams, ['projectIdentifier']),
        serviceId: 'test_service',
        mode: NAV_MODE.MODULE
      })
    )
    // Account Scope
    expect(
      getScopedServiceUrl(
        {
          ...commonParams,
          scopedServiceIdentifier: 'account.test_service',
          serviceMetadata: {}
        },
        true
      )
    ).toBe(
      routesV2.toSettingsServiceDetails({
        ...omit(commonParams, ['orgIdentifier', 'projectIdentifier']),
        serviceId: 'test_service',
        mode: NAV_MODE.MODULE
      })
    )
  })
})
