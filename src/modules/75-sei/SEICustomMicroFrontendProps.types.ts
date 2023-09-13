/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type routes from '@common/RouteDefinitions'
import type { NameSchema } from '@common/utils/Validation'
import { ProjectSelector } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import NavExpandable from '@common/navigation/NavExpandable/NavExpandable'
import SideNav from '@common/navigation/SideNav'
import { HomePageTemplate } from '@projects-orgs/pages/HomePageTemplate/HomePageTemplate'
import { useGetLicensesAndSummary } from 'services/cd-ng'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { AccessControlRouteDestinations } from '@rbac/RouteDestinations'
import { EmptyLayout } from '@common/layouts'

export interface SEICustomMicroFrontendProps {
  cdServices: {
    useGetLicensesAndSummary: typeof useGetLicensesAndSummary
  }
  customComponents: {
    ProjectSelector: typeof ProjectSelector
    NavExpandable: typeof NavExpandable
    HarnessSideNav: typeof SideNav
    HomePageTemplate: typeof HomePageTemplate
    SidebarLink: typeof SidebarLink
    AccessControlRouteDestinations: typeof AccessControlRouteDestinations
    EmptyLayout: typeof EmptyLayout
  }
  customRoutes: typeof routes
  customUtils: {
    NameSchema: typeof NameSchema
  }
}
