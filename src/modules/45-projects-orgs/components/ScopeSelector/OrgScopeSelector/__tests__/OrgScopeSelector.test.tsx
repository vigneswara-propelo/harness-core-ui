/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdngServices from 'services/cd-ng'
import { useGetOrganizationAggregateDTOList } from 'services/cd-ng'
import { OrgScopeSelector } from '../OrgScopeSelector'
import { projectMockDataWithModules, organizations } from '../../__tests__/Mocks'

jest.mock('services/cd-ng', () => ({
  useGetOrganizationAggregateDTOList: jest.fn().mockImplementation(() => {
    return { data: organizations, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetProjectListWithMultiOrgFilter: jest.fn().mockImplementation(() => {
    return { data: projectMockDataWithModules, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetProjectAggregateDTOList: jest.fn().mockImplementation(() => {
    return { data: projectMockDataWithModules, refetch: jest.fn(), error: null }
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

const onOrgClick = jest.fn()

const renderComponent = (): RenderResult => {
  return render(
    <TestWrapper>
      <OrgScopeSelector onClick={onOrgClick} />
    </TestWrapper>
  )
}

describe('OrgScopeSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('org card should be rendered', async () => {
    const { findByTestId, findByText } = renderComponent()
    const orgCard = await findByTestId('org-card-aaaaaaaaaaaaaaaaDeepakOrg')
    expect(orgCard).toBeInTheDocument()
    expect(await findByText('projectsText')).toBeInTheDocument()
    expect(await findByText('collaboratorsLabel')).toBeInTheDocument()
  })

  test('should render pagespinner if loading', async () => {
    jest.spyOn(cdngServices, 'useGetOrganizationAggregateDTOList').mockImplementation((): any => {
      return { data: {}, loading: true }
    })
    const { findByTestId } = renderComponent()
    expect(await findByTestId('page-spinner')).toBeInTheDocument()
  })

  test('test search functionality', async () => {
    jest
      .spyOn(cdngServices, 'useGetOrganizationAggregateDTOList')
      .mockImplementation(() => ({ data: organizations, refetch: jest.fn() } as any))
    renderComponent()
    const searchInput = screen.getByPlaceholderText('projectsOrgs.searchPlaceHolder') as HTMLInputElement

    expect(searchInput).toBeVisible()
    expect(searchInput?.value).toBe('')

    const query = 'abcd'

    const user = userEvent.setup()
    user.type(searchInput, query)

    await waitFor(() => expect(searchInput?.value).toBe(query))
    await waitFor(() => expect(useGetOrganizationAggregateDTOList).toBeCalledTimes(3))
  })
})
