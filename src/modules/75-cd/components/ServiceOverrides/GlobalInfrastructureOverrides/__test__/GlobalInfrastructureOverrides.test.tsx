/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as cdNgServices from 'services/cd-ng'

import routes from '@common/RouteDefinitions'
import { modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'

import ServiceOverrides from '../../ServiceOverrides'
import globalInfrastructureListData from './__mocks__/globalInfrastructureListData.json'

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(fn => {
    return fn()
  })
}))

describe('GlobalInfrastructureOverrides test', () => {
  test('should render list of global infrastructure overrides', async () => {
    jest.spyOn(cdNgServices, 'useGetServiceOverrideListV3').mockImplementation(
      () =>
        ({
          data: {
            data: {}
          },
          refetch: jest.fn()
        } as any)
    )
    jest.spyOn(cdNgServices, 'useGetServiceAccessList').mockImplementation(
      () =>
        ({
          loading: false,
          data: {
            status: 'SUCCESS',
            data: []
          },
          refetch: jest.fn()
        } as any)
    )
    jest.spyOn(cdNgServices, 'useGetInfrastructureAccessList').mockImplementation(
      () =>
        ({
          loading: false,
          data: {
            status: 'SUCCESS',
            data: []
          },
          refetch: jest.fn()
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

    const globalInfraTab = screen.getByText('common.serviceOverrides.globalInfra')

    jest.spyOn(cdNgServices, 'useGetServiceOverrideListV3').mockImplementation(
      () =>
        ({
          data: {
            data: {
              content: globalInfrastructureListData
            }
          },
          refetch: jest.fn()
        } as any)
    )

    userEvent.click(globalInfraTab)

    await waitFor(() => expect(screen.getAllByText('Env_1')).toHaveLength(3))
    expect(screen.getAllByText('Infra_1')).toHaveLength(3)
    expect(screen.getAllByText('Env_2')).toHaveLength(1)
    expect(screen.getAllByText('Infra_2')).toHaveLength(1)
  })
})
