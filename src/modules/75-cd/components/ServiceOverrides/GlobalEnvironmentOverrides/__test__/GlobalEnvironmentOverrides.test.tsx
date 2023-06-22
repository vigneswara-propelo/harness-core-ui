import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'

import * as cdNgServices from 'services/cd-ng'

import routes from '@common/RouteDefinitions'
import { modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'

import ServiceOverrides from '../../ServiceOverrides'
import globalEnvironmentListData from './__mocks__/globalEnvironmentListData.json'

describe('GlobalEnvironmentOverrides test', () => {
  test('should render list of global environment overrides', async () => {
    jest.spyOn(cdNgServices, 'useGetServiceOverrideListV2').mockImplementation(
      () =>
        ({
          data: {
            data: { content: globalEnvironmentListData }
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

    await waitFor(() => expect(screen.getAllByText('Env_1')).toHaveLength(4))
    expect(screen.getByText('/path/to/application/settings')).toBeInTheDocument()
    expect(screen.getAllByText('Env_2')).toHaveLength(2)
    expect(screen.getByText('GCP')).toBeInTheDocument()
  })
})
