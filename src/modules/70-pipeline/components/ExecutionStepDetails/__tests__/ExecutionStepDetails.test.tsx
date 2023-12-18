/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, findAllByText as findAllByTextGlobal, queryByAttribute } from '@testing-library/react'

import { TestWrapper, CurrentLocation } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import ExecutionContext, { ExecutionContextParams } from '@pipeline/context/ExecutionContext'
import { accountPathProps, executionPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import { ExecutionNode, useGetExecutionNode } from 'services/pipeline-ng'
import ExecutionStepDetails from '../ExecutionStepDetails'
import data from './data.json'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('services/pipeline-ng', () => ({
  useGetApprovalInstance: jest.fn(() => ({ data: {}, loading: false })),
  useGetHarnessApprovalInstanceAuthorization: jest.fn(() => ({ data: {}, loading: false })),
  useAddHarnessApprovalActivity: jest.fn(() => ({ mutate: jest.fn() })),
  useGetExecutionNode: jest.fn(() => ({ data: {}, loading: false }))
}))
jest.mock('@common/components/Duration/Duration', () => ({
  Duration() {
    return <div>MOCK DURATION</div>
  }
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

const TEST_PATH = routes.toExecutionPipelineView({
  ...accountPathProps,
  ...executionPathProps,
  ...pipelineModuleParams
})

const pathParams = {
  accountId: 'TEST_ACCOUNT_ID',
  orgIdentifier: 'TEST_ORG',
  projectIdentifier: 'TEST_PROJECT',
  pipelineIdentifier: 'TEST_PIPELINE',
  executionIdentifier: 'TEST_EXECUTION',
  module: 'cd',
  source: 'executions',
  stageId: 'selectedStageId'
}

const executionContext: ExecutionContextParams = {
  ...(data as any),
  pipelineStagesMap: new Map(),
  setLogsToken: jest.fn(),
  refetch: jest.fn(),
  addNewNodeToMap: jest.fn()
}

function TestComponent(props: {
  children?: React.ReactNode
  queryParams?: ExecutionContextParams['queryParams']
  nodesMap?: ExecutionContextParams['allNodeMap']
  selectedStep?: string
}): React.ReactElement {
  const { children, queryParams = {}, nodesMap, selectedStep = '', ...rest } = props
  const [allNodeMap, setAllNodeMap] = React.useState(nodesMap || executionContext.allNodeMap)

  function addNewNodeToMap(uuid: string, node: ExecutionNode): void {
    setAllNodeMap(old => ({
      ...old,
      [uuid]: node
    }))
  }

  return (
    <TestWrapper path={TEST_PATH} pathParams={pathParams}>
      <ExecutionContext.Provider
        value={{ ...executionContext, queryParams, allNodeMap, addNewNodeToMap, selectedStepId: selectedStep }}
      >
        <ExecutionStepDetails {...rest} />
        {props.children}
      </ExecutionContext.Provider>
    </TestWrapper>
  )
}

describe('<ExecutionStepDetails /> tests', () => {
  test('renders normal step', () => {
    const { getByText } = render(<TestComponent selectedStep="normalStep" />)
    expect(getByText('MOCK DURATION')).toBeInTheDocument()
    expect(getByText('execution.stepLogs')).toBeInTheDocument()
  })

  describe('retried steps', () => {
    test('shows step selection', async () => {
      const { getByTestId } = render(
        <TestComponent selectedStep="retriedStep">
          <CurrentLocation />
        </TestComponent>
      )

      const loc1 = getByTestId('location')

      expect(loc1.innerHTML).toEqual(
        '/account/TEST_ACCOUNT_ID/cd/orgs/TEST_ORG/projects/TEST_PROJECT/pipelines/TEST_PIPELINE/executions/TEST_EXECUTION/pipeline'
      )

      const retryLogs1 = getByTestId('retry-logs')

      fireEvent.click(retryLogs1)

      const retries = await findAllByTextGlobal(document.body, 'pipeline.execution.retryStepCount', {
        selector: '.bp3-menu-item > div'
      })

      fireEvent.click(retries[0])

      const loc2 = getByTestId('location')
      expect(loc2.innerHTML).toEqual(
        '/account/TEST_ACCOUNT_ID/cd/orgs/TEST_ORG/projects/TEST_PROJECT/pipelines/TEST_PIPELINE/executions/TEST_EXECUTION/pipeline?retryStep=retryId_1'
      )

      const retryLogs2 = getByTestId('retry-logs')

      fireEvent.click(retryLogs2)

      const current = await findAllByTextGlobal(document.body, 'pipeline.execution.retryStepCount', {
        selector: '.bp3-menu-item > div'
      })

      fireEvent.click(current[current.length - 1])

      const loc3 = getByTestId('location')

      expect(loc3.innerHTML).toEqual(
        '/account/TEST_ACCOUNT_ID/cd/orgs/TEST_ORG/projects/TEST_PROJECT/pipelines/TEST_PIPELINE/executions/TEST_EXECUTION/pipeline'
      )
    })

    // define data outside to avoid infinite loop in react useEffect. It will keep the same reference.
    const responseData = {
      data: {
        uuid: 'retryId_1',
        name: 'Retried Step 1'
      }
    }

    test('fetches data for retry step, if not present', async () => {
      ;(useGetExecutionNode as jest.Mock).mockImplementation(() => ({
        data: responseData,
        loading: false
      }))
      const { container } = render(
        <TestComponent selectedStep="retriedStep" queryParams={{ retryStep: 'retryId_1' }} />
      )
      const step = queryByAttribute('data-name', container, 'Retried Step 1')
      expect(step).toBeInTheDocument()
    })

    test('does not fetches data for retry step, if already present', async () => {
      ;(useGetExecutionNode as jest.Mock).mockImplementation(() => ({
        data: null,
        loading: false
      }))
      const { container } = render(
        <TestComponent
          selectedStep="retriedStep"
          queryParams={{ retryStep: 'retryId_1' }}
          nodesMap={{
            ...executionContext.allNodeMap,
            retryId_1: {
              uuid: 'retryId_1',
              name: 'Already_Present_Data'
            }
          }}
        />
      )
      const step = queryByAttribute('data-name', container, 'Already_Present_Data')
      expect(step).toBeInTheDocument()
    })

    test('shows loader while loading', () => {
      ;(useGetExecutionNode as jest.Mock).mockImplementation(() => ({
        data: null,
        loading: true
      }))
      const { container } = render(<TestComponent selectedStep="retriedStep" />)
      expect(container).toMatchSnapshot()
    })
  })
})
