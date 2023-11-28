/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { History } from 'history'
import { Scope } from 'framework/types/types'
import routes from '@common/RouteDefinitionsV2'
import { OrgPathProps, ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import { ScopeSwitchProps } from '@modules/10-common/navigation/SideNavV2/SideNavV2'
import type { UseStringsReturn } from 'framework/strings'
import { module } from '../../constants'

export const getProjectLevelRedirectionProps = (
  history: History,
  accountId: string,
  getString: UseStringsReturn['getString']
): Partial<Record<Scope, ScopeSwitchProps>> => {
  return {
    [Scope.ACCOUNT]: {
      link: {
        icon: 'ccm-cloud-integration-settings',
        label: getString('sei.goToIntegrations'),
        info: getString('sei.integrationsInfo'),
        onClick: () => {
          history.push(routes.toSEIIntegrations({ accountId, module }))
        }
      }
    }
  }
}

export const getAccountLevelRedirectionProps = (
  history: History,
  accountId: string,
  getString: UseStringsReturn['getString']
): Partial<Record<Scope, ScopeSwitchProps>> => {
  return {
    [Scope.PROJECT]: {
      link: {
        icon: 'graph-increase',
        label: getString('sei.goToInsights'),
        info: getString('sei.insghtsInfo'),
        onClick: (targetScopeParams?: ProjectPathProps | OrgPathProps) => {
          const { projectIdentifier: targetProject, orgIdentifier: targetOrg } = targetScopeParams as ProjectPathProps
          history.push(
            routes.toSEIInsights({
              accountId,
              projectIdentifier: targetProject,
              orgIdentifier: targetOrg,
              module
            })
          )
        }
      }
    }
  }
}
