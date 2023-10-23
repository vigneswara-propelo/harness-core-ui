import type { History } from 'history'
import { Scope } from 'framework/types/types'
import routes from '@common/RouteDefinitionsV2'
import { OrgPathProps, ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import { ScopeSwitchProps } from '@modules/10-common/navigation/SideNavV2/SideNavV2'
import { module } from '../constants'

export const getProjectLevelRedirectionProps = (
  history: History,
  accountId: string
): Partial<Record<Scope, ScopeSwitchProps>> => {
  return {
    [Scope.ACCOUNT]: {
      link: {
        icon: 'ccm-cloud-integration-settings',
        label: 'Go to Integrations',
        info: '',
        onClick: () => {
          history.push(routes.toSEIIntegrations({ accountId, module }))
        }
      }
    }
  }
}

export const getAccountLevelRedirectionProps = (
  history: History,
  accountId: string
): Partial<Record<Scope, ScopeSwitchProps>> => {
  return {
    [Scope.PROJECT]: {
      link: {
        icon: 'graph-increase',
        label: 'Go to Insights',
        info: '',
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
