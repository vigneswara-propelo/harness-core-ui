/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import * as cdngServices from 'services/cd-ng'
import ResourceCardList from '../ResourceCardList'
import { smtpConfig } from './mocks/mockData'

jest.spyOn(cdngServices, 'useGetSmtpConfig').mockImplementation(() => ({ mutate: () => smtpConfig } as any))
let smtpPageOpened = false
const mockHistoryPush = jest.fn().mockImplementation(() => {
  smtpPageOpened = true
})
// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush
  })
}))
jest.spyOn(cdngServices, 'useGetSettingValue').mockImplementation(() => ({ data: { data: { value: 'false' } } } as any))

const ACCOUNT_PATH_PARAMS = {
  accountId: 'TEST_ACCOUNT_ID',
  entity: 'agents'
}

const ACCOUNT_LEVEL_GITOPS_ROUTE = routes.toGitOpsResources({
  ...accountPathProps,
  entity: ':entity'
})

describe('Resource card list test', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper path={ACCOUNT_LEVEL_GITOPS_ROUTE} pathParams={ACCOUNT_PATH_PARAMS}>
        <ResourceCardList />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('test smtp card on click', async () => {
    const renderObj = render(
      <TestWrapper>
        <ResourceCardList />
      </TestWrapper>
    )
    const smptpCard = renderObj.queryByText('common.smtp.conifg')
    if (!smptpCard) {
      throw Error('no smtp card')
    }
    fireEvent.click(smptpCard)
    expect(smtpPageOpened).toBeTruthy()
  })

  test('GitOps Entities at account level', () => {
    const { getByText } = render(
      <TestWrapper path={ACCOUNT_LEVEL_GITOPS_ROUTE} pathParams={ACCOUNT_PATH_PARAMS}>
        <ResourceCardList />
      </TestWrapper>
    )

    const gitOpsEl = getByText('common.gitOps')
    expect(gitOpsEl).toBeDefined()

    act(() => {
      fireEvent.click(gitOpsEl)
    })

    expect(getByText('common.gitopsAgents')).toBeDefined()
    expect(getByText('repositories')).toBeDefined()
    expect(getByText('common.clusters')).toBeDefined()
    expect(getByText('common.repositoryCertificates')).toBeDefined()
    expect(getByText('common.gnupgKeys')).toBeDefined()
  })

  test('it should not render the Feature Flags Proxy tile at account level when the flag is false', () => {
    render(
      <TestWrapper
        path={ACCOUNT_LEVEL_GITOPS_ROUTE}
        pathParams={ACCOUNT_PATH_PARAMS}
        defaultFeatureFlagValues={{ FFM_9497_PROXY_KEY_MANAGEMENT: false }}
      >
        <ResourceCardList />
      </TestWrapper>
    )
    expect(screen.queryByText('common.ffProxy')).not.toBeInTheDocument()
  })

  test('it should render the Feature Flags Proxy tile at account level when the flag is true', () => {
    render(
      <TestWrapper
        path={ACCOUNT_LEVEL_GITOPS_ROUTE}
        pathParams={ACCOUNT_PATH_PARAMS}
        defaultFeatureFlagValues={{ FFM_9497_PROXY_KEY_MANAGEMENT: true }}
      >
        <ResourceCardList />
      </TestWrapper>
    )
    expect(screen.getByText('common.ffProxy')).toBeInTheDocument()
  })
})
