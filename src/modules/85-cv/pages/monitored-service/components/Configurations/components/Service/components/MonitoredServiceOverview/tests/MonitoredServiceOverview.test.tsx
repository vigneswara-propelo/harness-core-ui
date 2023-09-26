/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { UseGetReturn } from 'restful-react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Button, Container, Formik, FormikForm } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdService from 'services/cd-ng'
import mockImport from 'framework/utils/mockImport'
import { MonitoredServiceProvider } from '@cv/pages/monitored-service/MonitoredServiceContext'
import MonitoredServiceOverview from '../MonitoredServiceOverview'
import { MonitoredServiceType } from '../MonitoredServiceOverview.constants'
import { MonitoredServiceForm } from '../../../Service.types'

jest.mock(
  '@cv/pages/monitored-service/components/Configurations/components/Service/components/MonitoredServiceOverview/component/OrgAccountLevelServiceEnvField/OrgAccountLevelServiceEnvField',
  () => ({
    __esModule: true,
    default: (props: any) => (
      <Container data-testid="OrgAccountLevelServiceEnvField">
        <Button
          onClick={() => props?.serviceOnSelect({ label: 'service2', value: 'service2' })}
          title="On Service Select"
          className="changeService"
        />
        <Button
          onClick={() => props?.environmentOnSelect({ label: 'env2', value: 'env2' })}
          title="On Environment Select"
          className="changeEnv"
        />
      </Container>
    )
  })
)

jest.mock('@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment', () => ({
  ...jest.requireActual('@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment'),
  HarnessEnvironmentAsFormField: function Mock(props: any) {
    return (
      <div className={props.environmentProps.className}>
        <button
          className="newEnv"
          onClick={() => props.environmentProps.onNewCreated({ name: 'newEnv', identifier: 'newEnv' })}
        />
        <button
          className="changeEnv"
          onClick={() => props.environmentProps.onNewCreated({ name: 'env2', identifier: 'env2' })}
        />
        <p>{props.environmentProps.item?.label}</p>
      </div>
    )
  },
  HarnessServiceAsFormField: function Mock(props: any) {
    return (
      <div className={props.serviceProps.className}>
        <button
          className="newService"
          onClick={() => props.serviceProps.onNewCreated({ name: 'newService', identifier: 'newService' })}
        />
        <button
          className="changeService"
          onClick={() => props.serviceProps.onNewCreated({ name: 'service2', identifier: 'service2' })}
        />
        <p>{props.serviceProps.item?.label}</p>
      </div>
    )
  }
}))

mockImport('framework/LicenseStore/LicenseStoreContext', {
  useLicenseStore: jest.fn().mockImplementation(() => ({
    licenseInformation: {
      CV: {
        status: 'ACTIVE'
      }
    }
  }))
})

const onChangeMonitoredServiceType = jest.fn()

