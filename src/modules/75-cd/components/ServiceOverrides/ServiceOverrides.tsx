/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'

import { HarnessDocTooltip, Heading, Page, Tabs, Container } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { HelpPanel, HelpPanelType } from '@harness/help-panel'

import { useStrings } from 'framework/strings'

import type {
  ModulePathParams,
  ProjectPathProps,
  ServiceOverridesQueryParams
} from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import ServiceOverrideFiltersContainer from '@cd/components/ServiceOverrides/components/ServiceOverrideFilters/ServiceOverrideFiltersContainer'

import { ServiceOverridesTab } from './ServiceOverridesUtils'

import GlobalEnvironmentOverrides from './GlobalEnvironmentOverrides/GlobalEnvironmentOverrides'
import EnvironmentServiceSpecificOverrides from './EnvironmentServiceSpecificOverrides/EnvironmentServiceSpecificOverrides'
import GlobalInfrastructureOverrides from './GlobalInfrastructureOverrides/GlobalInfrastructureOverrides'
import InfrastructureServiceSpecificOverrides from './InfrastructureServiceSpecificOverrides/InfrastructureServiceSpecificOverrides'

import css from './ServiceOverrides.module.scss'

export default function ServiceOverrides(): React.ReactElement {
  const { module } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()
  useDocumentTitle(getString('common.overrides'))

  const { serviceOverrideType } = useQueryParams<ServiceOverridesQueryParams>()
  const [selectedTabId, setSelectedTabId] = useState(
    defaultTo(serviceOverrideType, ServiceOverridesTab.ENV_GLOBAL_OVERRIDE)
  )

  const { updateQueryParams } = useUpdateQueryParams<ServiceOverridesQueryParams>()

  const handleTabChange = (tabId: ServiceOverridesTab): void => {
    updateQueryParams({
      serviceOverrideType: ServiceOverridesTab[ServiceOverridesTab[tabId]],
      page: undefined
    })
    setSelectedTabId(tabId)
  }

  return (
    <>
      <HelpPanel referenceId="serviceOverrides" type={HelpPanelType.FLOATING_CONTAINER} />
      <main>
        <Page.Header
          title={
            <Heading level={3} font={{ variation: FontVariation.H4 }} data-tooltip-id={'serviceOverridesV2'}>
              {getString('common.overrides')}
              <HarnessDocTooltip tooltipId={'serviceOverridesV2'} useStandAlone />
            </Heading>
          }
          breadcrumbs={<NGBreadcrumbs customPathParams={{ module }} />}
        />
        <Page.Body className={css.serviceOverridePageBody}>
          <Tabs
            id="serviceOverridesV2"
            onChange={handleTabChange}
            selectedTabId={selectedTabId}
            data-tabId={selectedTabId}
            tabList={[
              {
                id: ServiceOverridesTab.ENV_GLOBAL_OVERRIDE,
                title: getString('common.serviceOverrides.globalEnvironment'),
                panel: <GlobalEnvironmentOverrides />
              },
              {
                id: ServiceOverridesTab.ENV_SERVICE_OVERRIDE,
                title: getString('common.serviceOverrides.environmentServiceSpecific'),
                panel: <EnvironmentServiceSpecificOverrides />
              },
              {
                id: ServiceOverridesTab.INFRA_GLOBAL_OVERRIDE,
                title: getString('common.serviceOverrides.globalInfra'),
                panel: <GlobalInfrastructureOverrides />
              },
              {
                id: ServiceOverridesTab.INFRA_SERVICE_OVERRIDE,
                title: getString('common.serviceOverrides.infrastructureServiceSpecific'),
                panel: <InfrastructureServiceSpecificOverrides />
              }
            ]}
          />
          <Container className={css.serviceOverrideFilterSection}>
            <ServiceOverrideFiltersContainer />
          </Container>
        </Page.Body>
      </main>
    </>
  )
}
