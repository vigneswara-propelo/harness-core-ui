import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as cdNgServices from 'services/cd-ng'

import routes from '@common/RouteDefinitions'
import { modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'

import ServiceOverrides from '../../ServiceOverrides'
import environmentServiceSpecificListData from './__mocks__/environmentServiceSpecificListData.json'

describe('EnvironmentServiceSpecificOverrides test', () => {
  test('should render list of environment service specific overrides', async () => {
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
          serviceOverrideType: 'ENVIRONMENT_SERVICE_SPECIFIC'
        }}
      >
        <ServiceOverrides />
      </TestWrapper>
    )

    const environmentServiceSpecificTab = screen.getByText('common.serviceOverrides.environmentServiceSpecific')

    jest.spyOn(cdNgServices, 'useGetServiceOverrideListV2').mockImplementation(
      () =>
        ({
          data: {
            data: {
              content: environmentServiceSpecificListData
            }
          },
          refetch: jest.fn()
        } as any)
    )

    userEvent.click(environmentServiceSpecificTab)

    await waitFor(() => expect(screen.getAllByText('Env_1')).toHaveLength(3))
    expect(screen.getAllByText('Svc_1')).toHaveLength(3)
    expect(screen.getByText('v1')).toBeInTheDocument()
    expect(screen.getByText('v4')).toBeInTheDocument()
    expect(screen.getByText('cf1')).toBeInTheDocument()
    expect(screen.getAllByText('Env_2')).toHaveLength(1)
    expect(screen.getAllByText('Svc_2')).toHaveLength(1)
    expect(screen.getByText('sDsad')).toBeInTheDocument()
  })
})
