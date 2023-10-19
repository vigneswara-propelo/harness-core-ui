/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { RenderResult, render } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import { mockSwimLane } from './mocks'
import { PostProdMessage } from '../PostProdConfirmationMessage'

const getModuleParams = (module = 'cd') => ({
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier',
  module,
  pipelineIdentifier: 'pipelineIdentifier'
})

const TEST_PATH = routes.toDeployments({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })

const renderConfirmationMessage = (): RenderResult =>
  render(
    <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
      <PostProdMessage checkData={mockSwimLane} pipelineId="testid" />
    </TestWrapper>
  )

describe('PostProdRollback Message', () => {
  test('should render ', async () => {
    const { container, findByText } = renderConfirmationMessage()
    const envName = await findByText('Env Name')
    expect(envName).toBeInTheDocument()
    expect(container).toBeDefined()
  })
  test('should render nav 2.0 version', async () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CDS_NAV_2_0: true
    })
    const { findByText } = renderConfirmationMessage()
    const envName = await findByText('Env Name')
    expect(envName).toBeInTheDocument()
  })
  test('should render message', async () => {
    const { findByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={{ ...getModuleParams(), pipelineIdentifier: '' }}>
        <PostProdMessage checkData={{ ...mockSwimLane, swimLaneInfo: {} }} pipelineId="" />
      </TestWrapper>
    )
    const message = await findByText('testmessage')
    expect(message).toBeInTheDocument()
  })
})
