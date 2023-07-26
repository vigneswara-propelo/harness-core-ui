/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import RunTimeMonitoredService from '../RunTimeMonitoredService'
import { initialValues, mockedMonitoredServiceAndHealthSources, pathParams } from './RunTimeMonitoredServiceMocks'

jest.mock('services/cv', () => ({
  useGetMonitoredServiceFromServiceAndEnvironment: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: mockedMonitoredServiceAndHealthSources, error: false })),
  useUpdateMonitoredService: () =>
    jest.fn().mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: jest.fn() }))
}))

describe('Test RunTimeMonitoredService component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Verify when service ane env identifier are passed to RunTimeMonitoredService then appropriate monitoring service and health sources should be reflected', async () => {
    const onUpdate = jest.fn()
    const { getByText, getByTestId } = render(
      <TestWrapper pathParams={pathParams}>
        <RunTimeMonitoredService
          serviceIdentifier={'newservicetesting'}
          envIdentifier={'newenvtesting'}
          onUpdate={onUpdate}
          prefix={'stages[0].stage.spec.execution.steps[0].step.'}
          initialValues={initialValues}
        />
      </TestWrapper>
    )
    // Verify if correct monitoring service is present.
    await waitFor(() => {
      expect(getByText('platform.connectors.cdng.monitoredService.label')).toBeTruthy()
      const monitoredService = getByTestId('monitored-service')
      expect(monitoredService).toBeTruthy()
    })

    // Verify if correct health sources are present.
    await waitFor(() => {
      expect(getByText('platform.connectors.cdng.healthSources.label')).toBeTruthy()
      for (const healthSource of mockedMonitoredServiceAndHealthSources.data.monitoredService.sources.healthSources) {
        expect(getByText(healthSource.name)).toBeTruthy()
      }
    })
  })
})
