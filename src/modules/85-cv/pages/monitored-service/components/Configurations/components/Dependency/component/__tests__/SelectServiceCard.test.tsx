/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import * as cvService from 'services/cv'
import * as ServiceCardUtils from '@cv/pages/monitored-service/components/Configurations/components/Dependency/component/components/SelectServiceCard.utils'
import { TestWrapper } from '@common/utils/testUtils'
import type { DependencyMetaData } from '@cv/pages/monitored-service/components/Configurations/components/Dependency/component/SelectServiceCard.types'
import SelectServiceCard from '../SelectServiceCard'

const applicationData: cvService.MonitoredServiceDTO = {
  serviceRef: 'service101',
  type: 'Application',
  orgIdentifier: '1234_orgIdentifier',
  projectIdentifier: '1234_projectIdentifier',
  dependencies: [],
  name: 'monitoredService1',
  environmentRef: '1234_env',
  identifier: '1234_identifier',
  tags: {}
}

const infrastructureData: cvService.MonitoredServiceDTO = {
  serviceRef: 'service102',
  type: 'Infrastructure',
  orgIdentifier: '1234_orgIdentifier',
  projectIdentifier: '1234_projectIdentifier',
  dependencies: [
    {
      monitoredServiceIdentifier: '12356_identifier'
    }
  ],
  name: 'monitoredService1',
  environmentRef: '1234_env',
  identifier: '1234_identifier',
  tags: {}
}

describe('SelectServiceCard', () => {
  test('should render application service card', async () => {
    const onChange = jest.fn()
    const { container } = render(
      <TestWrapper>
        <SelectServiceCard
          monitoredService={applicationData}
          onChange={onChange}
          dependencyMetaData={infrastructureData.dependencies![0] as DependencyMetaData}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="application"]')).not.toBeNull())
    fireEvent.click(container.querySelector('input[type="checkbox"]')!)
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(false, { monitoredServiceIdentifier: '1234_identifier' }))
  })

  test('should render infrastructure service card', async () => {
    const onChange = jest.fn()
    jest
      .spyOn(cvService, 'useGetMonitoredService')
      .mockReturnValue({ data: { data: { monitoredService: { identifier: '1234_identifier' } } } } as any)
    jest.spyOn(ServiceCardUtils, 'getConnectorRefFromChangeSourceService').mockReturnValue('connectorIdentifier')
    jest.spyOn(cvService, 'useGetNamespaces').mockReturnValue({
      data: { data: { content: ['namespace1', 'namespace2'] } },
      refetch: jest.fn()
    } as any)

    jest
      .spyOn(cvService, 'useGetWorkloads')
      .mockReturnValue({ data: { data: { content: ['workload1', 'workload2'] } }, refetch: jest.fn() } as any)

    const { container, getByText } = render(
      <TestWrapper>
        <SelectServiceCard
          monitoredService={infrastructureData}
          onChange={onChange}
          dependencyMetaData={infrastructureData.dependencies![0] as DependencyMetaData}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="infrastructure"]')).not.toBeNull())
    fireEvent.click(container.querySelector('input[type="checkbox"]')!)
    await waitFor(() => expect(container.querySelectorAll('[class*="selectContainer"]').length).toBe(2))

    const carets = container.querySelectorAll('[data-icon="chevron-down"]')
    fireEvent.click(carets[0])
    await waitFor(() => container.querySelector('[class*="menuItem"]'))
    fireEvent.click(getByText('namespace1'))
    await waitFor(() => expect(container.querySelector('input[name="workload"][disabled]')).toBeNull())

    const workload = container.getElementsByClassName('bp3-multi-select-tag-input-input')[0]
    fireEvent.click(workload)
    await waitFor(() => expect(container.querySelector('input[value="workload1"]')).toBeInTheDocument())
    fireEvent.click(container.querySelector('input[value="workload1"]')!)

    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith(true, {
        dependencyMetadata: { namespace: 'namespace1', workloads: ['workload1'] },
        monitoredServiceIdentifier: '1234_identifier',
        type: 'KUBERNETES'
      })
    )
  })
})
