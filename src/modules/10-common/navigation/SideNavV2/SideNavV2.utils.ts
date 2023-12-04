/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { IconName } from '@harness/icons'
import { useQueryParams } from '@common/hooks'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getRouteParams } from '@common/utils/routeUtils'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { Scope } from 'framework/types/types'

interface useGetSelectedScopeReturnType {
  scope?: Scope
  params?: { projectIdentifier?: string; orgIdentifier?: string; accountId: string }
}

export const useGetSelectedScope = (): useGetSelectedScopeReturnType => {
  const { selectedProject } = useAppStore()
  const { noscope } = useQueryParams<{ noscope?: boolean }>()
  const {
    orgIdentifier: orgFromParam,
    projectIdentifier: projectFromParam,
    accountId
  } = getRouteParams<ProjectPathProps>()

  if (!projectFromParam && !orgFromParam && !noscope) {
    return {
      scope: Scope.ACCOUNT,
      params: {
        accountId
      }
    }
  }

  if (projectFromParam && orgFromParam) {
    return {
      scope: Scope.PROJECT,
      params: {
        orgIdentifier: orgFromParam,
        projectIdentifier: projectFromParam,
        accountId
      }
    }
  }

  if (orgFromParam) {
    return {
      scope: Scope.ORGANIZATION,
      params: {
        orgIdentifier: orgFromParam,
        accountId
      }
    }
  }

  if (selectedProject?.orgIdentifier && selectedProject.identifier) {
    return {
      scope: Scope.PROJECT,
      params: {
        orgIdentifier: selectedProject.orgIdentifier,
        projectIdentifier: selectedProject.identifier,
        accountId
      }
    }
  }

  if (noscope) {
    return {}
  }

  return {
    scope: Scope.ACCOUNT
  }
}

export const getScopeIcon = (scope: Scope): IconName => {
  switch (scope) {
    case Scope.PROJECT:
      return 'nav-project'
    case Scope.ORGANIZATION:
      return 'nav-organization'
    case Scope.ACCOUNT:
      return 'Account'
  }
}
