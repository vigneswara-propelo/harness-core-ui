/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { UseGetReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import * as pipelineNgService from 'services/pipeline-ng'
import { ExecutedBy } from '../ExecutedBy'

describe('ExecutedBy', () => {
  test('should render in loading state', () => {
    jest.spyOn(pipelineNgService, 'useGetExecutionDetailV2').mockReturnValue({
      data: null,
      loading: true,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    const { container } = render(
      <TestWrapper>
        <ExecutedBy planExecutionId={'planExecutionId'} stageNodeId={'stageNodeId'} />
      </TestWrapper>
    )
    expect(container.querySelector('[data-icon="spinner"]')).toBeInTheDocument()
  })

  test('should render in error state', () => {
    jest.spyOn(pipelineNgService, 'useGetExecutionDetailV2').mockReturnValue({
      data: null,
      loading: false,
      refetch: jest.fn() as unknown,
      error: { data: { message: 'Error fetching API' } }
    } as UseGetReturn<any, any, any, any>)

    const { getByText } = render(
      <TestWrapper>
        <ExecutedBy planExecutionId={'planExecutionId'} stageNodeId={'stageNodeId'} />
      </TestWrapper>
    )
    expect(getByText('Error fetching API')).toBeInTheDocument()
  })

  test('should render with data', () => {
    jest.spyOn(pipelineNgService, 'useGetExecutionDetailV2').mockReturnValue({
      data: {
        data: {
          pipelineExecutionSummary: {
            executionTriggerInfo: {
              triggerType: 'Manual',
              triggeredBy: { uuid: 'systemUser', extraInfo: { email: 'user@harness.io' } }
            }
          }
        }
      },
      loading: false,
      refetch: jest.fn() as unknown,
      error: null
    } as UseGetReturn<any, any, any, any>)

    const { getByText } = render(
      <TestWrapper>
        <ExecutedBy planExecutionId={'planExecutionId'} stageNodeId={'stageNodeId'} />
      </TestWrapper>
    )
    expect(getByText('user@harness.io')).toBeInTheDocument()
  })
})
