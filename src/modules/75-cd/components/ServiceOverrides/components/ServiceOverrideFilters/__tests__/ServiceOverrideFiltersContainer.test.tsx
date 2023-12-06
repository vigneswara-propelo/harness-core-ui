/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import routes from '@common/RouteDefinitions'
import { modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import ServiceOverrideFiltersContainer from '@cd/components/ServiceOverrides/components/ServiceOverrideFilters/ServiceOverrideFiltersContainer'
import * as commonHooks from '@common/hooks'

import globalEnvironmentListData from '../../../GlobalEnvironmentOverrides/__test__/__mocks__/globalEnvironmentListData.json'

jest.mock('@cd/components/ServiceOverrides/components/ServiceOverrideFilters/ServiceOverrideFilter', () => ({
  ...(jest.requireActual(
    '@cd/components/ServiceOverrides/components/ServiceOverrideFilters/ServiceOverrideFilter'
  ) as any),
  ServiceOverrideFilter: ({ onApply }: any) => {
    return (
      <div
        className="service-override-filter-mock"
        onClick={() =>
          onApply({
            environments: [{ label: 'Env_1', value: 'Env_1' }],
            services: [{ label: 'login4', value: 'login4' }],
            infrastructures: [
              { label: 'env_as_runtime_and_infra_as_expression_3', value: 'env_as_runtime_and_infra_as_expression_3' }
            ]
          })
        }
      >
        service-override-filter-mock
      </div>
    )
  }
}))

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  useGetServiceAccessList: jest.fn().mockImplementation(
    () =>
      ({
        loading: false,
        data: {
          status: 'SUCCESS',
          data: [],
          metaData: null,
          correlationId: 'f92a681d-e852-4685-8584-efbeded5d7bf'
        },
        refetch: jest.fn()
      } as any)
  ),
  useGetServiceOverrideListV3: jest.fn().mockImplementation(
    () =>
      ({
        data: {
          data: { content: globalEnvironmentListData }
        },
        refetch: jest.fn()
      } as any)
  ),
  useGetInfrastructureAccessList: jest.fn().mockImplementation(
    () =>
      ({
        loading: false,
        data: {
          status: 'SUCCESS',
          data: []
        },
        refetch: jest.fn()
      } as any)
  ),
  useGetEnvironmentAccessListV2: jest.fn().mockImplementation(
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
}))

describe('GlobalEnvironmentOverrides test', () => {
  test('should render list of global environment overrides', async () => {
    const updateQueryParamsMock = jest.fn()
    jest.spyOn(commonHooks, 'useUpdateQueryParams').mockReturnValue({
      updateQueryParams: updateQueryParamsMock,
      replaceQueryParams: jest.fn()
    })
    jest.spyOn(commonHooks, 'useQueryParams').mockReturnValue({
      filters: {
        environmentIdentifiers: ['Env_1'],
        serviceIdentifiers: ['login4'],
        infraIdentifiers: ['env_as_runtime_and_infra_as_expression_3']
      }
    })
    const { getByText } = render(
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
        <ServiceOverrideFiltersContainer />
      </TestWrapper>
    )

    await userEvent.click(getByText('service-override-filter-mock'))

    expect(updateQueryParamsMock).toHaveBeenCalledWith({
      page: undefined,
      filterIdentifier: undefined,
      filters: {
        environmentIdentifiers: ['Env_1'],
        serviceIdentifiers: ['login4'],
        infraIdentifiers: ['env_as_runtime_and_infra_as_expression_3']
      }
    })
  })
})
