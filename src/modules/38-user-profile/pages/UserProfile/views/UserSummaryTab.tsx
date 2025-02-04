/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout } from '@harness/uicore'
import SourceCodeManagerList from '@user-profile/components/UserSummary/SourceCodeManagerList'
import MyProjectsList from '@user-profile/components/UserSummary/MyProjectsList'
import ApiKeyList from '@rbac/components/ApiKeyList/ApiKeyList'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'

const UserSummaryTab: React.FC = () => {
  const { currentUserInfo } = useAppStore()
  const { accountId } = useParams<ProjectPathProps>()

  return (
    <Layout.Vertical spacing="large">
      <MyProjectsList />
      <SourceCodeManagerList />
      <ApiKeyList
        apiKeyType="USER"
        parentIdentifier={currentUserInfo.uuid}
        scopeValues={{ accountIdentifier: accountId }}
      />
    </Layout.Vertical>
  )
}

export default UserSummaryTab
