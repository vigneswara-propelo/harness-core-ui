/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, within, RenderResult } from '@testing-library/react'
import { SortMethod } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { useMutateAsGet } from '@common/hooks'
import InputSetResourceModal from '../InputSetResourceModal'
import inputSetListMockData from './inputSetListMockData.json'

const props = {
  searchTerm: '',
  sortMethod: SortMethod.Newest,
  onSelectChange: jest.fn(),
  selectedData: [],
  resourceScope: {
    accountIdentifier: ''
  }
}

const params = {
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier',
  pipelineIdentifier: 'pipelineIdentifier',
  module: 'cd'
}

const inputSetIdWithPipelineId = inputSetListMockData.data.content[0].inputSetIdWithPipelineId

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => ({
    data: inputSetListMockData,
    loading: false
  }))
}))

const renderComponent = (): RenderResult =>
  render(
    <TestWrapper pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
      <InputSetResourceModal {...props}></InputSetResourceModal>
    </TestWrapper>
  )

describe('InputSet Resource Modal List View', () => {
  test('render list view', async () => {
    renderComponent()

    const rows = await screen.findAllByRole('row')
    expect(rows).toHaveLength(6)
    expect(within(rows[1]).getByTestId(inputSetIdWithPipelineId)).toBeInTheDocument()
  })

  test('render empty data view', () => {
    ;(useMutateAsGet as any).mockImplementation((): any => {
      return {
        data: {},
        loading: false
      }
    })
    renderComponent()
    expect(screen.queryByTestId(inputSetIdWithPipelineId)).not.toBeInTheDocument()
  })

  test('render page spinner if loading', () => {
    ;(useMutateAsGet as any).mockImplementation((): any => {
      return {
        data: {},
        loading: true
      }
    })
    const { container } = renderComponent()
    expect(container.querySelector('.PageSpinner--spinner')).toBeDefined()
  })
})
