/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { SortMethod } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as codeService from 'services/code'
import RepositoryResourceModalBody from '../RepositoryResourceModalBody'
import RepositoryData from './repositoryMockData.json'

const props = {
  searchTerm: '',
  sortMethod: SortMethod.Newest,
  onSelectChange: jest.fn(),
  selectedData: [],
  resourceScope: {
    accountIdentifier: ''
  }
}

jest.mock('services/code', () => ({
  useListRepos: jest.fn().mockImplementation(() => {
    return {
      data: RepositoryData,
      loading: false
    }
  })
}))

describe('Resource Modal Body test', () => {
  test('test initial render of modal body ', async () => {
    render(
      <TestWrapper>
        <RepositoryResourceModalBody {...props}></RepositoryResourceModalBody>
      </TestWrapper>
    )
    expect(await screen.findByText('testing-gitness')).toBeInTheDocument()
  })

  test('Show no data in case there is no Repository', async () => {
    jest.spyOn(codeService, 'useListRepos').mockImplementation((): any => {
      return { data: [], loading: false }
    })
    render(
      <TestWrapper>
        <RepositoryResourceModalBody {...props}></RepositoryResourceModalBody>
      </TestWrapper>
    )

    expect(screen.getByText('noData')).toBeDefined()
  })

  test('Displays loading spinner while fetching repositories', async () => {
    jest.spyOn(codeService, 'useListRepos').mockImplementation((): any => {
      return { data: null, loading: true }
    })
    const { getByTestId } = render(
      <TestWrapper>
        <RepositoryResourceModalBody {...props}></RepositoryResourceModalBody>
      </TestWrapper>
    )

    expect(getByTestId('page-spinner')).toBeDefined()
  })
})
