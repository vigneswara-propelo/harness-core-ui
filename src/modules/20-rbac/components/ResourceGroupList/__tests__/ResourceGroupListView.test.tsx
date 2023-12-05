import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { getResourceTypeHandlerMock } from '@rbac/utils/RbacFactoryMockData'
import ResourceGroupListView from '../ResourceGroupListView'
import mockData from './mockData.json'

const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'defaultproject' }
jest.mock('@rbac/factories/RbacFactory', () => ({
  getResourceTypeHandler: jest.fn().mockImplementation(resource => getResourceTypeHandlerMock(resource))
}))

describe('ResourceGroupListView', () => {
  test('Render with Data', () => {
    render(
      <TestWrapper pathParams={pathParams}>
        <ResourceGroupListView data={mockData as any} reload={jest.fn()} openResourceGroupModal={jest.fn()} />
      </TestWrapper>
    )
    // Assert Entity types to be displayed on List page
    const attributeTextElement = screen.getByText('connectorsLabel common.types: CODE_REPO,MONITORING')
    expect(attributeTextElement).toBeInTheDocument()
  })

  test('renders no data message when no resource groups are present', () => {
    render(
      <TestWrapper pathParams={pathParams}>
        <ResourceGroupListView
          data={
            {
              content: [],
              totalItems: 0,
              pageSize: 10,
              totalPages: 0,
              pageIndex: 0
            } as any
          }
          reload={jest.fn()}
          openResourceGroupModal={jest.fn()}
        />
      </TestWrapper>
    )

    const noDataTextElement = screen.getByText('rbac.resourceGroup.noResourceGroup')
    expect(noDataTextElement).toBeInTheDocument()
  })
})
