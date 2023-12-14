import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { orgPathProps, accountPathProps } from '@common/utils/routeUtils'
import { createMockData } from './mockData'
import { orgMockData } from './OrgMockData'
import CreateProject from '../CreateProject'

jest.mock('services/cd-ng', () => ({
  usePostProject: jest.fn().mockImplementation(() => createMockData),
  useGetOrganizationList: jest.fn().mockImplementation(() => {
    return { data: orgMockData, refetch: jest.fn(), error: null }
  })
}))

describe('Create Project Component Test', () => {
  test('org field should be disabled when project is created from org scope', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toOrganizationDetails({ ...orgPathProps })}
        pathParams={{ accountId: 'testAcc', orgIdentifier: 'testOrg' }}
      >
        <CreateProject />
      </TestWrapper>
    )
    const orgField = container.querySelector('input[name="orgIdentifier"]') as HTMLInputElement
    await waitFor(() => {
      expect(orgField).toHaveAttribute('value', 'Org Name')
    })
    expect(orgField).toBeDisabled()
  })

  test('org field should be enabled when project is created from Account scope', async () => {
    const { container } = render(
      <TestWrapper path={routes.toAllProjects({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <CreateProject />
      </TestWrapper>
    )

    const orgField = container.querySelector('input[name="orgIdentifier"]') as HTMLInputElement
    expect(orgField).toBeEnabled()
    await waitFor(() => {
      expect(orgField).toHaveAttribute('value', 'default')
    })
  })
})
