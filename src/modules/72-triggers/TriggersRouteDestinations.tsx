/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import routes from '@common/RouteDefinitionsV2'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { RouteWithContext } from '@common/router/RouteWithContext/RouteWithContext'
import { NAV_MODE, modulePathProps, pipelinePathProps, triggerPathProps } from '@common/utils/routeUtils'
import { LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import PipelineDetails from '@pipeline/pages/pipeline-details/PipelineDetails'
import TriggersPage from './pages/triggers/TriggersPage'
import TriggerActivityHistoryPage from './pages/triggers/TriggerLandingPage/TriggerActivityHistoryPage/TriggerActivityHistoryPage'
import TriggersWizardPage from './pages/triggers/TriggersWizardPage'
import TriggerDetailPage from './pages/triggers/TriggerLandingPage/TriggerDetailPage/TriggerDetailPage'

interface TriggersRouteDestinationProps {
  mode: NAV_MODE
  licenseRedirectData?: LicenseRedirectProps
}

function TriggersRouteDestinations({
  mode = NAV_MODE.MODULE,
  licenseRedirectData
}: TriggersRouteDestinationProps): React.ReactElement {
  return (
    <>
      <RouteWithContext
        exact
        path={[
          routes.toTriggersPage({ ...pipelinePathProps, mode, ...modulePathProps }),
          routes.toTriggersPage({ ...pipelinePathProps, mode })
        ]}
        licenseRedirectData={licenseRedirectData}
        pageName={PAGE_NAME.TriggersPage}
      >
        <PipelineDetails>
          <TriggersPage />
        </PipelineDetails>
      </RouteWithContext>
      <RouteWithContext
        exact
        path={[
          routes.toTriggersDetailPage({ ...triggerPathProps, mode, ...modulePathProps }),
          routes.toTriggersDetailPage({ ...triggerPathProps, mode })
        ]}
        licenseRedirectData={licenseRedirectData}
        pageName={PAGE_NAME.TriggersPage}
      >
        <PipelineDetails>
          <TriggerDetailPage />
        </PipelineDetails>
      </RouteWithContext>
      <RouteWithContext
        exact
        path={[
          routes.toTriggersActivityHistoryPage({ ...triggerPathProps, mode, ...modulePathProps }),
          routes.toTriggersActivityHistoryPage({ ...triggerPathProps, mode })
        ]}
        licenseRedirectData={licenseRedirectData}
        pageName={PAGE_NAME.TriggersPage}
      >
        <PipelineDetails>
          <TriggerActivityHistoryPage />
        </PipelineDetails>
      </RouteWithContext>
      <RouteWithContext
        exact
        path={[
          routes.toTriggersWizardPage({ ...triggerPathProps, mode, ...modulePathProps }),
          routes.toTriggersWizardPage({ ...triggerPathProps, mode })
        ]}
        licenseRedirectData={licenseRedirectData}
        pageName={PAGE_NAME.TriggersPage}
      >
        <PipelineDetails>
          <TriggersWizardPage />
        </PipelineDetails>
      </RouteWithContext>
    </>
  )
}

export default TriggersRouteDestinations
