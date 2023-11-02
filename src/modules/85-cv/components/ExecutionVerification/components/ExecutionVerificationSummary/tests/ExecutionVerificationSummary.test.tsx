/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { GetDataError } from 'restful-react'
import { waitFor, fireEvent } from '@testing-library/dom'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event/'
import { TestWrapper } from '@common/utils/testUtils'
import * as usePermission from '@rbac/hooks/usePermission'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { RiskValues, getRiskColorValue } from '@cv/utils/CommonUtils'
import * as cvService from 'services/cv'
import { ExecutionVerificationSummary } from '../ExecutionVerificationSummary'
import {
  SampleResponse,
  SampleResponseAbortedSuccessPipeline,
  SampleResponsePassedPipeline,
  SampleResponseRunningPipeline
} from './ExecutionVerificationSummary.mock'

const showError = jest.fn()

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: jest.fn(() => ({ showError }))
}))

describe('Unit tests for VerifyExection', () => {
  beforeEach(() => {
    Element.prototype.getBoundingClientRect = jest.fn(() => {
      return {
        width: 500,
        height: 1000,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      } as any
    })
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })
  test('Ensure content is rendered correctly based on api response', async () => {
    const refetchFn = jest.fn()

    const { container, getByText } = render(
      <TestWrapper>
        <ExecutionVerificationSummary
          step={{}}
          refetchOverview={refetchFn}
          overviewData={SampleResponse}
          overviewError={null}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('pipeline.verification.metricsInViolation')).not.toBeNull())

    const nodeHealths = container.querySelectorAll('[class~="nodeHealth"]')
    expect(nodeHealths.length).toBe(2)
    let redCount = 0,
      greenCount = 0,
      greyCount = 0,
      yellowCount = 0

    nodeHealths.forEach(item => {
      const colorVal = item.getAttribute('data-node-health-color')
      if (colorVal?.includes(getRiskColorValue(RiskValues.UNHEALTHY))) {
        redCount++
      } else if (colorVal?.includes(getRiskColorValue(RiskValues.HEALTHY))) {
        greenCount++
      } else if (colorVal?.includes(getRiskColorValue(RiskValues.NO_ANALYSIS))) {
        greyCount++
      } else if (colorVal?.includes(getRiskColorValue(RiskValues.OBSERVE))) {
        yellowCount++
      }
    })

    expect(greyCount).toBe(1)
    expect(redCount).toBe(0)
    expect(greenCount).toBe(1)
    expect(yellowCount).toBe(0)
    expect(container).toMatchSnapshot()
  })

  test('Ensure that loading indicator is displayed when api is loading', async () => {
    const refetchFn = jest.fn()

    const { container } = render(
      <TestWrapper>
        <ExecutionVerificationSummary
          step={{ progressData: { activityId: '1234_id' as any } }}
          refetchOverview={refetchFn}
          overviewData={null}
          overviewError={null}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="loading"]')).not.toBeNull())
  })

  test('Ensure that error is displayed when api errors out', async () => {
    const refetchFn = jest.fn()

    const { container, getByText } = render(
      <TestWrapper>
        <ExecutionVerificationSummary
          step={{ progressData: { activityId: 'asadasd_' as any } }}
          refetchOverview={refetchFn}
          overviewData={null}
          overviewError={{ data: { message: 'mockError' } } as GetDataError<unknown>}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('mockError')).not.toBeNull())
    fireEvent.click(container.querySelector('button')!)
    await waitFor(() => expect(refetchFn).toHaveBeenCalledTimes(2))
  })

  test('Ensure that when activity id is not there empty statee is rendered', async () => {
    const refetchFn = jest.fn()

    const { container } = render(
      <TestWrapper>
        <ExecutionVerificationSummary step={{}} refetchOverview={refetchFn} overviewData={null} overviewError={null} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="bp3-progress-meter"]')))
  })

  test('Ensure that when there is a failure message in the step, it is displayed', async () => {
    const refetchFn = jest.fn()

    const { rerender, container, getByText } = render(
      <TestWrapper>
        <ExecutionVerificationSummary
          step={{ failureInfo: { message: 'mockError' } }}
          refetchOverview={refetchFn}
          overviewData={null}
          overviewError={null}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('mockError')))

    // ensure that message is not displayed
    rerender(
      <TestWrapper>
        <ExecutionVerificationSummary step={{}} refetchOverview={refetchFn} overviewData={null} overviewError={null} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="failureMessage"]')).toBeNull())
  })

  test('Ensure that manual intervention is displayed when the status is waiting', async () => {
    const refetchFn = jest.fn()

    const { container } = render(
      <TestWrapper>
        <ExecutionVerificationSummary
          step={{ status: ExecutionStatusEnum.InterventionWaiting }}
          refetchOverview={refetchFn}
          overviewData={null}
          overviewError={null}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="manualInterventionTab"]')).not.toBeNull())
  })

  describe('Abort verification', () => {
    test('should show abort verification button when pipeline status is running', async () => {
      const refetchFn = jest.fn()

      render(
        <TestWrapper>
          <ExecutionVerificationSummary
            step={{ status: ExecutionStatusEnum.InterventionWaiting }}
            refetchOverview={refetchFn}
            overviewData={SampleResponseRunningPipeline}
            overviewError={null}
          />
        </TestWrapper>
      )

      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'cv.abortVerification.buttonText' })).toBeInTheDocument()
      )
    })

    test('should not show abort verification button when pipeline status is other than', async () => {
      const refetchFn = jest.fn()

      render(
        <TestWrapper>
          <ExecutionVerificationSummary
            step={{ status: ExecutionStatusEnum.InterventionWaiting }}
            refetchOverview={refetchFn}
            overviewData={SampleResponsePassedPipeline}
            overviewError={null}
          />
        </TestWrapper>
      )

      await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'cv.abortVerification.buttonText' })).not.toBeInTheDocument()
      )
    })

    test('should make correct API call with correct payload when mark as success is clicked', async () => {
      const useAbortVerificationMock = jest.fn()

      jest.spyOn(cvService, 'useAbortVerifyStep').mockReturnValue({
        mutate: useAbortVerificationMock
      } as any)

      const refetchFn = jest.fn()

      render(
        <TestWrapper>
          <ExecutionVerificationSummary
            step={{ status: ExecutionStatusEnum.InterventionWaiting }}
            refetchOverview={refetchFn}
            overviewData={SampleResponseRunningPipeline}
            overviewError={null}
          />
        </TestWrapper>
      )

      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'cv.abortVerification.buttonText' })).toBeInTheDocument()
      )

      const abortVerificationButton = screen.getByTestId(/abortVerificationButton/)

      await waitFor(() => expect(abortVerificationButton).toBeInTheDocument())

      await act(async () => {
        await userEvent.click(abortVerificationButton)
      })

      await waitFor(() => expect(screen.getByText(/cv.abortVerification.markAsSuccess/)).toBeInTheDocument())

      await act(async () => {
        await userEvent.click(screen.getByText(/cv.abortVerification.markAsSuccess/))
      })

      const confirmButton = screen.getByTestId(/abortVerificationConfirmButton/)

      await waitFor(() => expect(confirmButton).toBeInTheDocument())

      await act(async () => {
        await userEvent.click(confirmButton)
      })

      await waitFor(() => expect(useAbortVerificationMock).toHaveBeenCalledWith({ verificationStatus: 'SUCCESS' }))
    })

    test('should make correct API call with correct payload when mark as failure is clicked', async () => {
      const useAbortVerificationMock = jest.fn()

      jest.spyOn(cvService, 'useAbortVerifyStep').mockReturnValue({
        mutate: useAbortVerificationMock
      } as any)

      const refetchFn = jest.fn()

      render(
        <TestWrapper>
          <ExecutionVerificationSummary
            step={{ status: ExecutionStatusEnum.InterventionWaiting }}
            refetchOverview={refetchFn}
            overviewData={SampleResponseRunningPipeline}
            overviewError={null}
          />
        </TestWrapper>
      )

      expect(screen.queryByTestId(/abortVerificationBanner/)).not.toBeInTheDocument()

      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'cv.abortVerification.buttonText' })).toBeInTheDocument()
      )

      const abortVerificationButton = screen.getByTestId(/abortVerificationButton/)

      await waitFor(() => expect(abortVerificationButton).toBeInTheDocument())

      await act(async () => {
        await userEvent.click(abortVerificationButton)
      })

      await waitFor(() => expect(screen.getByText(/cv.abortVerification.markAsFailure/)).toBeInTheDocument())

      await act(async () => {
        await userEvent.click(screen.getByText(/cv.abortVerification.markAsFailure/))
      })

      const confirmButton = screen.getByTestId(/abortVerificationConfirmButton/)

      await waitFor(() => expect(confirmButton).toBeInTheDocument())

      await act(async () => {
        await userEvent.click(confirmButton)
      })

      await waitFor(() => expect(useAbortVerificationMock).toHaveBeenCalledWith({ verificationStatus: 'FAILURE' }))
    })

    test('should have manual intervention banner with abort verification text when a pipeline execution was aborted as success', async () => {
      const useAbortVerificationMock = jest.fn()

      jest.spyOn(cvService, 'useAbortVerifyStep').mockReturnValue({
        mutate: useAbortVerificationMock
      } as any)

      const refetchFn = jest.fn()

      render(
        <TestWrapper>
          <ExecutionVerificationSummary
            step={{ status: ExecutionStatusEnum.InterventionWaiting }}
            refetchOverview={refetchFn}
            overviewData={SampleResponseAbortedSuccessPipeline}
            overviewError={null}
          />
        </TestWrapper>
      )

      expect(screen.queryByRole('button', { name: 'cv.abortVerification.buttonText' })).not.toBeInTheDocument()

      await waitFor(() =>
        expect(screen.getByText(/cv.deploymentVerification.failedWithAbortVerification/)).toBeInTheDocument()
      )
    })

    test('should have abort verification banner when a pipeline execution was aborted as success', async () => {
      const useAbortVerificationMock = jest.fn()

      jest.spyOn(cvService, 'useAbortVerifyStep').mockReturnValue({
        mutate: useAbortVerificationMock
      } as any)

      const refetchFn = jest.fn()

      render(
        <TestWrapper>
          <ExecutionVerificationSummary
            step={{ status: ExecutionStatusEnum.Success }}
            refetchOverview={refetchFn}
            overviewData={SampleResponseAbortedSuccessPipeline}
            overviewError={null}
          />
        </TestWrapper>
      )

      expect(screen.queryByRole('button', { name: 'cv.abortVerification.buttonText' })).not.toBeInTheDocument()

      await waitFor(() => expect(screen.getByTestId(/abortVerificationBanner/)).toBeInTheDocument())

      expect(screen.getByTestId(/abortVerificationBanner/)).toHaveTextContent('cv.abortVerification.bannerMessage')
    })

    test('should show error toast message if the abort call fails', async () => {
      const useAbortVerificationMock = jest.fn().mockImplementation(() =>
        Promise.reject({
          data: {
            message: 'Some error'
          },
          message: 'some error'
        })
      )

      jest.spyOn(cvService, 'useAbortVerifyStep').mockReturnValue({
        mutate: useAbortVerificationMock
      } as any)

      const refetchFn = jest.fn()

      render(
        <TestWrapper>
          <ExecutionVerificationSummary
            step={{ status: ExecutionStatusEnum.InterventionWaiting }}
            refetchOverview={refetchFn}
            overviewData={SampleResponseRunningPipeline}
            overviewError={null}
          />
        </TestWrapper>
      )

      expect(screen.queryByTestId(/abortVerificationBanner/)).not.toBeInTheDocument()

      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'cv.abortVerification.buttonText' })).toBeInTheDocument()
      )

      const abortVerificationButton = screen.getByTestId(/abortVerificationButton/)

      await waitFor(() => expect(abortVerificationButton).toBeInTheDocument())

      await act(async () => {
        await userEvent.click(abortVerificationButton)
      })

      await waitFor(() => expect(screen.getByText(/cv.abortVerification.markAsFailure/)).toBeInTheDocument())

      await act(async () => {
        await userEvent.click(screen.getByText(/cv.abortVerification.markAsFailure/))
      })

      const confirmButton = screen.getByTestId(/abortVerificationConfirmButton/)

      await waitFor(() => expect(confirmButton).toBeInTheDocument())

      await act(async () => {
        await userEvent.click(confirmButton)
      })

      await waitFor(() => expect(showError).toHaveBeenCalledWith('Some error'))
    })

    test('should disable abort verification button if Rbac pipeline expectute permission is disabled', async () => {
      const useAbortVerificationMock = jest.fn()
      jest.spyOn(usePermission, 'usePermission').mockReturnValue([false])

      jest.spyOn(cvService, 'useAbortVerifyStep').mockReturnValue({
        mutate: useAbortVerificationMock
      } as any)

      const refetchFn = jest.fn()

      render(
        <TestWrapper>
          <ExecutionVerificationSummary
            step={{ status: ExecutionStatusEnum.InterventionWaiting }}
            refetchOverview={refetchFn}
            overviewData={SampleResponseRunningPipeline}
            overviewError={null}
          />
        </TestWrapper>
      )

      const abortVerificationButton = screen.getByTestId(/abortVerificationButton/)

      await waitFor(() => expect(abortVerificationButton).toBeInTheDocument())

      expect(screen.getByTestId(/abortVerificationButton/).getAttribute('disabled')).toBe('')
    })

    test('should enable abort verification button if Rbac pipeline expectute permission is enabled', async () => {
      const useAbortVerificationMock = jest.fn()

      jest.spyOn(usePermission, 'usePermission').mockReturnValue([true])

      jest.spyOn(cvService, 'useAbortVerifyStep').mockReturnValue({
        mutate: useAbortVerificationMock
      } as any)

      const refetchFn = jest.fn()

      const dummyPermissionsMap = new Map()
      dummyPermissionsMap.set(PermissionIdentifier.EXECUTE_PIPELINE, true)

      render(
        <TestWrapper>
          <ExecutionVerificationSummary
            step={{ status: ExecutionStatusEnum.InterventionWaiting }}
            refetchOverview={refetchFn}
            overviewData={SampleResponseRunningPipeline}
            overviewError={null}
          />
        </TestWrapper>
      )

      const abortVerificationButton = screen.getByTestId(/abortVerificationButton/)

      await waitFor(() => expect(abortVerificationButton).toBeInTheDocument())

      expect(screen.getByTestId(/abortVerificationButton/).getAttribute('disabled')).toBeNull()
    })
  })
})
