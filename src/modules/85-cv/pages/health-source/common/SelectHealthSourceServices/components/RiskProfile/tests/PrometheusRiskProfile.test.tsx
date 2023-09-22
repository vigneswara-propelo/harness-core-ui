/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { Classes } from '@blueprintjs/core'
import { Formik } from 'formik'
import type { useGetMetricPacks, useGetLabelNames } from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { HealthSourceTypes } from '@cv/pages/health-source/types'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { RiskProfile } from '../RiskProfile'

const showErrorMock = jest.fn()

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: jest.fn(() => ({ showError: showErrorMock, showSuccess: jest.fn(), clear: jest.fn() }))
}))

const MockLabels = ['label1', 'label2', 'label3']
const MockResponse = {
  loading: false,
  error: '',
  data: {
    metaData: {},
    resource: [
      {
        uuid: '6LIAtyPGSfexTIr-utVxCg',
        accountId: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'harness_test',
        projectIdentifier: 'raghu_p',
        dataSourceType: 'PROMETHEUS',
        identifier: 'Errors',
        category: 'Errors',
        metrics: [
          {
            name: 'Errors',
            type: 'ERROR',
            path: null,
            validationPath: null,
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: false
          }
        ],
        thresholds: null
      },
      {
        uuid: 'Ld3-RmvdQXWRfsYNoyqerw',
        accountId: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'harness_test',
        projectIdentifier: 'raghu_p',
        dataSourceType: 'PROMETHEUS',
        identifier: 'Infrastructure',
        category: 'Infrastructure',
        metrics: [
          {
            name: 'Infrastructure',
            type: 'INFRA',
            path: null,
            validationPath: null,
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: false
          }
        ],
        thresholds: null
      },
      {
        uuid: 'Z1CmKPBkQ0GEQpwlpWGDHA',
        accountId: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'harness_test',
        projectIdentifier: 'raghu_p',
        dataSourceType: 'PROMETHEUS',
        identifier: 'Performance',
        category: 'Performance',
        metrics: [
          {
            name: 'Other',
            type: 'ERROR',
            path: null,
            validationPath: null,
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: false
          },
          {
            name: 'Throughput',
            type: 'THROUGHPUT',
            path: null,
            validationPath: null,
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: false
          },
          {
            name: 'Response Time',
            type: 'RESP_TIME',
            path: null,
            validationPath: null,
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: false
          }
        ],
        thresholds: null
      }
    ],
    responseMessages: []
  },
  cancel: jest.fn(),
  absolutePath: '',
  response: {},
  refetch: jest.fn()
} as unknown as ReturnType<typeof useGetMetricPacks>

describe('Unit tests for RiskProfile', () => {
  beforeEach(() => {
    showErrorMock.mockClear()
  })
  test('Ensure that api result is rendered correctly', async () => {
    const { getByText } = render(
      <TestWrapper>
        <Formik initialValues={{ query: '*', serviceInstance: 'hostName' }} onSubmit={Promise.resolve}>
          <RiskProfile
            metricPackResponse={MockResponse}
            labelNamesResponse={{ data: MockLabels } as unknown as ReturnType<typeof useGetLabelNames>}
          />
        </Formik>
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('Performance/Other')).not.toBeNull())
    getByText('Performance/Throughput')
    getByText('Errors')
    getByText('Infrastructure')
    getByText('Performance/Response Time')
  })

  test('Ensure that loading state is rendered correctly', async () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{ query: '*', serviceInstance: 'hostName' }} onSubmit={Promise.resolve}>
          <RiskProfile
            metricPackResponse={{ loading: true } as unknown as ReturnType<typeof useGetMetricPacks>}
            labelNamesResponse={{ data: MockLabels } as unknown as ReturnType<typeof useGetLabelNames>}
          />
        </Formik>
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelectorAll(`.${Classes.SKELETON}`).length).toBe(4))
  })

  test('Ensure that when an error occurs, the error is displayed', async () => {
    render(
      <TestWrapper>
        <Formik initialValues={{ query: '*', serviceInstance: 'hostName' }} onSubmit={Promise.resolve}>
          <RiskProfile
            metricPackResponse={
              { error: { data: { detailedMessage: 'someError' } } } as unknown as ReturnType<typeof useGetMetricPacks>
            }
            labelNamesResponse={{ data: MockLabels } as unknown as ReturnType<typeof useGetLabelNames>}
          />
        </Formik>
      </TestWrapper>
    )

    await waitFor(() => expect(showErrorMock).toBeCalledWith('someError', 7000))
  })

  test('should test service instance names section should render when showServiceInstanceNames prop is passed', async () => {
    render(
      <TestWrapper defaultFeatureFlagValues={{ SRM_CV_UI_HEALTHSOURCE_SERVICE_INSTANCE_PREVIEW: true }}>
        <SetupSourceTabsContext.Provider
          value={{
            sourceData: { connectorRef: 'connectorRefValue', sourceType: HealthSourceTypes.DatadogMetrics },
            onNext: Promise.resolve,
            onPrevious: Promise.resolve
          }}
        >
          <Formik initialValues={{ query: '*', serviceInstance: 'hostName' }} onSubmit={Promise.resolve}>
            <RiskProfile
              metricPackResponse={
                { error: { data: { detailedMessage: 'someError' } } } as unknown as ReturnType<typeof useGetMetricPacks>
              }
              labelNamesResponse={{ data: MockLabels } as unknown as ReturnType<typeof useGetLabelNames>}
              showServiceInstanceNames
              continuousVerificationEnabled
            />
          </Formik>
        </SetupSourceTabsContext.Provider>
      </TestWrapper>
    )

    const fetchServiceInstancesButton = screen.getByTestId(/serviceInstanceFetchButton/)

    await waitFor(() => expect(fetchServiceInstancesButton).toBeInTheDocument())
  })

  test('should test service instance names section should not render when showServiceInstanceNames prop is not passed', async () => {
    render(
      <TestWrapper defaultFeatureFlagValues={{ SRM_CV_UI_HEALTHSOURCE_SERVICE_INSTANCE_PREVIEW: true }}>
        <SetupSourceTabsContext.Provider
          value={{
            sourceData: { connectorRef: 'connectorRefValue', sourceType: HealthSourceTypes.DatadogMetrics },
            onNext: Promise.resolve,
            onPrevious: Promise.resolve
          }}
        >
          <Formik initialValues={{ query: '*', serviceInstance: 'hostName' }} onSubmit={Promise.resolve}>
            <RiskProfile
              metricPackResponse={
                { error: { data: { detailedMessage: 'someError' } } } as unknown as ReturnType<typeof useGetMetricPacks>
              }
              labelNamesResponse={{ data: MockLabels } as unknown as ReturnType<typeof useGetLabelNames>}
              continuousVerificationEnabled
            />
          </Formik>
        </SetupSourceTabsContext.Provider>
      </TestWrapper>
    )

    const fetchServiceInstancesButton = screen.queryByTestId(/serviceInstanceFetchButton/)

    await waitFor(() => expect(fetchServiceInstancesButton).not.toBeInTheDocument())
  })
})
