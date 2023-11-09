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
  getString: UseStringsReturn['getString'],
  hasAccountAccess?: boolean
): Partial<Record<Scope, ScopeSwitchProps>> => {
  if (!hasAccountAccess) {
    return {
      [Scope.ACCOUNT]: {
        link: {
          icon: 'nav-settings',
          label: getString('common.viewSettings', { scope: Scope.ACCOUNT }),
          info: getString('common.viewAndManageSettings', { scope: Scope.ACCOUNT }),
          onClick: () => {
            history.push(routes.toSettings({ accountId, module }))
          }
        }
      }
    }
  } else {
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
