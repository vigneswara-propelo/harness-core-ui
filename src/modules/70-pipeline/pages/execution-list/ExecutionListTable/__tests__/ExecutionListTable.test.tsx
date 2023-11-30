/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import { MemoisedExecutionListTable } from '../ExecutionListTable'
import { pipelineExecutionSummaryMock } from './mock'

describe('Execution list table - ', () => {
  test('Should render status cell with failed status and failure stage info', async () => {
    const { getByText } = render(
      <TestWrapper>
        <MemoisedExecutionListTable
          onViewCompiledYaml={jest.fn()}
          executionList={pipelineExecutionSummaryMock as any}
        />
      </TestWrapper>
    )

    expect(getByText('pipeline.executionStatus.Failed')).toBeInTheDocument()

    //should show failed stage
    expect(getByText('stg1')).toBeInTheDocument()
  })

  test('Should render failed status but no failed stage info', async () => {
    const { getByText } = render(
      <TestWrapper>
        <MemoisedExecutionListTable
          onViewCompiledYaml={jest.fn()}
          executionList={{
            ...pipelineExecutionSummaryMock,
            content: [
              {
                pipelineIdentifier: 'activeInstance',
                orgIdentifier: 'default',
                projectIdentifier: 'CD_Dashboards',
                planExecutionId: 'ybs0NP0LSyy0jqaudg6Xww',
                name: 'activeInstance',
                yamlVersion: '0',
                status: 'Failed'
              }
            ]
          }}
        />
      </TestWrapper>
    )
    expect(getByText('pipeline.executionStatus.Failed')).toBeInTheDocument()

    expect(screen.queryByText('Stage:')).not.toBeInTheDocument()
  })
})
