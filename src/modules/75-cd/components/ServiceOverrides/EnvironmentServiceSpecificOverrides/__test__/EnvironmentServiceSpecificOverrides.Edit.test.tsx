import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as cdNgServices from 'services/cd-ng'

import routes from '@common/RouteDefinitions'
import { modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'

import ServiceOverrides from '../../ServiceOverrides'

jest.mock('services/cd-ng-rq', () => ({
  useGetServiceAccessListQuery: jest.fn(() => ({
    data: {
      data: [
        {
          service: {
            name: 'Svc 1',
            identifier: 'Svc_1',
            projectIdentifier: 'dummyProject',
            orgIdentifier: 'dummyOrg',
            accountIdentifier: 'dummyAcc'
          }
        }
      ]
    },
    isInitialLoading: false
  }))
}))

describe('EnvironmentServiceSpecificOverrides Edit test', () => {
  test('edit existing new override', async () => {
    const user = userEvent.setup()
    const refetchOverrideList = jest.fn()

    jest.spyOn(cdNgServices, 'useGetServiceOverrideListV2').mockImplementation(
      () =>
        ({
          data: {
            data: {
              content: [
                {
                  identifier: 'Env_1_Svc_1',
                  environmentRef: 'Env_1',
                  infraIdentifier: undefined,
                  serviceRef: 'Svc_1',
                  orgIdentifier: 'dummyOrg',
                  projectIdentifier: 'dummyProject',
                  spec: { variables: [{ name: 'var1', type: 'String', value: 'varValue1' }] }
                }
              ]
            }
          },
          refetch: refetchOverrideList
        } as any)
    )

    jest.spyOn(cdNgServices, 'useGetEnvironmentAccessListV2').mockImplementation(
      () =>
        ({
          loading: false,
          error: undefined,
          mutate: jest.fn().mockResolvedValue({
            data: [
              {
                environment: {
                  name: 'Env 1',
                  identifier: 'Env_1',
                  projectIdentifier: 'dummyProject',
                  orgIdentifier: 'dummyOrg',
                  accountIdentifier: 'dummyAcc'
                }
              }
            ]
          })
        } as any)
    )

    const updateServiceOverride = jest.fn()

    jest.spyOn(cdNgServices, 'useUpdateServiceOverrideV2').mockImplementation(
      () =>
        ({
          loading: false,
          error: undefined,
          mutate: updateServiceOverride.mockResolvedValue({
            data: {
              identifier: 'Env_1_Svc_1',
              environmentRef: 'Env_1',
              infraIdentifier: undefined,
              serviceRef: 'Svc_1',
              orgIdentifier: 'dummyOrg',
              projectIdentifier: 'dummyProject',
              spec: { variables: [{ name: 'var1', type: 'String', value: 'varValue1' }] }
            }
          })
        } as any)
    )

    render(
      <TestWrapper
        path={routes.toServiceOverrides({
          ...projectPathProps,
          ...modulePathProps
        })}
        pathParams={{
          accountId: 'dummyAcc',
          orgIdentifier: 'dummyOrg',
          projectIdentifier: 'dummyProject',
          module: 'cd'
        }}
        queryParams={{
          serviceOverrideType: 'ENV_SERVICE_OVERRIDE'
        }}
      >
        <ServiceOverrides />
      </TestWrapper>
    )

    await waitFor(() => expect(screen.getByText('ENVIRONMENT')).toBeInTheDocument())
    expect(screen.getByText('SERVICE')).toBeInTheDocument()
    expect(screen.queryByText('INFRASTRUCTURETEXT')).not.toBeInTheDocument()
    expect(screen.getByText('COMMON.SERVICEOVERRIDES.OVERRIDETYPE')).toBeInTheDocument()

    const editButton = screen.getAllByRole('button')[3]

    await user.click(editButton)

    // Edit Variable Value

    await waitFor(() => expect(screen.getByTestId('scoped-select-popover-field_environmentRef')).toBeInTheDocument())

    const valueInput = screen.getByPlaceholderText('valueLabel')

    await waitFor(() => expect(valueInput).toBeInTheDocument())

    await user.type(valueInput!, 'varValue2')

    jest.spyOn(cdNgServices, 'useGetServiceOverrideListV2').mockImplementation(
      () =>
        ({
          loading: false,
          data: {
            data: {
              content: [
                {
                  identifier: 'Env_1_Svc_1',
                  environmentRef: 'Env_1',
                  infraIdentifier: undefined,
                  serviceRef: 'Svc_1',
                  orgIdentifier: 'dummyOrg',
                  projectIdentifier: 'dummyProject',
                  spec: { variables: [{ name: 'var1', type: 'String', value: 'varValue1varValue2' }] }
                }
              ]
            }
          },
          refetch: jest.fn()
        } as any)
    )

    // Submit Override
    const submitButton = screen.getByRole('button', { name: 'tick' })

    await user.click(submitButton)

    expect(updateServiceOverride).toHaveBeenCalledWith({
      identifier: 'Env_1_Svc_1',
      environmentRef: 'Env_1',
      infraIdentifier: undefined,
      serviceRef: 'Svc_1',
      orgIdentifier: 'dummyOrg',
      projectIdentifier: 'dummyProject',
      spec: { variables: [{ name: 'var1', type: 'String', value: 'varValue1varValue2' }] }
    })

    await waitFor(() => expect(refetchOverrideList).toHaveBeenCalled)
    expect(screen.getByText('CD.OVERRIDEVALUE')).toBeInTheDocument()
    expect(screen.getByText('varValue1varValue2')).toBeInTheDocument()
  })
})
