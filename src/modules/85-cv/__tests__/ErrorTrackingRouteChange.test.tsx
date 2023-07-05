/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { RedirectToCETEventSummaryDetail, etModuleParams } from '@cet/RouteDestinations'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'

const Wrapper = ({ queryParams }: { queryParams?: any }) => (
  <TestWrapper
    path={routes.toCETEventSummaryDetailOldNotifLink({
      ...accountPathProps,
      ...orgPathProps,
      ...projectPathProps,
      ...etModuleParams
    })}
    pathParams={{
      module: 'cet',
      accountId: 'cvng',
      orgIdentifier: 'default',
      projectIdentifier: 'project1'
    }}
    queryParams={queryParams}
  >
    <RedirectToCETEventSummaryDetail />
  </TestWrapper>
)
describe('Validate Error tracking old notificaiton link', () => {
  test('should redirect to new url', () => {
    const { container } = render(<Wrapper />)
    const location = container.querySelector('[data-testid="location"]')?.textContent
    expect(location).toEqual('/account/cvng/cet/orgs/default/projects/project1/eventsummary/events?accountId=cvng')
  })

  test('should redirect to new url with queryParams', () => {
    const queryParamData = {
      env: 'TestEnv1',
      service: 'TestService1',
      dep: 'v0.2'
    }
    const { container } = render(<Wrapper queryParams={queryParamData} />)
    const location = container.querySelector('[data-testid="location"]')?.textContent
    expect(location).toEqual(
      '/account/cvng/cet/orgs/default/projects/project1/eventsummary/events?accountId=cvng&env=TestEnv1&service=TestService1&dep=v0.2'
    )
  })
})
