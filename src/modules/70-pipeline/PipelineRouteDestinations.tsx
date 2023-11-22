/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Switch } from 'react-router-dom'
import routes from '@common/RouteDefinitionsV2'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import {
  NAV_MODE,
  accountPathProps,
  executionPathProps,
  inputSetFormPathProps,
  modulePathProps,
  pipelinePathProps,
  projectPathProps
} from '@common/utils/routeUtils'
import { LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import { SIDE_NAV_STATE } from '@modules/10-common/router/RouteWithLayoutV2'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { ExecutionListPage } from './pages/execution-list-page/ExecutionListPage'
import { PipelineListPage } from './pages/pipeline-list/PipelineListPage'
import PipelineDetails from './pages/pipeline-details/PipelineDetails'
import PipelineStudio from './components/PipelineStudio/PipelineStudio'
import InputSetList from './pages/inputSet-list/InputSetList'
import PipelineStudioV1 from './v1/components/PipelineStudioV1/PipelineStudioV1'
import FullPageLogView from './pages/full-page-log-view/FullPageLogView'
import { EnhancedInputSetFormForRoute } from './components/InputSetForm/EnhancedInputSetForm'
import { InputSetFormV1ForRoute } from './v1/components/InputSetFormV1/InputSetFormV1'
import { RedirectToExecutionPipeline, RedirectToPipelineDetailHome } from './RouteDestinations'
import ExecutionLandingPage from './pages/execution/ExecutionLandingPage/ExecutionLandingPage'
import ExecutionPipelineView from './pages/execution/ExecutionPipelineView/ExecutionPipelineView'
import ExecutionPolicyEvaluationsView from './pages/execution/ExecutionPolicyEvaluationsView/ExecutionPolicyEvaluationsView'
import ExecutionSecurityView from './pages/execution/ExecutionSecurityView/ExecutionSecurityView'
import ExecutionErrorTrackingView from './pages/execution/ExecutionErrorTrackingView/ExecutionErrorTrackingView'
import ExecutionInputsView from './pages/execution/ExecutionInputsView/ExecutionInputsView'
import ExecutionArtifactsView from './pages/execution/ExecutionArtifactsView/ExecutionArtifactsView'
import BuildTestsApp from './pages/execution/ExecutionTestView/BuildTestsApp'
import { BuildCommits } from './pages/execution/ExecutionLandingPage/Commits/BuildCommits'
import ResilienceView from './pages/execution/ResilienceView/ResilienceView'
import { PipelineDeploymentList } from './pages/pipeline-deployment-list/PipelineDeploymentList'
import ExecutionIACMResourcesView from './pages/execution/ExecutionIACMResourcesView/ExecutionIACMResourcesView'
import ExecutionIACMCostsEstimationView from './pages/execution/ExecutionIACMCostsEstimationView'

interface PipleineRouteDestinationProps {
  mode: NAV_MODE
  pipelineStudioPageName?: PAGE_NAME
  licenseRedirectData?: LicenseRedirectProps
}

function PipelineRouteDestinations({
  mode = NAV_MODE.MODULE,
  pipelineStudioPageName,
  licenseRedirectData
}: PipleineRouteDestinationProps): React.ReactElement {
  return (
    <Switch>
      <RouteWithContext
        exact
        path={[
          routes.toDeployments({ ...projectPathProps, mode, ...modulePathProps }),
          routes.toDeployments({ ...projectPathProps, mode })
        ]}
        pageName={PAGE_NAME.DeploymentsList}
      >
        <ExecutionListPage />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={[
          routes.toPipelines({ ...projectPathProps, ...modulePathProps, mode }),
          routes.toPipelines({ ...projectPathProps, mode })
        ]}
      >
        <PipelineListPage />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={[
          routes.toPipelineStudio({ ...projectPathProps, ...pipelinePathProps, ...modulePathProps, mode }),
          routes.toPipelineStudio({ ...projectPathProps, ...pipelinePathProps, mode })
        ]}
      >
        <PipelineDetails>
          <PipelineStudio />
        </PipelineDetails>
      </RouteWithContext>
      <RouteWithContext
        exact
        path={[
          routes.toInputSetList({ ...projectPathProps, ...pipelinePathProps, ...modulePathProps, mode }),
          routes.toInputSetList({ ...projectPathProps, ...pipelinePathProps, mode })
        ]}
        pageName={PAGE_NAME.InputSetList}
      >
        <PipelineDetails>
          <InputSetList />
        </PipelineDetails>
      </RouteWithContext>
      <RouteWithContext
        exact
        licenseRedirectData={licenseRedirectData}
        path={[
          routes.toPipelineStudioV1({ ...projectPathProps, ...pipelinePathProps, ...modulePathProps, mode }),
          routes.toPipelineStudioV1({ ...projectPathProps, ...pipelinePathProps, mode })
        ]}
        pageName={pipelineStudioPageName}
      >
        <PipelineDetails>{PipelineStudioV1 ? <PipelineStudioV1 /> : <></>}</PipelineDetails>
      </RouteWithContext>
      <RouteWithContext
        exact
        licenseRedirectData={licenseRedirectData}
        path={[
          routes.toPipelineLogs({
            ...projectPathProps,
            ...executionPathProps,
            ...modulePathProps,
            stageIdentifier: ':stageIdentifier',
            stepIndentifier: ':stepIndentifier'
          }),
          routes.toPipelineLogs({
            ...projectPathProps,
            ...executionPathProps,
            stageIdentifier: ':stageIdentifier',
            stepIndentifier: ':stepIndentifier'
          })
        ]}
        sideNavState={SIDE_NAV_STATE.HIDDEN}
        disableAuxNav
        pageName={PAGE_NAME.FullPageLogView}
      >
        <FullPageLogView />
      </RouteWithContext>
      <RouteWithContext
        exact
        licenseRedirectData={licenseRedirectData}
        path={[
          routes.toInputSetForm({ ...projectPathProps, ...inputSetFormPathProps, ...modulePathProps, mode }),
          routes.toInputSetForm({ ...projectPathProps, ...inputSetFormPathProps, mode })
        ]}
        pageName={PAGE_NAME.EnhancedInputSetForm}
      >
        <EnhancedInputSetFormForRoute />
      </RouteWithContext>
      <RouteWithContext
        exact
        licenseRedirectData={licenseRedirectData}
        path={[
          routes.toInputSetFormV1({ ...projectPathProps, ...inputSetFormPathProps, ...modulePathProps, mode }),
          routes.toInputSetFormV1({ ...projectPathProps, ...inputSetFormPathProps, mode })
        ]}
        pageName={PAGE_NAME.InputSetFormV1}
      >
        <InputSetFormV1ForRoute />
      </RouteWithContext>
      <RouteWithContext
        exact
        path={[
          routes.toExecution({ ...projectPathProps, ...executionPathProps, ...modulePathProps, mode }),
          routes.toExecution({ ...projectPathProps, ...executionPathProps, mode })
        ]}
      >
        <RedirectToExecutionPipeline />
      </RouteWithContext>
      <RouteWithContext
        exact
        licenseRedirectData={licenseRedirectData}
        sideNavState={SIDE_NAV_STATE.COLLAPSED}
        path={[
          routes.toExecutionPipelineView({ ...projectPathProps, ...executionPathProps, ...modulePathProps, mode }),
          routes.toExecutionPipelineView({ ...projectPathProps, ...executionPathProps, mode })
        ]}
        pageName={PAGE_NAME.ExecutionPipelineView}
      >
        <ExecutionLandingPage>
          <ExecutionPipelineView />
        </ExecutionLandingPage>
      </RouteWithContext>
      <RouteWithContext
        exact
        licenseRedirectData={licenseRedirectData}
        sideNavState={SIDE_NAV_STATE.COLLAPSED}
        path={[
          routes.toExecutionPolicyEvaluationsView({
            ...projectPathProps,
            ...executionPathProps,
            ...modulePathProps,
            mode
          }),
          routes.toExecutionPolicyEvaluationsView({ ...projectPathProps, ...executionPathProps, mode })
        ]}
        pageName={PAGE_NAME.ExecutionPolicyEvaluationsView}
      >
        <ExecutionLandingPage>
          <ExecutionPolicyEvaluationsView />
        </ExecutionLandingPage>
      </RouteWithContext>
      <RouteWithContext
        exact
        path={[
          routes.toExecutionSecurityView({
            ...projectPathProps,
            ...executionPathProps,
            ...modulePathProps,
            mode
          }),
          routes.toExecutionSecurityView({ ...projectPathProps, ...executionPathProps, mode })
        ]}
        sideNavState={SIDE_NAV_STATE.COLLAPSED}
        pageName={PAGE_NAME.ExecutionSecurityView}
      >
        <ExecutionLandingPage>
          <ExecutionSecurityView />
        </ExecutionLandingPage>
      </RouteWithContext>
      <RouteWithContext
        licenseRedirectData={licenseRedirectData}
        sideNavState={SIDE_NAV_STATE.COLLAPSED}
        path={[
          routes.toExecutionErrorTrackingView({
            ...projectPathProps,
            ...executionPathProps,
            ...modulePathProps,
            mode
          }),
          routes.toExecutionErrorTrackingView({ ...projectPathProps, ...executionPathProps, mode })
        ]}
        pageName={PAGE_NAME.ErrorTrackingListPage}
      >
        <ExecutionLandingPage>
          <ExecutionErrorTrackingView />
        </ExecutionLandingPage>
      </RouteWithContext>
      <RouteWithContext
        exact
        licenseRedirectData={licenseRedirectData}
        path={[
          routes.toExecutionInputsView({
            ...projectPathProps,
            ...executionPathProps,
            ...modulePathProps,
            mode
          }),
          routes.toExecutionInputsView({ ...projectPathProps, ...executionPathProps, mode })
        ]}
        sideNavState={SIDE_NAV_STATE.COLLAPSED}
        pageName={PAGE_NAME.ExecutionInputsView}
      >
        <ExecutionLandingPage>
          <ExecutionInputsView />
        </ExecutionLandingPage>
      </RouteWithContext>
      <RouteWithContext
        exact
        path={[
          routes.toExecutionArtifactsView({
            ...projectPathProps,
            ...executionPathProps,
            ...modulePathProps,
            mode
          }),
          routes.toExecutionArtifactsView({ ...projectPathProps, ...executionPathProps, mode })
        ]}
        sideNavState={SIDE_NAV_STATE.COLLAPSED}
        pageName={PAGE_NAME.ExecutionArtifactsView}
      >
        <ExecutionLandingPage>
          <ExecutionArtifactsView />
        </ExecutionLandingPage>
      </RouteWithContext>
      <RouteWithContext
        exact
        licenseRedirectData={licenseRedirectData}
        path={[
          routes.toExecutionTestsView({
            ...projectPathProps,
            ...executionPathProps,
            ...modulePathProps,
            mode
          }),
          routes.toExecutionTestsView({ ...projectPathProps, ...executionPathProps, mode })
        ]}
        sideNavState={SIDE_NAV_STATE.COLLAPSED}
        pageName={PAGE_NAME.BuildTests}
      >
        <ExecutionLandingPage>
          <BuildTestsApp />
        </ExecutionLandingPage>
      </RouteWithContext>
      <RouteWithContext
        exact
        path={[
          routes.toExecutionCommitsView({
            ...projectPathProps,
            ...executionPathProps,
            ...modulePathProps,
            mode
          }),
          routes.toExecutionCommitsView({ ...projectPathProps, ...executionPathProps, mode })
        ]}
        sideNavState={SIDE_NAV_STATE.COLLAPSED}
        pageName={PAGE_NAME.BuildCommits}
      >
        <ExecutionLandingPage>
          <BuildCommits />
        </ExecutionLandingPage>
      </RouteWithContext>

      <RouteWithContext
        exact
        licenseRedirectData={licenseRedirectData}
        path={[
          routes.toResilienceView({
            ...projectPathProps,
            ...executionPathProps,
            ...modulePathProps,
            mode
          }),
          routes.toResilienceView({ ...projectPathProps, ...executionPathProps, mode })
        ]}
        sideNavState={SIDE_NAV_STATE.COLLAPSED}
        pageName={PAGE_NAME.ExecutionResilienceView}
      >
        <ExecutionLandingPage>
          <ResilienceView />
        </ExecutionLandingPage>
      </RouteWithContext>
      <RouteWithContext
        exact
        licenseRedirectData={licenseRedirectData}
        path={[
          routes.toPipelineDeploymentList({
            ...projectPathProps,
            ...pipelinePathProps,
            ...modulePathProps,
            mode
          }),
          routes.toPipelineDeploymentList({ ...projectPathProps, ...pipelinePathProps, mode })
        ]}
        // pageName={pipelineDeploymentListPageName}
      >
        <PipelineDetails>
          <PipelineDeploymentList />
        </PipelineDetails>
      </RouteWithContext>
      <RouteWithContext
        exact
        licenseRedirectData={licenseRedirectData}
        path={[
          routes.toPipelineDetail({
            ...projectPathProps,
            ...pipelinePathProps,
            ...modulePathProps,
            mode
          }),
          routes.toPipelineDetail({ ...projectPathProps, ...pipelinePathProps, mode })
        ]}
      >
        <RedirectToPipelineDetailHome />
      </RouteWithContext>

      <RouteWithContext
        exact
        licenseRedirectData={licenseRedirectData}
        path={[
          routes.toIACMPipelineResources({
            ...accountPathProps,
            ...executionPathProps,
            ...modulePathProps
          }),
          routes.toIACMPipelineResources({
            ...accountPathProps,
            ...executionPathProps
          })
        ]}
        pageName={PAGE_NAME.ExecutionIACMPipelineResources}
      >
        <ExecutionLandingPage>
          <ExecutionIACMResourcesView />
        </ExecutionLandingPage>
      </RouteWithContext>
      <RouteWithContext
        exact
        licenseRedirectData={licenseRedirectData}
        path={[
          routes.toIACMPipelineCostEstimation({
            ...accountPathProps,
            ...executionPathProps,
            ...modulePathProps
          }),
          routes.toIACMPipelineCostEstimation({
            ...accountPathProps,
            ...executionPathProps
          })
        ]}
        pageName={PAGE_NAME.IACMCostEstimation}
      >
        <ExecutionLandingPage>
          <ExecutionIACMCostsEstimationView />
        </ExecutionLandingPage>
      </RouteWithContext>
    </Switch>
  )
}

export default PipelineRouteDestinations
