/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, useParams } from 'react-router-dom'

import { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import PipelineRouteDestinations from '@pipeline/PipelineRouteDestinations'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { accountPathProps, NAV_MODE, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import { ModuleName } from 'framework/types/ModuleName'

import routes from '@common/RouteDefinitionsV2'
import { Scope } from 'framework/types/types'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useGetSelectedScope } from '@common/navigation/SideNavV2/SideNavV2.utils'
import NotFoundPage from '@modules/10-common/pages/404/NotFoundPage'
import MonitoredServiceListWidget from './components/MonitoredServiceListWidget/MonitoredServiceListWidget'
import {
  CD_MONITORED_SERVICE_CONFIG,
  PROJECT_MONITORED_SERVICE_CONFIG
} from './components/MonitoredServiceListWidget/MonitoredServiceListWidget.constants'
import CommonMonitoredServiceDetails from './components/MonitoredServiceListWidget/components/CommonMonitoredServiceDetails/CommonMonitoredServiceDetails'
import { editParams } from './utils/routeUtils'
import { cdModuleParams, serviceAndEnvParams } from './RouteDestinations'
import CVMonitoredService from './pages/monitored-service/CVMonitoredService/CVMonitoredService'
import MonitoredServiceInputSetsTemplate from './pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate'
import MonitoredServicePage from './pages/monitored-service/MonitoredServicePage'
import { MonitoredServiceProvider } from './pages/monitored-service/MonitoredServiceContext'
import CVHomePage from './pages/home/CVHomePage'
import { cvModuleParams } from './constants'
import SRMApp from './SRMApp'

const CVRedirect: React.FC = () => {
  const { scope, params } = useGetSelectedScope()
  const { accountId } = useParams<AccountPathProps>()

  if (scope === Scope.PROJECT) {
    return (
      <Redirect
        to={routes.toCVSLOs({
          projectIdentifier: params?.projectIdentifier,
          orgIdentifier: params?.orgIdentifier,
          accountId,
          module: 'cv'
        })}
      />
    )
  }

  if (scope === Scope.ORGANIZATION) {
    // redirect to settings page
    return <Redirect to={routes.toSettings({ orgIdentifier: params?.orgIdentifier, module: 'cv' })} />
  }

  if (scope === Scope.ACCOUNT) {
    return (
      <Redirect
        to={routes.toCVSLOs({
          accountId,
          module: 'cv'
        })}
      />
    )
  }

  // Open scope selector
  return <CVHomePage />
}

const RedirectToCVProject = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject?.modules?.includes(ModuleName.CV)) {
    return (
      <Redirect
        to={routes.toCVSLOs({
          accountId: params.accountId,
          orgIdentifier: selectedProject.orgIdentifier || '',
          projectIdentifier: selectedProject.identifier
        })}
      />
    )
  } else {
    return <Redirect to={routes.toCVHome(params)} />
  }
}

