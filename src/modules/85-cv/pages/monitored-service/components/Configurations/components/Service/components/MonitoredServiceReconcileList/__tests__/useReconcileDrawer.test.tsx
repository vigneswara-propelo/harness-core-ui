/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
// import {} from '@testing-library/react-hooks'
import { Button, Container } from '@harness/uicore'
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as cvService from 'services/cv'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import useReconcileDrawer, { ReconileDrawerProp } from '../useReconcileDrawer'
import { resolvedTemplateAPIMOck, templateDataMock, templateInputsAPIMock } from './MonitoredServiceReconcileList.mock'

const TestComponent = (props: ReconileDrawerProp) => {
  const { openInputsetModal, closeInputsetModal } = useReconcileDrawer()
  return (
    <>
      <Button onClick={() => openInputsetModal({ ...props })}>showDrawer</Button>
      <Button onClick={closeInputsetModal}> hideDrawer </Button>
    </>
  )
}

jest.mock(
  '@modules/85-cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.utils',
  () => ({
    ...(jest.requireActual(
      '@modules/85-cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.utils'
    ) as any),
    validateInputSet: jest.fn().mockReturnValue({})
  })
)

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

jest.mock(
  '@cv/pages/monitored-service/components/Configurations/components/Service/components/MonitoredServiceOverview/component/OrgAccountLevelServiceEnvField/OrgAccountLevelServiceEnvField',
  () => ({
    __esModule: true,
    default: (props: any) => (
      <Container data-testid="OrgAccountLevelServiceEnvField">
        <Button
          onClick={() => props?.serviceOnSelect({ label: 'newService', value: 'newService' })}
          title="On Service Select"
        />
        <Button
          onClick={() => props?.environmentOnSelect({ label: 'newEnv', value: 'newEnv' })}
          title="On Environment Select"
        />
      </Container>
    )
  })
)

describe('useReconcileDrawer', () => {
  test('should open useReconcileDrawer', async () => {
    jest.spyOn(cvService, 'useUpdateMonitoredServiceFromYaml').mockImplementationOnce(() => {
      return { error: { data: 'Reconcile API failure' } } as any
    })

    reconcileMSTemplate.mockRejectedValueOnce(false)
    const refetch = jest.fn()
    const props = {
      identifier: 'ms1',
      templateIdentifier: 'mstemplate1',
      versionLabel: '1',
      templateValue: templateDataMock,
      refetch
    }
    const { getByText } = render(
      <TestWrapper>
        <TestComponent {...props} />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('showDrawer'))
    })

    await waitFor(() => expect(document.body.querySelector(`.bp3-drawer`)).toBeInTheDocument())
    await waitFor(() => expect(document.querySelector('button[data-testid="reconcileButton"]')).toBeInTheDocument())

    fireEvent.click(document.querySelector('button[data-testid="reconcileButton"]')!)
    expect(document.getElementsByClassName('bp3-toast-message').length).toEqual(1)

    expect(document.querySelector('[title="On Service Select"]')).toBeInTheDocument()
    expect(document.querySelector('[title="On Environment Select"]')).toBeInTheDocument()
    await act(async () => {
      await userEvent.click(document.querySelector('[title="addEnv"]')!)
    })
    await act(async () => {
      await userEvent.click(document.querySelector('[title="onSelectEnv"]')!)
    })
    fireEvent.click(document.querySelector('[title="On Service Select"]')!)
    fireEvent.click(document.querySelector('[title="On Environment Select"]')!)

    fireEvent.click(document.querySelector('button[data-testid="reconcileButton"]')!)
    expect(reconcileMSTemplate).toHaveBeenCalled()

    fireEvent.click(document.querySelector('button[data-testid="discardButton"]')!)
  })
})
