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
import * as pm from 'services/pm'
import ExecutionPolicyEvaluationsView from '../ExecutionPolicyEvaluationsView'

jest.mock('services/pm', () => ({
  useGetEvaluationList: jest.fn(() => ({
    data: null,
    loading: false,
    refetch: jest.fn().mockReturnValue({}),
    error: null
  }))
}))

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

  test('Should render empty when iacm data status of error', () => {
    jest.spyOn(pm, 'useGetEvaluationList').mockImplementation((): any => ({
      data: [
        {
          id: 'mock_id',
          details: [
            {
              status: 'error',
              identifier: 'mock_identifier',
              name: 'mock_name',
              created: 'mock_date',
              account_id: 'mock_date',
              org_id: 'mock_date',
              project_id: 'mock_date',
              details: [
                {
                  status: 'error',
                  deny_messages: ['mock_deny_message'],
                  account_id: 'mock_account_id',
                  org_id: 'mock_org_id',
                  project_id: 'mock_project_id',
                  created: 'mock_date',
                  updated: 'mock_date',
                  policy: {
                    identifier: 'mock_policy_id',
                    name: 'mock_policy_name'
                  }
                }
              ]
            }
          ]
        }
      ],
      loading: false,
      error: null
    }))
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
      <TestWrapper defaultFeatureFlagValues={{ IACM_ENABLED: true }}>
        <ExecutionPolicyEvaluationsView />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Should render empty when iacm data status of warning', () => {
    jest.spyOn(pm, 'useGetEvaluationList').mockImplementation((): any => ({
      data: [
        {
          id: 'mock_id',
          details: [
            {
              status: 'warning',
              details: [
                {
                  policy: {}
                }
              ]
            }
          ]
        }
      ],
      loading: false,
      error: null
    }))
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
      <TestWrapper defaultFeatureFlagValues={{ IACM_ENABLED: true }}>
        <ExecutionPolicyEvaluationsView />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
