import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { StoreMetadata } from '@common/constants/GitSyncTypes'
import * as pipelineRQService from 'services/pipeline-rq'
import { useReconcile } from '../useReconcile'

const addSpyResponse = (validYaml: boolean): void => {
  jest.spyOn(pipelineRQService, 'useValidateTemplateInputsQuery').mockImplementation(() => {
    return {
      data: {
        status: 'SUCCESS',
        data: {
          type: 'TemplateInputsErrorMetadataV2',
          validYaml,
          errorNodeSummary: {
            nodeInfo: {
              identifier: 'pip_name',
              name: 'pip name'
            },
            childrenErrorNodes: []
          }
        },
        correlationId: 'correlationId'
      },
      error: null,
      isFetching: false,
      refetch: jest.fn()
    } as any
  })
}

const storeMetadata = {
  connectorRef: 'connector',
  storeType: 'REMOTE',
  repoName: 'Pipelines',
  branch: 'test',
  filePath: 'pipeline.yaml'
} as StoreMetadata

const renderHookWithinWrapper = () => {
  const wrapper: React.FC = ({ children }) => {
    return <TestWrapper>{children}</TestWrapper>
  }
  return renderHook(useReconcile, { initialProps: { storeMetadata }, wrapper })
}

describe('useReconcile hook tests', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('shoud work as expected when pipeline and template are in sync', async () => {
    addSpyResponse(true)
    const { result } = renderHookWithinWrapper()

    await act(async () => {
      await result.current.reconcilePipeline()
    })

    expect(result.current.outOfSync).toBe(false)
  })

  test('shoud work as expected when pipeline and template are NOT in sync', async () => {
    addSpyResponse(false)
    const { result } = renderHookWithinWrapper()

    await act(async () => {
      await result.current.reconcilePipeline()
    })

    expect(result.current.outOfSync).toBe(true)
  })
})
