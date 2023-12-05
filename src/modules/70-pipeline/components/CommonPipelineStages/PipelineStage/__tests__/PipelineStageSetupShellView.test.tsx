/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import routes from '@common/RouteDefinitions'
import { StageType } from '@pipeline/utils/stageHelpers'
import { accountPathProps, pipelineModuleParams, projectPathProps } from '@common/utils/routeUtils'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { PipelineStage } from '../PipelineStage'
import {
  errorContextProvider,
  getDummyPipelineContextValue,
  getMockFor_getsMergedTemplateInputYamlPromise,
  getMockFor_useGetInputSetsListForPipeline,
  getMockFor_useGetPipeline,
  getModuleParams
} from './PipelineStageHelper'

const getPipelineSummryMock = jest.fn(() => Promise.resolve({ status: 'SUCCESS' }))

jest.mock('services/pipeline-ng', () => ({
  useGetPipeline: jest.fn(() => getMockFor_useGetPipeline()),
  useCreateVariablesV2: jest.fn(() => ({
    mutate: jest.fn(() => Promise.resolve({ data: { yaml: '' } })),
    loading: false,
    cancel: jest.fn()
  })),
  useGetSchemaYaml: jest.fn().mockImplementation(() => ({ data: {} })),
  useGetInputSetsListForPipeline: jest.fn(() => getMockFor_useGetInputSetsListForPipeline()),
  useGetTemplateFromPipeline: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetMergeInputSetFromPipelineTemplateWithListInput: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  getPipelineSummaryPromise: jest.fn().mockImplementation(() => getPipelineSummryMock())
}))
jest.mock('services/template-ng', () => ({
  getsMergedTemplateInputYamlPromise: jest.fn(() => getMockFor_getsMergedTemplateInputYamlPromise())
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))
jest.mock('@harness/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  debounce: jest.fn(fn => {
    fn.cancel = jest.fn()
    return fn
  }),
  noop: jest.fn()
}))

jest.mock('resize-observer-polyfill', () => {
  class ResizeObserver {
    static default = ResizeObserver
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    observe() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    unobserve() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    disconnect() {
      // do nothing
    }
  }
  return ResizeObserver
})

const renderOutputSectionComponent = (pipelineContextValue: PipelineContextInterface): RenderResult =>
  render(
    <TestWrapper path={TEST_PATH} pathParams={getModuleParams('chainedPipeline', 'cd')}>
      <PipelineContext.Provider value={pipelineContextValue}>
        <StageErrorContext.Provider value={errorContextProvider}>
          <PipelineStage
            minimal={false}
            stageProps={{}}
            name="common.pipeline"
            type={StageType.PIPELINE}
            icon={'chained-pipeline'}
            hoverIcon="chained-pipeline-hover"
            title="common.pipeline"
            description="pipeline.pipelineSteps.chainedPipelineDescription"
            isDisabled={false}
            isApproval={false}
          />
        </StageErrorContext.Provider>
      </PipelineContext.Provider>
    </TestWrapper>
  )

const TEST_PATH = routes.toPipelines({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })

describe('Pipeline Stage shell view tests', () => {
  test('check details for Overview Tab', async () => {
    const pipelineContextMockValue = getDummyPipelineContextValue()
    window.open = jest.fn()
    const { container } = renderOutputSectionComponent(pipelineContextMockValue)

    const overviewTab = screen.getByRole('tab', {
      name: /tick overview/i
    })
    userEvent.click(overviewTab)
    expect(await screen.findByText('stageOverview')).toBeDefined()
    userEvent.clear(screen.getByRole('textbox'))
    await userEvent.type(screen.getByRole('textbox'), 'parentStage1')

    expect(container).toMatchSnapshot('Pipeline Stage - Overview Tab')
    await waitFor(() => expect(pipelineContextMockValue.updateStage).toBeCalled())

    // Check for child pipeline link, will take us to child pipeline studio in a new tab
    const childPipelineLink = screen.getByText('common.pipeline: childPip')
    userEvent.click(childPipelineLink)
    await waitFor(() => expect(window.open).toHaveBeenCalledTimes(1))
    expect(window.open).toBeCalledWith(
      expect.stringContaining(`/account/accountId/home/orgs/default/projects/Fardeen/pipelines`),
      '_blank'
    )

    // Next button test
    userEvent.click(
      screen.getByRole('button', {
        name: /next/i
      })
    )
    await waitFor(() => expect(pipelineContextMockValue.updatePipeline).toBeCalled())

    // Back button test
    const previousButton = await screen.findByRole('button', {
      name: /previous/i
    })
    await userEvent.click(previousButton)
    expect(overviewTab.getAttribute('aria-selected')).toBe('true')

    // Outputs Tab
    const outputsTab = screen.getByRole('tab', {
      name: 'platform.connectors.ceAws.crossAccountRoleExtention.step3.p2'
    })
    userEvent.click(outputsTab)
    expect(await screen.findByText('pipeline.pipelineChaining.pipelineOutputs')).toBeDefined()
  })

  test('readonly view should work', async () => {
    const pipelineContextMockValue = getDummyPipelineContextValue()
    renderOutputSectionComponent({ ...pipelineContextMockValue, isReadonly: true })

    const overviewTab = screen.getByRole('tab', {
      name: /tick overview/i
    })
    userEvent.click(overviewTab)
    expect(await screen.findByDisplayValue('parStage1')).toHaveAttribute('disabled')
  })
})
