/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const accountId = 'accountId'
export const projectId = 'project1'
export const orgId = 'default'
export const projLevelFreezeId = 'project_level_freeze'
export const newProjectLevelFreezeRoute = `#/account/accountId/cd/orgs/default/projects/${projectId}/setup/freeze-window-studio/window/-1`
export const featureFlagsCall = `/api/users/feature-flags/accountId?routingId=${accountId}`
export const postFreezeCall = `ng/api/freeze?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgId}&projectIdentifier=${projectId}`
export const getFreezeCall = `ng/api/freeze/${projLevelFreezeId}?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgId}&projectIdentifier=${projectId}`
export const overviewPage = `#/account/${accountId}/settings/overview`
export const orgOverviewPage = `#/account/${accountId}/settings/organizations/${orgId}/details`
export const getOrgCall = `ng/api/aggregate/organizations/${orgId}?routingId=${accountId}&accountIdentifier=${accountId}`
