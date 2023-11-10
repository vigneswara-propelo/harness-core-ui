/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import routes from '@modules/10-common/RouteDefinitions'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import { accountPathProps } from '@common/utils/routeUtils'
import { NotificationPageList } from '../NotificationsPageList'

describe('Notifications Page List', () => {
  test('init render', () => {
    render(
      <TestWrapper path={routes.toNotificationsManagement({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <NotificationPageList />
      </TestWrapper>
    )
    const heading = screen.queryByText('Central Notifications Page')
    expect(heading).toBeInTheDocument()
  })
})
