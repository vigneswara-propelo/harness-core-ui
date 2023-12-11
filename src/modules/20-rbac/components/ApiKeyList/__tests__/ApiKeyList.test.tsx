/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import * as cdngServices from 'services/cd-ng'
import ApiKeyList from '../ApiKeyList'

describe('apiKeyList tests', () => {
  test('account scope test', () => {
    const fetchAPIKeys = jest
      .fn()
      .mockImplementation(() => ({ data: {}, refetch: jest.fn(), error: null, loading: false }))
    jest.spyOn(cdngServices, 'useListAggregatedApiKeys').mockImplementation(fetchAPIKeys)

    render(
      <TestWrapper>
        <ApiKeyList scopeValues={{ accountIdentifier: 'testAccountId' }} />
      </TestWrapper>
    )

    expect(fetchAPIKeys).toBeCalledWith({
      queryParams: {
        accountIdentifier: 'testAccountId',
        apiKeyType: 'SERVICE_ACCOUNT',
        orgIdentifier: undefined,
        parentIdentifier: undefined,
        projectIdentifier: undefined
      }
    })
    // expect(container).toBeDefined()
  })

  test('account scope test', () => {
    const fetchAPIKeys = jest
      .fn()
      .mockImplementation(() => ({ data: {}, refetch: jest.fn(), error: null, loading: false }))
    jest.spyOn(cdngServices, 'useListAggregatedApiKeys').mockImplementation(fetchAPIKeys)

    render(
      <TestWrapper>
        <ApiKeyList
          scopeValues={{
            accountIdentifier: 'testAccountId',
            projectIdentifier: 'testProject',
            orgIdentifier: 'testOrg'
          }}
        />
      </TestWrapper>
    )

    expect(fetchAPIKeys).toBeCalledWith({
      queryParams: {
        accountIdentifier: 'testAccountId',
        apiKeyType: 'SERVICE_ACCOUNT',
        orgIdentifier: 'testOrg',
        parentIdentifier: undefined,
        projectIdentifier: 'testProject'
      }
    })
  })
})
