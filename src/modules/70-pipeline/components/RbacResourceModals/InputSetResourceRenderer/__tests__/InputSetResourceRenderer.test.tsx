/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, within, RenderResult } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { ResourceType } from '@modules/20-rbac/interfaces/ResourceType'
import inputSetListMockData from '@pipeline/components/RbacResourceModals/InputSetResourceModal/__tests__/inputSetListMockData.json'
import { AppStoreContextProps } from 'framework/AppStore/AppStoreContext'
import { useMutateAsGet } from '@common/hooks'
import InputSetResourceRenderer from '../InputSetResourceRenderer'

const props = {
  resourceType: ResourceType.INPUT_SET,
  identifiers: [],
  onResourceSelectionChange: jest.fn(),
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
    data: {},
    loading: false
  }))
}))

const renderComponent = (appStoreValues?: Partial<AppStoreContextProps>): RenderResult =>
  render(
    <TestWrapper pathParams={params} defaultAppStoreValues={appStoreValues ?? defaultAppStoreValues}>
      <InputSetResourceRenderer {...props}></InputSetResourceRenderer>
    </TestWrapper>
  )

describe('InputSet Resource Renderer', () => {
  test('render empty data view', async () => {
    renderComponent()
    expect(screen.queryByTestId(inputSetIdWithPipelineId)).not.toBeInTheDocument()
  })

  test('render list view', async () => {
    ;(useMutateAsGet as any).mockImplementation((): any => {
      return {
        data: inputSetListMockData,
        loading: false
      }
    })
    renderComponent()

    const rows = await screen.findAllByRole('row')
    expect(rows).toHaveLength(5)
    expect(within(rows[0]).getByTestId(inputSetIdWithPipelineId)).toBeInTheDocument()
  })

  test('render page spinner if loading', () => {
    ;(useMutateAsGet as any).mockImplementation((): any => {
      return {
        data: {},
        loading: true
      }
    })
    const { container } = renderComponent({
      isGitSyncEnabled: true,
      gitSyncEnabledOnlyForFF: false
    })
    expect(container.querySelector('.PageSpinner--spinner')).toBeDefined()
  })
})
