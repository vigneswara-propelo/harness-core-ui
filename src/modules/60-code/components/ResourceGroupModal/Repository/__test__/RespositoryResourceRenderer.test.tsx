/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import * as codeService from 'services/code'
import RepositoryResourceRenderer from '../RepositoryResourceRenderer'
import RepositoryData from './repositoryMockData.json'

const resourceScope = {
  accountIdentifier: 'accountId',
  projectIdentifier: '',
  orgIdentifier: ''
}
const props = {
  identifiers: ['testing-gitness'],
  resourceScope: resourceScope,
  resourceType: ResourceType.CODE_REPOSITORY,
  onResourceSelectionChange: jest.fn()
}

jest.mock('services/code', () => ({
  useListRepos: jest.fn().mockImplementation(() => {
    return {
      data: RepositoryData,
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))

describe('Create Repository Repository Resource table', () => {
  test(' renders Repository resources identifiers', async () => {
    render(
      <TestWrapper>
        <RepositoryResourceRenderer {...props} />
      </TestWrapper>
    )
    expect(await screen.findByText('testing-gitness')).toBeInTheDocument()
  })

  test('Show loader in case data is not ready', () => {
    jest.spyOn(codeService, 'useListRepos').mockImplementation((): any => {
      return { data: null, loading: true }
    })
    const { container } = render(
      <TestWrapper>
        <RepositoryResourceRenderer {...props} />
      </TestWrapper>
    )

    expect(container.querySelector('.PageSpinner--spinner')).toBeDefined()
  })
})
