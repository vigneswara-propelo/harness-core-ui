/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, matchPath, useLocation, useHistory } from 'react-router-dom'
import { Breadcrumbs as UiCoreBreadcrumbs, Breadcrumb } from '@harness/uicore'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitionsV2'
import { ModePathProps, ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useSecondaryScopeSwitchDialog from '@common/navigation/SideNavV2/ScopeSwitchDialog/useSecondaryScopeSwiitchDialog'
import { Scope } from 'framework/types/types'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'
import { NGBreadcrumbsProps } from './NGBreadcrumbs'

const renderLabelAndName = (label: string, name?: string): string => {
  if (name) {
    return `${label}: ${name}`
  }

  return label
}

const NGBreadcrumbsV2: React.FC<Partial<NGBreadcrumbsProps>> = props => {
  const { getString } = useStrings()
  const { module, orgIdentifier, projectIdentifier } = useParams<ModulePathParams & ProjectPathProps & ModePathProps>()
  const { selectedProject, selectedOrg, accountInfo } = useAppStore()
  const { scope } = useGetSelectedScope()
  const { pathname } = useLocation()
  const history = useHistory()
  const { showDialog: showSecondaryScopeSwitchDialog, closeDialog: closeSecondaryScopeSwitchDialog } =
    useSecondaryScopeSwitchDialog()

  const { className, links } = props

  const list: Breadcrumb[] = [
    {
      label: renderLabelAndName(getString('account'), accountInfo?.name),
      url: '',
      onClick: () => {
        if (scope !== Scope.ACCOUNT) {
          showSecondaryScopeSwitchDialog({
            targetScope: Scope.ACCOUNT,
            onContinue: () => {
              closeSecondaryScopeSwitchDialog()
              history.push(routes.toMode({ module }))
            },
            pageName: `[${renderLabelAndName(getString('account'), accountInfo?.name)}]`
          })
        }
      }
    }
  ]

  if (orgIdentifier) {
    list.push({
      label: renderLabelAndName(getString('orgsText'), selectedOrg?.name),
      // url: routes.toMode({ module, orgIdentifier })
      url: '',
      onClick: () => {
        if (scope !== Scope.ORGANIZATION) {
          showSecondaryScopeSwitchDialog({
            targetScope: Scope.ORGANIZATION,
            onContinue: () => {
              closeSecondaryScopeSwitchDialog()
              history.push(routes.toMode({ orgIdentifier, module }))
            },
            pageName: `[${renderLabelAndName(getString('orgsText'), selectedOrg?.name)}]`
          })
        }
      }
    })
  }

  if (projectIdentifier) {
    list.push({
      label: renderLabelAndName(getString('projectLabel'), selectedProject?.name),
      url: '',
      onClick: () => {
        if (scope !== Scope.PROJECT) {
          showSecondaryScopeSwitchDialog({
            targetScope: Scope.PROJECT,
            onContinue: () => {
              closeSecondaryScopeSwitchDialog()
              history.push(routes.toMode({ projectIdentifier, orgIdentifier, module }))
            },
            pageName: `[${renderLabelAndName(getString('projectLabel'), selectedProject?.name)}]`
          })
        }
      }
    })
  }

  // If settings page, add settings link
  const isSettingsPage = matchPath(pathname, {
    path: routes.toSettings({ module, projectIdentifier, orgIdentifier })
  })

  if (isSettingsPage) {
    list.push({
      label: getString('settingsLabel'),
      url: routes.toSettings({ module, projectIdentifier, orgIdentifier })
    })
  }

  return (
    <>
      <UiCoreBreadcrumbs links={[...list, ...(links as Breadcrumb[])]} className={className} />
    </>
  )
}

export default NGBreadcrumbsV2