const CVRouteDestinations = (mode = NAV_MODE.MODULE): React.ReactElement => {
  const { SRM_MICRO_FRONTEND: enableMicroFrontend } = useFeatureFlags()

  const mfePaths = [
    routes.toCVSLOs({ ...accountPathProps, mode, ...projectPathProps, ...cvModuleParams }),
    routes.toAccountCVSLOs({ ...accountPathProps, mode, ...cvModuleParams }),
    routes.toCVCreateSLOs({ ...accountPathProps, mode, ...projectPathProps, ...cvModuleParams }),
    routes.toCVCreateCompositeSLOs({ ...accountPathProps, mode, ...projectPathProps, ...cvModuleParams }),
    routes.toCVSLODetailsPage({
      ...accountPathProps,
      mode,
      ...projectPathProps,
      ...editParams,
      ...cvModuleParams
    }),
    routes.toCVChanges({ ...accountPathProps, mode, ...projectPathProps, ...cvModuleParams }),
    routes.toAccountCVSLODetailsPage({ ...accountPathProps, mode, ...editParams, ...cvModuleParams }),
    routes.toAccountCVCreateCompositeSLOs({ ...accountPathProps, mode, ...cvModuleParams })
  ]

  return (
    <>
      <RouteWithContext
        exact
        path={[
          routes.toMode({ ...projectPathProps, module: 'cv', mode }),
          routes.toMode({ ...orgPathProps, module: 'cv', mode }),
          routes.toMode({ ...accountPathProps, module: 'cv', mode })
        ]}
      >
        <CVRedirect />
      </RouteWithContext>
      <RouteWithContext
        path={routes.toMonitoredServices({ ...accountPathProps, ...orgPathProps, ...projectPathProps, mode })}
        exact
      >
        <MonitoredServiceListWidget config={PROJECT_MONITORED_SERVICE_CONFIG} />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={routes.toAddMonitoredServices({ ...accountPathProps, ...orgPathProps, ...projectPathProps, mode })}
      >
        <MonitoredServiceProvider isTemplate={false}>
          <CommonMonitoredServiceDetails config={PROJECT_MONITORED_SERVICE_CONFIG} />
        </MonitoredServiceProvider>
      </RouteWithContext>
      <RouteWithContext
        path={routes.toMonitoredServicesConfigurations({
          ...accountPathProps,
          ...orgPathProps,
          ...projectPathProps,
          ...editParams,
          mode
        })}
        exact
      >
        <CommonMonitoredServiceDetails config={PROJECT_MONITORED_SERVICE_CONFIG} />
      </RouteWithContext>
      <RouteWithContext
        path={routes.toMonitoredServices({
          ...accountPathProps,
          ...orgPathProps,
          ...projectPathProps,
          ...cdModuleParams,
          mode
        })}
        exact
      >
        <MonitoredServiceListWidget config={CD_MONITORED_SERVICE_CONFIG} />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={routes.toAddMonitoredServices({
          ...accountPathProps,
          ...orgPathProps,
          ...projectPathProps,
          ...cdModuleParams,
          mode
        })}
      >
        <MonitoredServiceProvider isTemplate={false}>
          <CommonMonitoredServiceDetails config={CD_MONITORED_SERVICE_CONFIG} />
        </MonitoredServiceProvider>
      </RouteWithContext>
      <RouteWithContext
        path={routes.toMonitoredServicesConfigurations({
          ...accountPathProps,
          ...orgPathProps,
          ...projectPathProps,
          ...cdModuleParams,
          ...editParams,
          mode
        })}
        exact
      >
        <CommonMonitoredServiceDetails config={CD_MONITORED_SERVICE_CONFIG} />
      </RouteWithContext>
      <RouteWithContext path={[routes.toCVProject({ ...accountPathProps, ...projectPathProps, mode })]} exact>
        <RedirectToCVProject />
      </RouteWithContext>
      <RouteWithContext exact path={routes.toCVHome({ ...accountPathProps, mode })}>
        <CVHomePage />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={routes.toCVMonitoringServices({ ...accountPathProps, ...projectPathProps, ...cvModuleParams, mode })}
      >
        <MonitoredServiceProvider isTemplate={false}>
          <CVMonitoredService />
        </MonitoredServiceProvider>
      </RouteWithContext>
      <RouteWithContext
        exact
        path={routes.toCVMonitoringServicesInputSets({
          ...accountPathProps,
          ...projectPathProps,
          ...cvModuleParams,
          mode
        })}
      >
        <MonitoredServiceInputSetsTemplate />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={[
          routes.toCVAddMonitoringServicesSetup({ ...accountPathProps, ...projectPathProps, mode, ...cvModuleParams }),
          routes.toCVAddMonitoringServicesEdit({
            ...accountPathProps,
            ...projectPathProps,
            ...editParams,
            ...cvModuleParams,
            mode
          })
        ]}
      >
        <MonitoredServiceProvider isTemplate={false}>
          <MonitoredServicePage />
        </MonitoredServiceProvider>
      </RouteWithContext>

      <RouteWithContext
        exact
        path={[
          routes.toCVAddMonitoredServiceForServiceAndEnv({
            ...accountPathProps,
            ...projectPathProps,
            ...serviceAndEnvParams,
            mode
          })
        ]}
      >
        <MonitoredServiceProvider isTemplate={false}>
          <MonitoredServicePage />
        </MonitoredServiceProvider>
      </RouteWithContext>
      {enableMicroFrontend ? (
        <RouteWithContext exact path={[...mfePaths]}>
          <SRMApp />
        </RouteWithContext>
      ) : (
        <RouteWithContext exact path={[...mfePaths]}>
          <NotFoundPage />
        </RouteWithContext>
      )}
      {PipelineRouteDestinations({ mode, pipelineStudioPageName: PAGE_NAME.CDPipelineStudio }).props.children}
    </>
  )
}
export default CVRouteDestinations
