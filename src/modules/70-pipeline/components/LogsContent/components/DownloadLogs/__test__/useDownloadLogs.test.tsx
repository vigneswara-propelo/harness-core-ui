/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { RenderResult, fireEvent, render, waitFor } from '@testing-library/react'
import { Button } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as logService from 'services/logs'
import { useDownloadLogs } from '../useDownloadLogs'
import { LogsScope, getLogPrefix } from '../DownloadLogsHelper'
import {
  TEST_PATH,
  failedResponse,
  moduleParams,
  logBaseKey,
  multiLogState,
  pipelinErrorResponse,
  singleLogState,
  stepId,
  successResponse
} from './DownloadLogsTestHelper'

function HookTestComponent({
  isPipeline,
  noLogBaseKey
}: {
  isPipeline?: boolean
  noLogBaseKey?: boolean
}): JSX.Element {
  const { downloadLogsAction } = useDownloadLogs()
  return (
    <Button
      data-testid="downloadLogsBtn"
      onClick={async () => {
        await downloadLogsAction?.(
          isPipeline
            ? {
                logsScope: LogsScope.Pipeline,
                runSequence: 1,
                uniqueKey: 'testPipelineId'
              }
            : {
                logsScope: LogsScope.Step,
                state: singleLogState,
                uniqueKey: stepId,
                logBaseKey: noLogBaseKey ? undefined : logBaseKey
              }
        )
      }}
    />
  )
}

jest.mock('services/logs', () => ({
  downloadLogsPromise: jest.fn().mockImplementation(() => {
    return Promise.resolve(successResponse)
  }),
  getTokenPromise: jest.fn().mockImplementation(() => {
    return Promise.resolve('test-token')
  })
}))

const assertToaster = async (toastMsg: string, getByText: RenderResult['getByText']): Promise<void> => {
  expect(document.getElementsByClassName('bp3-toast-message')).toBeDefined()
  await waitFor(() => expect(getByText(toastMsg)).toBeTruthy())
}

describe('useDownloadLogs tests', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  test('shoud work for step level downloadLogs and display success toast', async () => {
    const { container, getByTestId, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={moduleParams}>
        <HookTestComponent />
      </TestWrapper>
    )

    fireEvent.click(getByTestId('downloadLogsBtn'))
    expect(container.querySelector('.bp3-spinner')).toBeInTheDocument()

    // success toast
    await assertToaster('pipeline.downloadLogs.downloadSuccessful', getByText)
  })

  test('shoud work for step level downloadLogs when logBaseKey is not present', async () => {
    const { container, getByTestId, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={moduleParams}>
        <HookTestComponent noLogBaseKey={true} />
      </TestWrapper>
    )

    fireEvent.click(getByTestId('downloadLogsBtn'))
    expect(container.querySelector('.bp3-spinner')).toBeInTheDocument()

    // success toast
    await assertToaster('pipeline.downloadLogs.downloadSuccessful', getByText)
  })

  test('shoud work for step level downloadLogs and display error toast', async () => {
    jest.spyOn(logService, 'downloadLogsPromise').mockImplementation(() => {
      return Promise.resolve(failedResponse)
    })
    const { container, getByTestId, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={moduleParams}>
        <HookTestComponent />
      </TestWrapper>
    )

    fireEvent.click(getByTestId('downloadLogsBtn'))
    expect(container.querySelector('.bp3-spinner')).toBeInTheDocument()

    // error toast
    await assertToaster('API request failed with an error : cannot list files for prefix', getByText)
  })

  test('shoud work for pipeline level downloadLogs and display success toast', async () => {
    jest.spyOn(logService, 'downloadLogsPromise').mockImplementation(() => {
      return Promise.resolve(successResponse) as any
    })
    const { container, getByTestId, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={moduleParams}>
        <HookTestComponent isPipeline={true} />
      </TestWrapper>
    )

    fireEvent.click(getByTestId('downloadLogsBtn'))
    expect(container.querySelector('.bp3-spinner')).toBeInTheDocument()

    // success toast
    await assertToaster('pipeline.downloadLogs.downloadSuccessful', getByText)
  })

  test('shoud work for pipeline level downloadLogs and display error toast', async () => {
    jest.spyOn(logService, 'downloadLogsPromise').mockImplementation(() => {
      return Promise.resolve(pipelinErrorResponse) as any
    })
    const { container, getByTestId, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={moduleParams}>
        <HookTestComponent isPipeline={true} />
      </TestWrapper>
    )

    fireEvent.click(getByTestId('downloadLogsBtn'))
    expect(container.querySelector('.bp3-spinner')).toBeInTheDocument()

    // error toast
    await assertToaster('pipeline.downloadLogs.downloadRequestFailed', getByText)
  })

  test('test getLogPrefix function', () => {
    const expectedResult = [
      'accountId:accountId/orgId:default/projectId:PREQA_NG_Pipelines/pipelineId:PR_Harness_Env/runSequence:17310/level0:pipeline/level1:stages/level2:parallel6lAzRN9QR-KDFWIiG_bavgparallel/level3:ngUI/level4:spec/level5:execution/level6:steps/level7:rolloutDeployment-commandUnit:Fetch Files',
      'accountId:accountId/orgId:default/projectId:PREQA_NG_Pipelines/pipelineId:PR_Harness_Env/runSequence:17310/level0:pipeline/level1:stages/level2:parallel6lAzRN9QR-KDFWIiG_bavgparallel/level3:ngUI/level4:spec/level5:execution/level6:steps/level7:rolloutDeployment'
    ] as string[]

    const result = [singleLogState, multiLogState].map(state => getLogPrefix(state))
    expect(result).toEqual(expectedResult)
  })
})
