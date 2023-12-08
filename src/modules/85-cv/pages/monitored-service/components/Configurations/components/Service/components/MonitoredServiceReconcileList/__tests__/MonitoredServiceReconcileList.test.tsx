/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import * as cvService from 'services/cv'
import MonitoredServiceReconcileList from '../MonitoredServiceReconcileList'
import {
  reconcileStatusAPIMock,
  resolvedTemplateAPIMOck,
  templateInputsAPIMock,
  templateValueMock
} from './MonitoredServiceReconcileList.mock'

const detachMonitoredService = jest.fn()
const reconcileMSTemplate = jest.fn()
const refetchStatusAPI = jest.fn()

jest.mock('services/cv', () => ({
  useGetMonitoredServiceReconciliationStatuses: jest.fn().mockImplementation(() => {
    return { data: { resource: reconcileStatusAPIMock.resource }, refetch: refetchStatusAPI }
  }),
  useDetachMonitoredServiceFromTemplate: jest.fn().mockImplementation(() => {
    return { mutate: detachMonitoredService, error: { data: { message: 'Detach API Failure' } } }
  }),
  useUpdateMonitoredServiceFromYaml: jest.fn().mockImplementation(() => {
    return { mutate: reconcileMSTemplate }
  }),
  useGetMonitoredServiceResolvedTemplateInputs: jest.fn().mockImplementation(() => {
    return { data: resolvedTemplateAPIMOck.data }
  })
}))

jest.mock('services/template-ng', () => ({
  ...(jest.requireActual('services/template-ng') as any),
  useGetTemplateInputSetYaml: jest.fn().mockImplementation(() => ({
    data: templateInputsAPIMock.data
  }))
}))

describe('MonitoredServiceReconcileList', () => {
  test('should render MonitoredServiceReconcileList with data', async () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceReconciliationStatuses').mockImplementation(() => {
      return { data: { resource: reconcileStatusAPIMock.resource } } as any
    })

    detachMonitoredService.mockRejectedValueOnce(false)

    const { container, getByText, getAllByTestId } = render(
      <TestWrapper>
        <MonitoredServiceReconcileList templateValue={templateValueMock} />
      </TestWrapper>
    )

    expect(container.querySelectorAll('.TableV2--body [role="row"]').length).toEqual(3)
    expect(getByText('CV.MONITOREDSERVICES.RECONCILETAB.INPUTREQUIREDRECONCILE')).toBeInTheDocument()
    expect(getAllByTestId('detachTemplate').length).toEqual(3)
    expect(getAllByTestId('reconcileTemplate').length).toEqual(3)
    const editButton = getAllByTestId('reconcileTemplate')[0]
    const detachButton = getAllByTestId('detachTemplate')[0]

    fireEvent.click(detachButton)
    expect(getByText('cv.healthSource.detachHealthSource')).toBeInTheDocument()
    fireEvent.click(getByText('cv.healthSource.detachLabel'))
    expect(getByText('Detach API Failure')).toBeInTheDocument()
    expect(detachMonitoredService).toHaveBeenCalled()

    fireEvent.click(detachButton)
    expect(getByText('cv.healthSource.detachHealthSource')).toBeInTheDocument()
    fireEvent.click(getByText('cv.healthSource.detachLabel'))
    expect(detachMonitoredService).toHaveBeenCalled()

    fireEvent.click(editButton)
  })

  test('should render MonitoredServiceReconcileList with empty row', () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceReconciliationStatuses').mockImplementation(() => {
      return {
        data: { resource: { ...reconcileStatusAPIMock.resource, content: [{}] } },
        refetch: refetchStatusAPI
      } as any
    })
    const { container } = render(
      <TestWrapper>
        <MonitoredServiceReconcileList templateValue={templateValueMock} />
      </TestWrapper>
    )
    expect(container.querySelectorAll('.TableV2--body [role="row"]').length).toEqual(1)
  })

  test('should render loading MonitoredServiceReconcileList', () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceReconciliationStatuses').mockImplementation(() => {
      return { data: null, loading: true } as any
    })
    const { getByText } = render(
      <TestWrapper>
        <MonitoredServiceReconcileList templateValue={templateValueMock} />
      </TestWrapper>
    )
    expect(getByText('Loading, please wait...')).toBeInTheDocument()
  })

  test('should render no data MonitoredServiceReconcileList', () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceReconciliationStatuses').mockImplementation(() => {
      return { data: { resource: {} } } as any
    })
    const { getByText } = render(
      <TestWrapper>
        <MonitoredServiceReconcileList templateValue={templateValueMock} />
      </TestWrapper>
    )

    expect(getByText('cv.monitoredServices.ReconcileTab.noLinkedMS')).toBeInTheDocument()
  })

  test('should render with error MonitoredServiceReconcileList', () => {
    const refetchReconcileStatus = jest.fn()
    jest.spyOn(cvService, 'useGetMonitoredServiceReconciliationStatuses').mockImplementation(() => {
      return { error: { data: { message: 'Reconcile status API Failure' } }, refetch: refetchReconcileStatus } as any
    })
    const { getByText } = render(
      <TestWrapper>
        <MonitoredServiceReconcileList templateValue={templateValueMock} />
      </TestWrapper>
    )

    expect(getByText('Reconcile status API Failure')).toBeInTheDocument()
    fireEvent.click(getByText('Retry'))
    expect(refetchReconcileStatus).toHaveBeenCalled()
  })
})
