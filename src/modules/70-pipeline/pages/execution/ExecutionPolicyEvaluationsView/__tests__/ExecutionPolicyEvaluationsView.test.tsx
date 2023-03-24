/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import ExecutionPolicyEvaluationsView from '../ExecutionPolicyEvaluationsView'

describe('<ExecutionPolicyEvaluationsView /> tests', () => {
  test('Should render empty when governanceMetadata is null', () => {
    mockImport('@pipeline/context/ExecutionContext', {
      useExecutionContext: jest.fn()
    })
    mockImport('@governance/PolicyManagementEvaluationView', {
      PolicyManagementEvaluationView: () => <div /> // eslint-disable-line react/display-name
    })

    const { container } = render(
      <TestWrapper>
        <ExecutionPolicyEvaluationsView />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Should render empty when governanceMetadata is not null', () => {
    mockImport('@pipeline/context/ExecutionContext', {
      useExecutionContext: () => {
        return {
          pipelineExecutionDetail: {
            pipelineExecutionSummary: {
              governanceMetadata: {}
            }
          }
        }
      }
    })
    mockImport('@governance/PolicyManagementEvaluationView', {
      PolicyManagementEvaluationView: () => <div /> // eslint-disable-line react/display-name
    })

    const { container } = render(
      <TestWrapper>
        <ExecutionPolicyEvaluationsView />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
