/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { get } from 'lodash-es'
import { GitQueryParams, InfrastructureGitQueryParams } from '@modules/10-common/interfaces/RouteInterfaces'
import { EnvironmentResponseDTO, InfrastructureResponseDTO } from 'services/cd-ng'

export enum EnvironmentDetailsTab {
  CONFIGURATION = 'CONFIGURATION',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  SERVICE_OVERRIDES = 'SERVICE_OVERRIDES',
  GITOPS = 'GITOPS',
  SUMMARY = 'SUMMARY',
  REFERENCED_BY = 'REFERENCED_BY'
}

export const getRemoteEnvironmentQueryParams = (environment: EnvironmentResponseDTO): GitQueryParams => {
  if (environment?.storeType === 'REMOTE') {
    return {
      storeType: get(environment, 'storeType'),
      connectorRef: get(environment, 'connectorRef', ''),
      repoName: get(environment, 'entityGitDetails.repoName', '')
    }
  }
  return {}
}

export const getRemoteInfrastructureQueryParams = (
  infrastructure: InfrastructureResponseDTO
): InfrastructureGitQueryParams => {
  if (infrastructure?.storeType === 'REMOTE') {
    return {
      infraStoreType: get(infrastructure, 'storeType'),
      infraConnectorRef: get(infrastructure, 'connectorRef', ''),
      infraRepoName: get(infrastructure, 'entityGitDetails.repoName', '')
    }
  }
  return {}
}
