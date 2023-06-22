import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as cdNgServices from 'services/cd-ng'

import routes from '@common/RouteDefinitions'
import { modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'

import ServiceOverrides from '../../ServiceOverrides'
import infrastructureServiceSpecificListData from './__mocks__/infrastructureServiceSpecificListData.json'

describe('InfrastructureServiceSpecificOverrides test', () => {
  test('should render list of infrastructure service specific overrides', async () => {
    jest.spyOn(cdNgServices, 'useGetServiceOverrideListV2').mockImplementation(
      () =>
        ({
          data: {
            data: {}
          },
          refetch: jest.fn()
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
          serviceOverrideType: 'ENV_GLOBAL_OVERRIDE'
        }}
      >
        <ServiceOverrides />
      </TestWrapper>
    )

    const infrastructureServiceSpecificTab = screen.getByText('common.serviceOverrides.infrastructureServiceSpecific')

    jest.spyOn(cdNgServices, 'useGetServiceOverrideListV2').mockImplementation(
      () =>
        ({
          data: {
            data: {
              content: infrastructureServiceSpecificListData
            }
          },
          refetch: jest.fn()
        } as any)
    )

    userEvent.click(infrastructureServiceSpecificTab)

    await waitFor(() => expect(screen.getAllByText('Env_1')).toHaveLength(3))
    expect(screen.getAllByText('Svc_1')).toHaveLength(3)
    expect(screen.getAllByText('Infra_1')).toHaveLength(3)
    expect(screen.getAllByText('Env_2')).toHaveLength(1)
    expect(screen.getAllByText('Svc_2')).toHaveLength(1)
    expect(screen.getAllByText('Infra_2')).toHaveLength(1)
  })
})
