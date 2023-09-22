import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import { HealthSourceTypes } from '@cv/pages/health-source/types'
import ServiceInstanceListDisplayWithFetch from '../ServiceInstanceListDisplayWithFetch'

const showError = jest.fn()

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: jest.fn(() => ({ showError }))
}))

describe('ServiceInstanceListDisplayWithFetch', () => {
  test('should check if feature flag is disabled, then fetch button should not be rendered', async () => {
    const mutateFn = jest.fn().mockReturnValue({
      resource: {
        serviceInstances: ['a', 'b']
      }
    })

    jest
      .spyOn(cvServices, 'useGetSampleMetricData')
      .mockReturnValue({ mutate: mutateFn, loading: false, error: null } as any)

    render(
      <TestWrapper defaultFeatureFlagValues={{ SRM_CV_UI_HEALTHSOURCE_SERVICE_INSTANCE_PREVIEW: false }}>
        <Formik initialValues={{ query: 'testQuery', serviceInstanceField: 'testHost' }} onSubmit={Promise.resolve}>
          <ServiceInstanceListDisplayWithFetch
            connectorIdentifier="connectorIdentifierTest"
            healthSourceType={HealthSourceTypes.Prometheus}
          />
        </Formik>
      </TestWrapper>
    )

    const fetchButton = screen.queryByTestId(/serviceInstanceFetchButton/)

    expect(fetchButton).not.toBeInTheDocument()
  })

  test('on click of fetch button, correct API call must be made for metrics', async () => {
    const mutateFn = jest.fn().mockReturnValue({
      resource: {
        serviceInstances: ['a', 'b']
      }
    })

    jest
      .spyOn(cvServices, 'useGetSampleMetricData')
      .mockReturnValue({ mutate: mutateFn, loading: false, error: null } as any)

    render(
      <TestWrapper defaultFeatureFlagValues={{ SRM_CV_UI_HEALTHSOURCE_SERVICE_INSTANCE_PREVIEW: true }}>
        <Formik initialValues={{ query: 'testQuery', serviceInstanceField: 'testHost' }} onSubmit={Promise.resolve}>
          <ServiceInstanceListDisplayWithFetch
            connectorIdentifier="connectorIdentifierTest"
            healthSourceType={HealthSourceTypes.Prometheus}
          />
        </Formik>
      </TestWrapper>
    )

    const serviceInstanceListDisplay = screen.queryByTestId(/serviceInstanceListDisplay/)

    const fetchButton = screen.getByTestId(/serviceInstanceFetchButton/)

    expect(serviceInstanceListDisplay).not.toBeInTheDocument()

    await act(async () => await userEvent.click(fetchButton))

    await waitFor(() =>
      expect(mutateFn).toHaveBeenCalledWith({
        connectorIdentifier: 'connectorIdentifierTest',
        endTime: expect.any(Number),
        healthSourceQueryParams: { serviceInstanceField: 'testHost' },
        healthSourceType: 'Prometheus',
        query: 'testQuery',
        startTime: expect.any(Number)
      })
    )

    const serviceInstanceListDisplay2 = screen.getByTestId(/serviceInstanceListDisplay/)

    await waitFor(() => expect(serviceInstanceListDisplay2).toBeInTheDocument())
    await waitFor(() => expect(serviceInstanceListDisplay2).toHaveTextContent('ab'))
  })

  test('should show show more button when more than 10 service instance names are present', async () => {
    const mutateFn = jest.fn().mockReturnValue({
      resource: {
        serviceInstances: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']
      }
    })

    jest
      .spyOn(cvServices, 'useGetSampleMetricData')
      .mockReturnValue({ mutate: mutateFn, loading: false, error: null } as any)

    render(
      <TestWrapper defaultFeatureFlagValues={{ SRM_CV_UI_HEALTHSOURCE_SERVICE_INSTANCE_PREVIEW: true }}>
        <Formik initialValues={{ query: 'testQuery', serviceInstanceField: 'testHost' }} onSubmit={Promise.resolve}>
          <ServiceInstanceListDisplayWithFetch
            connectorIdentifier="connectorIdentifierTest"
            healthSourceType={HealthSourceTypes.Prometheus}
          />
        </Formik>
      </TestWrapper>
    )

    const serviceInstanceListDisplay = screen.queryByTestId(/serviceInstanceListDisplay/)

    const fetchButton = screen.getByTestId(/serviceInstanceFetchButton/)

    expect(serviceInstanceListDisplay).not.toBeInTheDocument()

    await act(async () => await userEvent.click(fetchButton))

    await waitFor(() =>
      expect(mutateFn).toHaveBeenCalledWith({
        connectorIdentifier: 'connectorIdentifierTest',
        endTime: expect.any(Number),
        healthSourceQueryParams: { serviceInstanceField: 'testHost' },
        healthSourceType: 'Prometheus',
        query: 'testQuery',
        startTime: expect.any(Number)
      })
    )

    const serviceInstanceListDisplay2 = screen.getByTestId(/serviceInstanceListDisplay/)
    const showMoreButton = screen.getByTestId(/serviceInstanceNamesShowMoreButton/)

    await waitFor(() => expect(serviceInstanceListDisplay2).toBeInTheDocument())
    await waitFor(() => expect(serviceInstanceListDisplay2).toHaveTextContent('abcdefghij'))

    await waitFor(() => expect(showMoreButton).toBeInTheDocument())
    await waitFor(() => expect(showMoreButton).toHaveTextContent('common.showMore'))

    await act(async () => await userEvent.click(showMoreButton))

    await waitFor(() => expect(serviceInstanceListDisplay2).toHaveTextContent(/^abcdefghijkcommon.showLess$/))

    await waitFor(() => expect(showMoreButton).toHaveTextContent('common.showLess'))
  })

  test('should check whether correct indexes values are populated for Datadog logs and correct log call is made', async () => {
    const mutateFn = jest.fn().mockReturnValue({
      resource: {
        serviceInstances: ['c', 'd']
      }
    })

    jest
      .spyOn(cvServices, 'useGetSampleLogData')
      .mockReturnValue({ mutate: mutateFn, loading: false, error: null } as any)

    render(
      <TestWrapper defaultFeatureFlagValues={{ SRM_CV_UI_HEALTHSOURCE_SERVICE_INSTANCE_PREVIEW: true }}>
        <Formik
          initialValues={{
            query: 'testQuery',
            serviceInstanceField: 'testHost',
            indexes: [{ value: 'main1' }, { value: 'main2' }]
          }}
          onSubmit={Promise.resolve}
        >
          <ServiceInstanceListDisplayWithFetch
            connectorIdentifier="connectorIdentifierTest"
            healthSourceType={HealthSourceTypes.DatadogLog}
            isLogHealthSource
          />
        </Formik>
      </TestWrapper>
    )

    const serviceInstanceListDisplay = screen.queryByTestId(/serviceInstanceListDisplay/)

    const fetchButton = screen.getByTestId(/serviceInstanceFetchButton/)

    expect(serviceInstanceListDisplay).not.toBeInTheDocument()

    await act(async () => await userEvent.click(fetchButton))

    await waitFor(() =>
      expect(mutateFn).toHaveBeenCalledWith({
        connectorIdentifier: 'connectorIdentifierTest',
        endTime: expect.any(Number),
        healthSourceQueryParams: { indexes: ['main1', 'main2'], serviceInstanceField: 'testHost' },
        healthSourceType: 'DatadogLog',
        query: 'testQuery',
        startTime: expect.any(Number)
      })
    )

    const serviceInstanceListDisplay2 = screen.getByTestId(/serviceInstanceListDisplay/)

    await waitFor(() => expect(serviceInstanceListDisplay2).toBeInTheDocument())
    await waitFor(() => expect(serviceInstanceListDisplay2).toHaveTextContent('cd'))
  })

  test('should check whether incorrect indexes data structure is passed, then indexes should be ignored in payload', async () => {
    const mutateFn = jest.fn().mockReturnValue({
      resource: {
        serviceInstances: ['c', 'd']
      }
    })

    jest
      .spyOn(cvServices, 'useGetSampleLogData')
      .mockReturnValue({ mutate: mutateFn, loading: false, error: null } as any)

    render(
      <TestWrapper defaultFeatureFlagValues={{ SRM_CV_UI_HEALTHSOURCE_SERVICE_INSTANCE_PREVIEW: true }}>
        <Formik
          initialValues={{
            query: 'testQuery',
            serviceInstanceField: 'testHost',
            indexes: 'testIndexes'
          }}
          onSubmit={Promise.resolve}
        >
          <ServiceInstanceListDisplayWithFetch
            connectorIdentifier="connectorIdentifierTest"
            healthSourceType={HealthSourceTypes.DatadogLog}
            isLogHealthSource
          />
        </Formik>
      </TestWrapper>
    )

    const serviceInstanceListDisplay = screen.queryByTestId(/serviceInstanceListDisplay/)

    const fetchButton = screen.getByTestId(/serviceInstanceFetchButton/)

    expect(serviceInstanceListDisplay).not.toBeInTheDocument()

    await act(async () => await userEvent.click(fetchButton))

    await waitFor(() =>
      expect(mutateFn).toHaveBeenCalledWith({
        connectorIdentifier: 'connectorIdentifierTest',
        endTime: expect.any(Number),
        healthSourceQueryParams: { serviceInstanceField: 'testHost' },
        healthSourceType: 'DatadogLog',
        query: 'testQuery',
        startTime: expect.any(Number)
      })
    )

    const serviceInstanceListDisplay2 = screen.getByTestId(/serviceInstanceListDisplay/)

    await waitFor(() => expect(serviceInstanceListDisplay2).toBeInTheDocument())
    await waitFor(() => expect(serviceInstanceListDisplay2).toHaveTextContent('cd'))
  })

  test('should show toast message when API call fails with message', async () => {
    const mutateFn = jest.fn()

    jest
      .spyOn(cvServices, 'useGetSampleLogData')
      .mockReturnValue({ mutate: mutateFn, loading: false, error: { message: 'Something went wrong' } } as any)

    render(
      <TestWrapper defaultFeatureFlagValues={{ SRM_CV_UI_HEALTHSOURCE_SERVICE_INSTANCE_PREVIEW: true }}>
        <Formik
          initialValues={{
            query: 'testQuery',
            serviceInstanceField: 'testHost',
            indexes: [{ value: 'main1' }, { value: 'main2' }]
          }}
          onSubmit={Promise.resolve}
        >
          <ServiceInstanceListDisplayWithFetch
            connectorIdentifier="connectorIdentifierTest"
            healthSourceType={HealthSourceTypes.DatadogLog}
            isLogHealthSource
          />
        </Formik>
      </TestWrapper>
    )

    const serviceInstanceListDisplay = screen.queryByTestId(/serviceInstanceListDisplay/)

    const fetchButton = screen.getByTestId(/serviceInstanceFetchButton/)

    expect(serviceInstanceListDisplay).not.toBeInTheDocument()

    await act(async () => await userEvent.click(fetchButton))

    await waitFor(() => expect(showError).toBeCalledWith('Something went wrong'))
  })

  test('should check the service list name should not be displayed when the response list is empty', async () => {
    const mutateFn = jest.fn().mockReturnValue({
      resource: {
        serviceInstances: []
      }
    })

    jest.spyOn(cvServices, 'useGetSampleLogData').mockReturnValue({ mutate: mutateFn, error: null } as any)

    render(
      <TestWrapper defaultFeatureFlagValues={{ SRM_CV_UI_HEALTHSOURCE_SERVICE_INSTANCE_PREVIEW: true }}>
        <Formik
          initialValues={{
            query: 'testQuery',
            serviceInstanceField: 'testHost',
            indexes: [{ value: 'main1' }, { value: 'main2' }]
          }}
          onSubmit={Promise.resolve}
        >
          <ServiceInstanceListDisplayWithFetch
            connectorIdentifier="connectorIdentifierTest"
            healthSourceType={HealthSourceTypes.DatadogLog}
            isLogHealthSource
          />
        </Formik>
      </TestWrapper>
    )

    const serviceInstanceListDisplay = screen.queryByTestId(/serviceInstanceListDisplay/)

    const fetchButton = screen.getByTestId(/serviceInstanceFetchButton/)

    expect(serviceInstanceListDisplay).not.toBeInTheDocument()

    await act(async () => await userEvent.click(fetchButton))

    const serviceInstanceListDisplay2 = screen.queryByTestId(/serviceInstanceListDisplay/)

    await waitFor(() => expect(serviceInstanceListDisplay2).not.toBeInTheDocument())
  })
})
