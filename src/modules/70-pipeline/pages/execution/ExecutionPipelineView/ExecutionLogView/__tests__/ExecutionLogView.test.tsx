/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper, CurrentLocation } from '@common/utils/testUtils'
import { getPipelineStagesMap } from '@pipeline/utils/executionUtils'
import ExecutionContext from '@pipeline/context/ExecutionContext'
import type { ExecutionContextParams } from '@pipeline/context/ExecutionContext'
import mock from '@pipeline/pages/execution/ExecutionPipelineView/ExecutionGraphView/__tests__/mock.json'
import ExecutionLogView from '../ExecutionLogView'

jest.mock('@pipeline/components/PipelineSteps/PipelineStepFactory', () => ({
  getStepIcon: jest.fn(),
  registerStep: jest.fn()
}))

const aidaMock = {
  loading: false,
  data: {
    data: {
      valueType: 'Boolean',
      value: 'true'
    }
  }
}

jest.mock('services/cd-ng', () => ({
  useGetSettingValue: jest.fn().mockImplementation(() => aidaMock)
}))

const contextValue: ExecutionContextParams = {
  pipelineExecutionDetail: mock.data as any,
  allNodeMap: mock.data.executionGraph.nodeMap as any,
  pipelineStagesMap: getPipelineStagesMap(
    mock.data.pipelineExecutionSummary.layoutNodeMap as any,
    mock.data.pipelineExecutionSummary.startingNodeId
  ),
  childPipelineStagesMap: new Map([]),
  rollbackPipelineStagesMap: new Map([]),
  allStagesMap: getPipelineStagesMap(
    mock.data.pipelineExecutionSummary.layoutNodeMap as any,
    mock.data.pipelineExecutionSummary.startingNodeId
  ),
  selectedStageId: 'google_1',
  selectedStageExecutionId: '',
  selectedCollapsedNodeId: '',
  selectedStepId: '',
  queryParams: {},
  loading: false,
  isDataLoadedForSelectedStage: true,
  logsToken: 'token',
  setLogsToken: jest.fn(),
  addNewNodeToMap: jest.fn()
}

const fetchMock = jest.spyOn(global, 'fetch' as any)
fetchMock.mockResolvedValue({
  text: () => new Promise(resolve => resolve('')),
  json: () => new Promise(resolve => resolve({})),
  headers: { get: () => 'application/json' }
})

describe('<ExecutionLogView /> tests', () => {
  test('snapshot test', async () => {
    const { findByText } = render(
      <TestWrapper>
        <ExecutionContext.Provider value={contextValue}>
          <ExecutionLogView />
          <CurrentLocation />
        </ExecutionContext.Provider>
      </TestWrapper>
    )

    await waitFor(() => findByText('RolloutSecond'))

    expect(await findByText('Google1')).toBeInTheDocument()
    expect(await findByText('Google2')).toBeInTheDocument()
  })

  test('stage selection works', async () => {
    const { findByText, getByTestId } = render(
      <TestWrapper>
        <ExecutionContext.Provider value={contextValue}>
          <ExecutionLogView />
          <CurrentLocation />
        </ExecutionContext.Provider>
      </TestWrapper>
    )

    const stageBtn = await findByText('Google1')

    fireEvent.click(stageBtn!)

    const stage = await findByText('Google2')

    fireEvent.click(stage)

    expect(getByTestId('location').innerHTML).toContain('stage=google_2')
  })
})
