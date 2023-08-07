import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { ChildPipelineMetadataType } from '@pipeline/components/PipelineInputSetForm/ChainedPipelineInputSetUtils'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import * as PipelineContext from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useGetChildPipelineMetadata } from '../useGetChildPipelineMetadata'

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper
    path={routes.toPipelineStudio({
      ...projectPathProps,
      ...pipelinePathProps,
      ...modulePathProps
    })}
    pathParams={{
      accountId: 'testAccount',
      orgIdentifier: 'testOrg',
      projectIdentifier: 'testProject',
      pipelineIdentifier: 'testParentPip',
      module: 'cd'
    }}
  >
    {children}
  </TestWrapper>
)

describe('useGetChildPipelineMetadata test', () => {
  test('should work as expected when child pipeline metadata is not available', async () => {
    const { result } = renderHook(() => useGetChildPipelineMetadata({} as ChildPipelineMetadataType), {
      wrapper
    })
    expect(result.current).toStrictEqual({
      accountId: 'testAccount',
      orgIdentifier: 'testOrg',
      projectIdentifier: 'testProject',
      pipelineIdentifier: 'testParentPip'
    })
  })
  test('should work as expected when child pipeline metadata is provided', async () => {
    const { result } = renderHook(
      () =>
        useGetChildPipelineMetadata({
          orgIdentifier: 'testChildOrg',
          projectIdentifier: 'testChildProject',
          pipelineIdentifier: 'testChildPip'
        } as ChildPipelineMetadataType),
      {
        wrapper
      }
    )
    expect(result.current).toStrictEqual({
      accountId: 'testAccount',
      orgIdentifier: 'testChildOrg',
      projectIdentifier: 'testChildProject',
      pipelineIdentifier: 'testChildPip'
    })
  })
  test('should work as expected when child pipeline metadata and pipeline context are provided', async () => {
    jest.spyOn(PipelineContext, 'usePipelineContext').mockReturnValue({
      state: {
        selectionState: { selectedStageId: '' }
      },
      getStageFromPipeline: jest.fn(() => {
        return {
          stage: { stage: { spec: { org: 'selectedStageChildOrg', pipeline: 'selectedStageChildPip' } } },
          parent: undefined
        }
      })
    } as any)
    const { result } = renderHook(
      () =>
        useGetChildPipelineMetadata({
          projectIdentifier: 'testChildProject',
          pipelineIdentifier: 'testChildPip'
        } as ChildPipelineMetadataType),
      {
        wrapper
      }
    )
    expect(result.current).toStrictEqual({
      accountId: 'testAccount',
      orgIdentifier: 'testOrg',
      projectIdentifier: 'testChildProject',
      pipelineIdentifier: 'testChildPip'
    })
  })
  test('should work as expected when pipeline context is available but no child pipeline metadata is provided', async () => {
    const { result } = renderHook(() => useGetChildPipelineMetadata(), {
      wrapper
    })
    expect(result.current).toStrictEqual({
      accountId: 'testAccount',
      orgIdentifier: 'selectedStageChildOrg',
      projectIdentifier: 'testProject',
      pipelineIdentifier: 'selectedStageChildPip'
    })
  })
})
