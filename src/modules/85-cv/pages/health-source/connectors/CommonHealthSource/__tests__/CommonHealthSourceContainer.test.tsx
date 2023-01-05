/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import CommonHealthSourceContainer, { CommonHealthSourceContainerProps } from '../CommonHealthSource.container'
import { createHealthSourceConfigurationsData, createHealthSourcePayload } from '../CommonHealthSource.utils'
import { healthSourceConfig, mockedDefineHealthSourcedata, mockedSourceData } from './CommonHealthSource.mock'

function WrapperComponent(props: CommonHealthSourceContainerProps): JSX.Element {
  return (
    <TestWrapper>
      <CommonHealthSourceContainer {...props} />
    </TestWrapper>
  )
}

describe('Unit tests for CommonHealthSourceContainer', () => {
  const props = {
    data: {
      connectorRef: 'Sumo_logic',
      isEdit: false,
      healthSourceList: [],
      serviceRef: 'svcstageprometheus',
      environmentRef: 'envstageprometheus',
      monitoredServiceRef: {
        name: 'svcstageprometheus_envstageprometheus',
        identifier: 'svcstageprometheus_envstageprometheus'
      },
      existingMetricDetails: null,
      sourceType: 'SumoLogic',
      dataSourceType: 'Prometheus',
      product: {
        value: 'METRICS',
        label: 'SumoLogic Cloud Metrics'
      },
      healthSourceName: 'a',
      healthSourceIdentifier: 'a'
    },
    healthSourceConfig: healthSourceConfig,
    isTemplate: false,
    expressions: [],
    onSubmit: jest.fn()
  }
  test('Ensure CommonHealthSourceContainer component loads with the button to add metric', async () => {
    const { getByText } = render(<WrapperComponent {...props} />)
    await waitFor(() => expect(getByText('common.addName')).toBeInTheDocument())
  })

  test('should be able to click on the submit button and submit the form', async () => {
    const { getByText } = render(<WrapperComponent {...props} />)
    const submitButton = getByText('submit')
    await waitFor(() => expect(submitButton).toBeInTheDocument())
    userEvent.click(submitButton)
  })

  test('should validate createHealthSourcePayload', () => {
    const customMetricsMap = new Map()
    customMetricsMap.set('M1', {
      identifier: 'M1',
      metricName: 'M1',
      groupName: {
        label: 'G1',
        value: 'G1'
      },
      query: '*'
    })
    const consfigureHealthSourceData = {
      customMetricsMap,
      selectedMetric: 'M1',
      ignoreThresholds: [],
      failFastThresholds: []
    }

    expect(createHealthSourcePayload(mockedDefineHealthSourcedata, consfigureHealthSourceData)).toEqual({
      identifier: 'Health_source_2',
      name: 'Health source 2 ',
      spec: {
        connectorRef: 'account.Sumologic_Metric_Test',
        dataSourceType: 'SUMOLOGIC_METRICS',
        queryDefinitions: [
          {
            continuousVerificationEnabled: false,
            groupName: 'G1',
            identifier: 'M1',
            liveMonitoringEnabled: false,
            name: 'M1',
            query: '*',
            queryParams: {},
            riskProfile: {
              category: 'Performance',
              metricType: 'INFRA',
              riskCategory: 'Errors',
              thresholdTypes: ['ACT_WHEN_LOWER']
            },
            sliEnabled: false
          }
        ]
      },
      type: 'NextGenHealthSource'
    })
  })

  test('should validate createHealthSourceConfigurationsData', () => {
    const isTemplate = false

    const customMetricsMap = new Map()
    customMetricsMap.set('M1', {
      continuousVerification: false,
      groupName: {
        label: 'G1',
        value: 'G1'
      },
      healthScore: false,
      higherBaselineDeviation: false,
      identifier: 'M1',
      lowerBaselineDeviation: true,
      metricName: 'M1',
      query: '*',
      riskCategory: 'Errors',
      serviceInstance: undefined,
      sli: false
    })

    expect(createHealthSourceConfigurationsData(mockedSourceData, isTemplate)).toEqual({
      customMetricsMap,
      failFastThresholds: [],
      ignoreThresholds: [],
      selectedMetric: 'M1'
    })
  })
})
