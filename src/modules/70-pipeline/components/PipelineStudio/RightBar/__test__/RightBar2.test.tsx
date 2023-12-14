/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { RightBar } from '../RightBar'
import { PipelineContext } from '../../PipelineContext/PipelineContext'
import { pipelineContext } from './RightBar.test'

export const connectorMock = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'test-connector',
      identifier: 'test_connector',
      description: '',
      orgIdentifier: 'default',
      projectIdentifier: 'projectIdentifier',
      tags: {},
      type: 'Github',
      spec: {
        url: 'https://github.com/devrepo',
        validationRepo: 'devrepo',
        authentication: {
          type: 'Http',
          spec: {
            type: 'UsernameToken',
            spec: {
              username: 'username',
              usernameRef: null,
              tokenRef: 'tokenRef'
            }
          }
        },
        type: 'Repo'
      }
    }
  }
}

export const gitnessRepos = [
  {
    uid: 'nextgenui'
  },
  {
    uid: 'learning'
  }
]

jest.mock('services/cd-ng', () => ({
  getConnectorPromise: () => Promise.resolve(connectorMock),
  useGetConnector: () => ({
    loading: false,
    data: connectorMock,
    refetch: jest.fn()
  })
}))

jest.mock('services/code', () => ({
  useListRepos: jest.fn().mockImplementation(() => {
    return {
      data: gitnessRepos,
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))

jest.mock('../../RightDrawer/RightDrawer', () => ({
  RightDrawer: () => <div />
}))

describe('RightBar component other cases', () => {
  test('Clicking on Codebase Configuration with a repository connector', async () => {
    const { getByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContext}>
          <RightBar />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const codebaseConfigurationBtn = getByText('codebase')
    act(() => {
      fireEvent.click(codebaseConfigurationBtn)
    })
    await waitFor(() => expect(pipelineContext.updatePipelineView).toHaveBeenCalled())
    expect(pipelineContext.updatePipelineView).toHaveBeenCalledWith({
      drawerData: {
        type: 'AddCommand'
      },
      isDrawerOpened: false,
      isSplitViewOpen: false,
      splitViewData: {}
    })
  })
})
