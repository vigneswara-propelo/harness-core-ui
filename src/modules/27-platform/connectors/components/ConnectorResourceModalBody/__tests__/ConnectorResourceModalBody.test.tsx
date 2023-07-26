/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { SortMethod } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { connectorsData } from '@platform/connectors/pages/connectors/__tests__/mockData'
import ConnectorResourceModalBody from '../ConnectorResourceModalBody'

const props = {
  searchTerm: '',
  sortMethod: SortMethod.Newest,
  onSelectChange: jest.fn(),
  selectedData: [],
  resourceScope: {
    accountIdentifier: ''
  }
}

jest.mock('@common/hooks', () => ({
  useMutateAsGet: jest.fn().mockImplementation(() => ({ data: connectorsData, loading: false })),
  useLocalStorage: jest.fn().mockImplementation(() => [5, jest.fn()])
}))

describe('Connector Resource Modal Body test', () => {
  test('initializes ok ', async () => {
    const { container } = render(
      <TestWrapper>
        <ConnectorResourceModalBody {...props}></ConnectorResourceModalBody>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})