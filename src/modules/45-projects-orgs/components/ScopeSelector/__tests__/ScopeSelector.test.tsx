/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, getByText, fireEvent, act, waitFor } from '@testing-library/react'
import { TestWrapper, findPopoverContainer } from '@common/utils/testUtils'
import { ScopeSelector } from '@projects-orgs/components/ScopeSelector/ScopeSelector'
import { projectMockDataWithModules, organizations } from './Mocks'

jest.mock('services/cd-ng', () => ({
  useGetOrganizationAggregateDTOList: jest.fn().mockImplementation(() => {
    return { data: organizations, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetProjectListWithMultiOrgFilter: jest.fn().mockImplementation(() => {
    return { data: projectMockDataWithModules, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetProjectAggregateDTOList: jest.fn().mockImplementation(() => {
    return { data: projectMockDataWithModules, refetch: jest.fn(), error: null, loading: false }
  }),
  useDeleteProject: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  getOrganizationListPromise: jest.fn().mockImplementation(() => {
    return Promise.resolve({
      data: {
        content: [
          {
            label: 'org1',
            value: 'org1'
          }
        ]
      }
    })
  })
}))

const availableLinks = {
  Project: [],
  Organization: [],
  Account: []
}

function WrapperComponent(): JSX.Element {
  return (
    <TestWrapper>
      <ScopeSelector isOpen={true} onButtonClick={jest.fn()} onClose={jest.fn()} availableLinks={availableLinks} />
    </TestWrapper>
  )
}

describe('Scope Selector', () => {
  test('scope selector is rendered', async () => {
    render(<WrapperComponent />)
    const popover = findPopoverContainer() as HTMLElement
    expect(popover).toBeDefined()
    expect(getByText(popover, 'projectLabel')).toBeDefined()
    expect(getByText(popover, 'orgLabel')).toBeDefined()
    expect(getByText(popover, 'account')).toBeDefined()
  })
  test('should be able to click on a project', async () => {
    const { getByTestId } = render(<WrapperComponent />)
    const popover = findPopoverContainer() as HTMLElement
    expect(popover).toBeDefined()
    expect(getByText(popover, 'projectLabel')).toBeDefined()
    act(() => {
      fireEvent.click(getByText(popover, 'projectLabel'))
    })
    const card = popover.querySelector('[data-testid="project-card-gitX_CDCAAAsunnyGitExp"]')
    expect(card).toBeDefined()
    act(() => {
      fireEvent.click(card as HTMLElement)
    })

    await waitFor(() => getByTestId('location'))
    expect(getByTestId('location')).toHaveTextContent('/orgs/AAAsunnyGitExp/projects/gitX_CDC')
  })
  test('should be able to click on an org', async () => {
    const { getByTestId } = render(<WrapperComponent />)
    const popover = findPopoverContainer() as HTMLElement
    expect(popover).toBeDefined()
    expect(getByText(popover, 'orgLabel')).toBeDefined()
    act(() => {
      fireEvent.click(getByText(popover, 'orgLabel'))
    })
    act(() => {
      const card = popover.querySelector('[data-testid="org-card-aaaaaaaaaaaaaaaaDeepakOrg"]')
      expect(card).toBeDefined()
      fireEvent.click(card as HTMLElement)
    })

    await waitFor(() => getByTestId('location'))
    expect(getByTestId('location')).toHaveTextContent('/orgs/aaaaaaaaaaaaaaaaDeepakOrg')
  })
})
