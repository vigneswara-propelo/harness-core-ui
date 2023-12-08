/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import * as cvService from 'services/cv'
import * as templateService from 'services/template-ng'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import ReconcileMonitoredServiceForm from '../ReconcileMonitoredServiceFormInTemplate'
import { resolvedTemplateAPIMOck, templateInputsAPIMock, templateMockValue } from './MonitoredServiceReconcileList.mock'

jest.mock('services/template-ng', () => ({
  ...(jest.requireActual('services/template-ng') as any),
  useGetTemplateInputSetYaml: jest.fn().mockImplementation(() => ({
    data: templateInputsAPIMock
  }))
}))

const reconcileMSTemplate = jest.fn()

jest.mock('services/cv', () => ({
  useUpdateMonitoredServiceFromYaml: jest.fn().mockImplementation(() => {
    return { mutate: reconcileMSTemplate }
  }),
  useGetMonitoredServiceResolvedTemplateInputs: jest.fn().mockImplementation(() => {
    return { data: resolvedTemplateAPIMOck }
  })
}))

describe('ReconcileMonitoredServiceForm', () => {
  test('should render ReconcileMonitoredServiceForm', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ReconcileMonitoredServiceForm
          templateValue={templateMockValue}
          monitoredServiceIdentifier={'monitoredService1'}
          closeDrawer={jest.fn()}
        />
      </TestWrapper>
    )

    expect(getByText('common.discard')).toBeInTheDocument()
    expect(getByText('pipeline.outOfSyncErrorStrip.reconcile')).toBeInTheDocument()

    expect(container.querySelector('input[name="sources.healthSources.0.spec.tierName"]')).toHaveValue(
      'manager-iterator'
    )
    expect(container.querySelector('input[name="sources.healthSources.0.spec.applicationName"]')).toHaveValue('Local')
    fireEvent.click(getByText('pipeline.outOfSyncErrorStrip.reconcile'))
  })

  test('should render ReconcileMonitoredServiceForm in ResolvedTemplate error condition', async () => {
    const refetchResovedTemplates = jest.fn()

    jest.spyOn(cvService, 'useGetMonitoredServiceResolvedTemplateInputs').mockImplementationOnce(() => {
      return { error: { data: 'Resolved Template API failure' }, refetch: refetchResovedTemplates } as any
    })

    const { getByText } = render(
      <TestWrapper>
        <ReconcileMonitoredServiceForm
          templateValue={templateMockValue}
          monitoredServiceIdentifier={'monitoredService1'}
          closeDrawer={jest.fn()}
        />
      </TestWrapper>
    )

    expect(getByText('Retry')).toBeInTheDocument()
    expect(getByText('"Resolved Template API failure"')).toBeInTheDocument()
    fireEvent.click(getByText('Retry'))
    expect(refetchResovedTemplates).toHaveBeenCalled()
  })

  test('should render ReconcileMonitoredServiceForm in InputSet error condition', async () => {
    const refetchTemplateInputSet = jest.fn()
    jest.spyOn(templateService, 'useGetTemplateInputSetYaml').mockImplementation(() => {
      return { error: { data: 'InputSet API failure' }, refetch: refetchTemplateInputSet } as any
    })

    const { getByText } = render(
      <TestWrapper>
        <ReconcileMonitoredServiceForm
          templateValue={templateMockValue}
          monitoredServiceIdentifier={'monitoredService1'}
          closeDrawer={jest.fn()}
        />
      </TestWrapper>
    )

    expect(getByText('Retry')).toBeInTheDocument()
    expect(getByText('"InputSet API failure"')).toBeInTheDocument()
    fireEvent.click(getByText('Retry'))
    expect(refetchTemplateInputSet).toHaveBeenCalled()
  })
})
