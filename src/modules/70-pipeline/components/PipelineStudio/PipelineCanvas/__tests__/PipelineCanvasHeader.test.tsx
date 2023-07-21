/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import type { UseReconcileReturnType } from '@pipeline/hooks/useReconcile'
import { PipelineCanvasHeader } from '../PipelineCanvasHeader'
import { PipelineContext } from '../../PipelineContext/PipelineContext'
import { getDummyPipelineCanvasContextValue } from './PipelineCanvasTestHelper'

jest.mock('services/pipeline-rq', () => ({
  __esModule: true,
  ...jest.requireActual('services/pipeline-rq')
}))

const testWrapperProps: TestWrapperProps = {
  path: routes.toPipelineStudio({
    pipelineIdentifier: ':pipelineIdentifier',
    orgIdentifier: ':orgIdentifier',
    accountId: ':accountId',
    projectIdentifier: ':projectIdentifier'
  }),
  pathParams: {
    pipelineIdentifier: 'TEST_PIPELINE',
    orgIdentifier: 'TEST_ORG',
    accountId: 'TEST_ACCOUNT',
    projectIdentifier: 'TEST_PROJECT'
  }
}

describe('PipelineCanvasHeader', () => {
  test('renders pipeline out of sync error strip - updatedTemplateInfo message', async () => {
    const contextValue = getDummyPipelineCanvasContextValue(
      { isLoading: false },
      {
        reconcile: {
          outOfSync: true,
          isFetchingReconcileData: false,
          reconcileData: { data: { validYaml: false, errorNodeSummary: {} } }
        } as UseReconcileReturnType
      }
    )

    render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvasHeader
            disableVisualView={false}
            isGitSyncEnabled={false}
            isPipelineRemote={true}
            onGitBranchChange={jest.fn()}
            openRunPipelineModal={jest.fn()}
            setModalMode={jest.fn()}
            setYamlError={jest.fn()}
            showModal={jest.fn()}
            toPipelineStudio={jest.fn()}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(await screen.findByText('pipeline.outOfSyncErrorStrip.updatedTemplateInfo')).toBeInTheDocument()
  })

  test('renders pipeline out of sync error strip - unsyncedTemplateInfo message', async () => {
    const contextValue = getDummyPipelineCanvasContextValue(
      { isLoading: false },
      {
        reconcile: {
          outOfSync: true,
          isFetchingReconcileData: false,
          reconcileData: { data: { validYaml: false, errorNodeSummary: { childrenErrorNodes: [{ nodeInfo: {} }] } } }
        } as UseReconcileReturnType
      }
    )

    render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvasHeader
            disableVisualView={false}
            isGitSyncEnabled={false}
            isPipelineRemote={true}
            onGitBranchChange={jest.fn()}
            openRunPipelineModal={jest.fn()}
            setModalMode={jest.fn()}
            setYamlError={jest.fn()}
            showModal={jest.fn()}
            toPipelineStudio={jest.fn()}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(await screen.findByText('pipeline.outOfSyncErrorStrip.unsyncedTemplateInfo')).toBeInTheDocument()
  })

  test('shoud call reconcilePipeline', async () => {
    const reconcilePipelineFn = jest.fn()
    const contextValue = getDummyPipelineCanvasContextValue(
      { isLoading: false },
      {
        reconcile: {
          outOfSync: false,
          isFetchingReconcileData: false,
          reconcileData: { data: { validYaml: false, errorNodeSummary: { childrenErrorNodes: [{ nodeInfo: {} }] } } },
          reconcilePipeline: reconcilePipelineFn
        } as unknown as UseReconcileReturnType
      }
    )

    render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvasHeader
            disableVisualView={false}
            isGitSyncEnabled={false}
            isPipelineRemote={true}
            onGitBranchChange={jest.fn()}
            openRunPipelineModal={jest.fn()}
            setModalMode={jest.fn()}
            setYamlError={jest.fn()}
            showModal={jest.fn()}
            toPipelineStudio={jest.fn()}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    await userEvent.click(screen.getByLabelText('pipeline menu actions'))
    await userEvent.click(screen.getByText('pipeline.outOfSyncErrorStrip.reconcile'))

    expect(reconcilePipelineFn).toBeCalled()
  })
})
