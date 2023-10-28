import React from 'react'
import { act, renderHook } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { PipelineInfoConfig, ResponsePMSPipelineResponseDTO } from 'services/pipeline-ng'
import { yamlStringify } from '@modules/10-common/utils/YamlHelperMethods'
import { AccountPathProps, GitQueryParams } from '@modules/10-common/interfaces/RouteInterfaces'
import { StoreType } from '@modules/10-common/constants/GitSyncTypes'
import { useGetResolvedChildPipeline } from '../useGetResolvedChildPipeline'
import {
  childPipeline,
  pipelineWithChildPipelines,
  resolvedPipelineWithChildPipelines,
  simplePipeline
} from './useGetResolvedChildPipeline.mock'

const getPipelinePromiseMock = jest
  .fn()
  .mockImplementation(
    (): Promise<ResponsePMSPipelineResponseDTO> =>
      Promise.resolve({ data: { resolvedTemplatesPipelineYaml: yamlStringify(childPipeline) } })
  )

jest.mock('services/pipeline-ng', () => ({
  getPipelinePromise: () => getPipelinePromiseMock()
}))

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const commonParams = {
  accountId: 'accountId',
  branch: 'branch',
  connectorRef: 'connectorRef',
  repoIdentifier: 'repoIdentifier',
  repoName: 'repoName',
  storeType: 'INLINE' as StoreType
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const renderHookWithinWrapper = (
  params: AccountPathProps & GitQueryParams,
  pipeline?: PipelineInfoConfig,
  resolvedPipeline?: PipelineInfoConfig
) => {
  const wrapper: React.FC = ({ children }) => {
    return <TestWrapper>{children}</TestWrapper>
  }

  return renderHook(() => useGetResolvedChildPipeline(params, pipeline, resolvedPipeline), { wrapper })
}

describe('useGetResolvedChildPipeline hook test', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should return same pipeline passed to hook if there are no child pipelines', async () => {
    const { result } = renderHookWithinWrapper({ ...commonParams }, simplePipeline.pipeline, simplePipeline.pipeline)

    await waitFor(() => {
      expect(result.current.resolvedMergedPipeline).toEqual(simplePipeline.pipeline)
    })
  })

  test('should return resolved pipeline if there are child pipelines', async () => {
    const { result, waitForNextUpdate } = renderHookWithinWrapper(
      { ...commonParams },
      pipelineWithChildPipelines.pipeline as PipelineInfoConfig,
      pipelineWithChildPipelines.pipeline as PipelineInfoConfig
    )

    act(() => {
      expect(result.current.resolvedMergedPipeline).toEqual(pipelineWithChildPipelines.pipeline)
    })

    await waitForNextUpdate()

    act(() => {
      expect(result.current.resolvedMergedPipeline).toEqual(resolvedPipelineWithChildPipelines.pipeline)
    })
  })
})