function WrapperComponent(props: any) {
  return (
    <TestWrapper>
      <Formik
        onSubmit={values => props.onSubmit(values)}
        initialValues={props.initialValues}
        validate={values => props.setFormikValues?.(values)}
        formName="mockForm"
      >
        {formikProps => (
          <FormikForm>
            <MonitoredServiceOverview
              onChangeMonitoredServiceType={onChangeMonitoredServiceType}
              formikProps={formikProps}
              isEdit={props.isEdit}
            />
            <button type="submit" />
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('Unit tests for MonitoredServiceOverview', () => {
  beforeEach(() => {
    jest
      .spyOn(cdService, 'useGetServiceListForProject')
      .mockReturnValue({ data: { data: { content: [{ identifier: 'service1', name: 'service1' }] } } } as UseGetReturn<
        any,
        any,
        any,
        any
      >)
    jest
      .spyOn(cdService, 'useGetEnvironmentListForProject')
      .mockReturnValue({ data: { data: { content: [{ identifier: 'env1', name: 'env1' }] } } } as UseGetReturn<
        any,
        any,
        any,
        any
      >)
  })

  test('Ensure that providing the service and env generates correct name value', async () => {
    const onSubmitMock = jest.fn()
    let formikValues: { serviceRef?: string; environmentRef?: string } = {}
    const setFormikValues = (values: any) => {
      formikValues = values
    }
    const { container } = render(
      <WrapperComponent onSubmit={onSubmitMock} initialValues={{}} setFormikValues={setFormikValues} />
    )

    await waitFor(() => expect(container.querySelector('[class*="monitoredService"]')).not.toBeNull())
    expect(container.querySelectorAll('[class*="dropdown"]').length).toBe(1)

    fireEvent.click(container.querySelector('.changeService')!)
    await waitFor(() => expect(formikValues.serviceRef).toBe('service2'))

    fireEvent.click(container.querySelector('.changeEnv')!)
    await waitFor(() => expect(formikValues.environmentRef).toBe('env2'))
  })

  test('Ensure that edit flow only shows name field', async () => {
    const onSubmitMock = jest.fn()
    const { container } = render(
      <WrapperComponent
        onSubmit={onSubmitMock}
        isEdit={true}
        initialValues={{
          name: 'blah blah',
          type: MonitoredServiceType.INFRASTRUCTURE,
          identifier: 'blah blah',
          serviceRef: 'service1',
          environmentRef: 'env1'
        }}
      />
    )

    await waitFor(() => expect(container.querySelector('[class*="monitoredService"]')).not.toBeNull())
    expect(container.querySelectorAll('[class*="dropdown"]').length).toBe(0)
    expect(container.querySelector('input[value="blah blah"]')).not.toBeNull()

    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onSubmitMock).toHaveBeenCalledWith({
        environmentRef: 'env1',
        identifier: 'blah blah',
        name: 'blah blah',
        serviceRef: 'service1',
        type: MonitoredServiceType.INFRASTRUCTURE
      })
    )
  })

  test('Ensure that switching monitored service type works', async () => {
    const onSubmitMock = jest.fn()
    const { container, getByText } = render(
      <WrapperComponent
        onSubmit={onSubmitMock}
        initialValues={{ type: MonitoredServiceType.APPLICATION, serviceRef: 'service1' }}
      />
    )

    await waitFor(() => expect(container.querySelector('[class*="monitoredService"]')).not.toBeNull())
    await waitFor(() => expect(container.querySelector('input[value="Application"]')).toBeTruthy())
    fireEvent.click(
      container.querySelector(`[class*="monitoredService"] .bp3-input-action [data-icon="chevron-down"]`)!
    )
    await waitFor(() => expect(container.querySelector('[class*="menuItemLabel"]')).not.toBeNull())
    fireEvent.click(getByText('Infrastructure'))
    fireEvent.click(getByText('confirm'))

    expect(onChangeMonitoredServiceType).toHaveBeenCalledWith('Infrastructure')
  })

  test('should render correctly when in case of org/acc level service and environment', () => {
    const onSubmitMock = jest.fn()
    const { container } = render(
      <WrapperComponent
        onSubmit={onSubmitMock}
        initialValues={{ type: MonitoredServiceType.APPLICATION, serviceRef: 'service1', environmentRef: 'env1' }}
      />
    )
    expect(container.querySelector('[title="On Service Select"]')).toBeInTheDocument()
    expect(container.querySelector('[title="On Environment Select"]')).toBeInTheDocument()
  })

  test('should disable monitored service type dropdown if it is templates and edit scenario', async () => {
    const { container } = render(
      <TestWrapper path="/:templateIdentifier" pathParams={{ templateIdentifier: 'testTemplateId' }}>
        <MonitoredServiceProvider isTemplate>
          <Formik<MonitoredServiceForm>
            onSubmit={Promise.resolve}
            initialValues={{} as MonitoredServiceForm}
            formName="mockForm"
          >
            {formikProps => (
              <FormikForm>
                <MonitoredServiceOverview
                  onChangeMonitoredServiceType={onChangeMonitoredServiceType}
                  formikProps={formikProps}
                  isEdit={false}
                />
                <button type="submit" />
              </FormikForm>
            )}
          </Formik>
        </MonitoredServiceProvider>
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('input[name="type"]')).toBeDisabled())
  })
  test('should enable monitored service type dropdown if it is templates and create scenario', async () => {
    const { container } = render(
      <TestWrapper path="/:templateIdentifier" pathParams={{ templateIdentifier: '-1' }}>
        <MonitoredServiceProvider isTemplate>
          <Formik<MonitoredServiceForm>
            onSubmit={Promise.resolve}
            initialValues={{} as MonitoredServiceForm}
            formName="mockForm"
          >
            {formikProps => (
              <FormikForm>
                <MonitoredServiceOverview
                  onChangeMonitoredServiceType={onChangeMonitoredServiceType}
                  formikProps={formikProps}
                  isEdit={false}
                />
                <button type="submit" />
              </FormikForm>
            )}
          </Formik>
        </MonitoredServiceProvider>
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('input[name="type"]')).not.toBeDisabled())
  })
})
