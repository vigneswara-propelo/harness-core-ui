/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InputSetFormProps } from '@modules/70-pipeline/components/InputSetForm/types'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { withInputSetsOnCreateUpdateSuccess } from '../withInputSetsOnCreateUpdateSuccess'

const mockHistoryPush = jest.fn()
// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush
  })
}))

function TestComponent({ onCreateUpdateSuccess }: InputSetFormProps): JSX.Element {
  return (
    <button
      onClick={() => {
        onCreateUpdateSuccess()
      }}
    >
      Test Button
    </button>
  )
}

const WithInputSetsOnCreateUpdateSuccess = withInputSetsOnCreateUpdateSuccess<InputSetFormProps>(TestComponent)
describe('withInputSetsOnCreateUpdateSuccess HOC', () => {
  test('Should add onCreateUpdateSuccess to passed component', () => {
    const accountId = 'test-account'
    const orgIdentifier = 'test-org'
    const projectIdentifier = 'test-project'
    const pipelineIdentifier = 'test-pipeline'
    const branch = 'test-branch'
    const repoIdentifier = 'test-repo'
    const repoName = 'test-repo'
    const connectorRef = 'test-connector'
    const storeType = 'REMOTE'
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/home/orgs/:orgIdentifier/projects/:projectIdentifier/pipelines/:pipelineIdentifier/input-sets"
        pathParams={{
          accountId,
          orgIdentifier,
          projectIdentifier,
          pipelineIdentifier
        }}
        queryParams={{
          branch,
          repoIdentifier,
          repoName,
          connectorRef,
          storeType
        }}
      >
        <WithInputSetsOnCreateUpdateSuccess />
      </TestWrapper>
    )

    userEvent.click(getByText('Test Button'))
    expect(mockHistoryPush).toBeCalledTimes(1)
    expect(mockHistoryPush).toBeCalledWith(
      routes.toInputSetList({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        branch,
        repoIdentifier,
        repoName,
        connectorRef,
        storeType
      })
    )
  })
})
