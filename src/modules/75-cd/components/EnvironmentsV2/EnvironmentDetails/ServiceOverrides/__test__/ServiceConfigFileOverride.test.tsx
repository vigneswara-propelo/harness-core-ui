import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as cdNgServices from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { environmentPathProps, projectPathProps } from '@common/utils/routeUtils'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import ServiceConfigFileOverride from '../ServiceConfigFileOverride/ServiceConfigFileOverride'
import { serviceList, fileOverrides } from './__mocks__/mock'

describe('Service Config File Override Test', () => {
  test('add new service override', async () => {
    jest.spyOn(cdNgServices, 'useUpsertServiceOverride')

    const { container } = render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'test_env'
        })}
        pathParams={{ ...projectPathProps, ...environmentPathProps }}
      >
        <ServiceConfigFileOverride
          fileOverrides={[]}
          expressions={['']}
          isReadonly={false}
          handleServiceFileDelete={jest.fn()}
          handleConfigFileOverrideSubmit={jest.fn()}
          allowableTypes={[]}
        />
      </TestWrapper>
    )
    const plusButton = await waitFor(() => container.querySelector('[icon="plus"]'))
    fireEvent.click(plusButton!)
    expect(plusButton).toBeInTheDocument()
    const stepWizard = findDialogContainer()!

    const thumbnail = stepWizard!.querySelector('input[value="Git"]') as HTMLInputElement
    expect(thumbnail).toBeInTheDocument()
    userEvent.click(thumbnail)
    expect(container).toBeDefined()
  })
  test('open new config file override', async () => {
    jest.spyOn(cdNgServices, 'useUpsertServiceOverride')

    const { container } = render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'test_env'
        })}
        pathParams={{ ...projectPathProps, ...environmentPathProps }}
      >
        <ServiceConfigFileOverride
          fileOverrides={fileOverrides as cdNgServices.ConfigFileWrapper[]}
          expressions={['']}
          isReadonly={false}
          handleServiceFileDelete={jest.fn()}
          handleConfigFileOverrideSubmit={jest.fn()}
          allowableTypes={[]}
          serviceType={'NativeHelm'}
          serviceList={serviceList}
          selectedService={'kustomizeservice'}
          fromEnvConfigPage={false}
        />
      </TestWrapper>
    )

    const plusButton = await waitFor(() => container.querySelector('[icon="plus"]'))
    fireEvent.click(plusButton!)
    expect(plusButton).toBeInTheDocument()
    const dialog = findDialogContainer()!
    const closeButton = await waitFor(() => dialog.querySelector('[icon="cross"]'))
    fireEvent.click(closeButton!)
  })
  test('open edit service config file override', async () => {
    jest.spyOn(cdNgServices, 'useUpsertServiceOverride')

    const { container } = render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'test_env'
        })}
        pathParams={{ ...projectPathProps, ...environmentPathProps }}
      >
        <ServiceConfigFileOverride
          fileOverrides={fileOverrides as cdNgServices.ConfigFileWrapper[]}
          expressions={['']}
          isReadonly={false}
          handleServiceFileDelete={jest.fn()}
          handleConfigFileOverrideSubmit={jest.fn()}
          allowableTypes={[]}
          serviceType={'NativeHelm'}
          serviceList={serviceList}
          selectedService={'kustomizeservice'}
          fromEnvConfigPage={false}
        />
      </TestWrapper>
    )

    const editButton = await waitFor(() => container.querySelector('span[data-icon="Edit"]'))
    fireEvent.click(editButton!)
    expect(editButton).toBeInTheDocument()
    const dialog = findDialogContainer()!
    const closeButton = await waitFor(() => dialog.querySelector('[icon="cross"]'))
    fireEvent.click(closeButton!)
  })
})
