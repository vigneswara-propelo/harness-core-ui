/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as uuid from 'uuid'
import { fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { PipelineContextInterface } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import ExecutionGraph from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import StageBuilder from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilder'
import { pipelineContextMock } from '@pipeline/components/CommonPipelineStages/ApprovalStage/__tests__/ApprovalStageTestsHelper'
import { ExecutionWrapperConfig, StageElementConfig, StageElementWrapperConfig } from 'services/pipeline-ng'
import { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import pipelineJson from './nestedStepStepGroupStageComboPipeline.json'
import { getPipelineGraphData } from '../PipelineGraph/PipelineGraphUtils'
import { stageTransformedData, stepsTransformedData } from './mocks'
import { PipelineGraphState } from '../types'
import { NodeMetadataProvider } from '../Nodes/NodeMetadataContext'

const getContextValue = (): PipelineContextInterface => {
  return {
    ...pipelineContextMock,
    state: {
      ...pipelineContextMock.state,
      pipeline: pipelineJson,
      selectionState: {
        selectedSectionId: 'EXECUTION',
        selectedStageId: 'stage1',
        selectedStepId: undefined
      }
    },
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineContextMock.state.pipeline.stages[0], parent: undefined }
    }),
    getStagePathFromPipeline: jest.fn()
  } as any
}

window.ResizeObserver =
  window.ResizeObserver ||
  jest.fn().mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn()
  }))

const getSampleData = (
  data: StageElementWrapperConfig[] | ExecutionWrapperConfig[],
  parentPath: string,
  relativeBasePath?: string
): PipelineGraphState[] =>
  getPipelineGraphData({
    data: data,
    templateTypes: { shellConditional: 'ShellScript' },
    templateIcons: { shellConditional: undefined },
    serviceDependencies: undefined,
    errorMap: new Map([
      ['pipeline.stages.0.stage.spec.execution.steps.2.step.spec', ['err1']],
      ['pipeline.stages.0.stage.spec.execution.steps.3.step.spec', ['err2']]
    ]),
    parentPath,
    ...(relativeBasePath && { relativeBasePath: relativeBasePath })
  })

describe('StageBuilder PipelineStudio graph ', () => {
  test('Stage Graph stageNode basic assertions', () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <StageBuilder />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const divsWithDataGraphNode = container.querySelectorAll('div[data-graph-node]')
    expect(divsWithDataGraphNode).toHaveLength(2) // parallel nodesare part of same data-graph-node

    expect(divsWithDataGraphNode[0].querySelector('#ref_stage1')).toBeInTheDocument()
    expect(divsWithDataGraphNode[0].querySelector('div[data-testid="create-node-stage"]')).toBeInTheDocument() // corresponding create-stage-node assertion
    // Verifying the parallel nodes are part of parent node clubbed together
    expect(divsWithDataGraphNode[1].querySelector('#ref_stage2')).toBeInTheDocument()
    expect(divsWithDataGraphNode[1].querySelector('#ref_stage3')).toBeInTheDocument()
    expect(divsWithDataGraphNode[0].querySelector('div[data-testid="create-node-stage"]')).toBeInTheDocument()
    const stageConditionalIcons = container.querySelectorAll('span[data-icon="conditional-skip-new"]')
    expect(stageConditionalIcons).toHaveLength(3)

    const stageLoopingIcons = container.querySelectorAll('span[data-icon="looping"]')
    expect(stageLoopingIcons).toHaveLength(3)

    // CreateNode - StartNode - EndNode assertion
    const createAddStageNodes = container.querySelectorAll('div[data-testid="create-node-stage"]')
    expect(createAddStageNodes).toHaveLength(3)
    expect(container.querySelector('span[icon="play"]')).toBeInTheDocument()
    expect(container.querySelector('span[icon="stop"]')).toBeInTheDocument()
  })

  test('Steps Graph basic assertions', async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <NodeMetadataProvider>
            <ExecutionGraph
              allowAddGroup={true}
              hasRollback={true}
              isReadonly={false}
              hasDependencies={false}
              originalStage={pipelineJson.stages[0] as StageElementWrapper<StageElementConfig>}
              templateTypes={{ shellConditional: 'ShellScript' }}
              templateIcons={{ shellConditional: undefined }}
              stage={pipelineJson.stages[0] as StageElementWrapper<StageElementConfig>}
              updateStage={jest.fn()}
              onAddStep={jest.fn()}
              onEditStep={jest.fn()}
              onSelectStep={jest.fn()}
            />
          </NodeMetadataProvider>
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const stepNodes = container.querySelectorAll('.default-node')
    expect(stepNodes).toHaveLength(10)
    const stepGroupNodes = container.querySelectorAll('.stepGroup')
    expect(stepGroupNodes).toHaveLength(4)

    const stageConditionalIcons = container.querySelectorAll('span[data-icon="conditional-skip-new"]')
    expect(stageConditionalIcons).toHaveLength(12)

    const stageLoopingIcons = container.querySelectorAll('span[data-icon="looping"]')
    expect(stageLoopingIcons).toHaveLength(12)

    // CreateNode - StartNode - EndNode assertion
    const createAddStepNodes = container.querySelectorAll('div[data-testid="create-node-step"]')
    expect(createAddStepNodes).toHaveLength(12)
    expect(container.querySelector('span[icon="play"]')).toBeInTheDocument()
    expect(container.querySelector('span[icon="stop"]')).toBeInTheDocument()

    const graphContainer = container.querySelector('.graphMain') as HTMLElement
    expect(graphContainer).toBeInTheDocument()
    // Check zoom in to reduce scaleFactor of graph
    const zoomInButton = container.querySelector('span[data-icon="zoom-in"]') as HTMLElement
    const zoomOutButton = container.querySelector('span[data-icon="zoom-out"]') as HTMLElement
    const scaleToFitButton = container.querySelector('span[data-icon="canvas-position"]') as HTMLElement
    const resetGraphScale = container.querySelector('span[data-icon="canvas-selector"]') as HTMLElement
    await userEvent.click(zoomInButton)
    expect(window.getComputedStyle(graphContainer!).transform).toBe('scale(1.1)')
    await userEvent.click(resetGraphScale)
    expect(window.getComputedStyle(graphContainer!).transform).toBe('scale(1)')
    await userEvent.click(zoomOutButton)
    expect(window.getComputedStyle(graphContainer!).transform).toBe('scale(0.9)')

    // PanZoom
    fireEvent.wheel(graphContainer, {
      ctrlKey: true,
      delta: 1
    })
    expect(window.getComputedStyle(graphContainer!).transform).toBe('scale(1)')
    await userEvent.click(scaleToFitButton)
    expect(window.getComputedStyle(graphContainer!).transform).not.toBe('scale(1)')
  })
})

describe('PipelineGraphUtils ', () => {
  beforeEach(() => {
    // Mocking UUID for static id in
    jest.spyOn(uuid, 'v4').mockReturnValue('MockUUID')
  })
  test('transformStageData function', () => {
    const data = getSampleData(pipelineJson.stages as StageElementWrapperConfig[], 'pipeline.stages')
    expect(data).toEqual(stageTransformedData)
  })

  test('transformStepsData function', () => {
    const data = getSampleData(
      pipelineJson.stages[0].stage?.spec?.execution?.steps as ExecutionWrapperConfig[],
      'pipeline.stages.0.stage.spec.execution.steps',
      'pipeline.stages.0.stage.spec.execution.steps'
    )
    expect(data).toEqual(stepsTransformedData)
  })
})
