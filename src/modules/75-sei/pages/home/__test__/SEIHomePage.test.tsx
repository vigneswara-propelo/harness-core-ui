/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetLicensesAndSummary } from 'services/cd-ng'
import SEIHomePage from '../SEIHomePage'

jest.mock('@projects-orgs/pages/HomePageTemplate/HomePageTemplate', () => ({
  ...(jest.requireActual('@projects-orgs/pages/HomePageTemplate/HomePageTemplate') as any),
  HomePageTemplate: function MockComponent(props: any) {
    return (
      <div className="homepagetemplage">
        <button className="projectCreate" onClick={() => props.projectCreateSuccessHandler({})}></button>
      </div>
    )
  }
}))

jest.mock('services/cd-ng')
const useGetModuleLicenseInfoMock = useGetLicensesAndSummary as jest.MockedFunction<any>

const currentUser = {
  defaultAccountId: '123',
  accounts: [
    {
      uuid: '123',
      createdFromNG: true
    }
  ],
  uuid: '123'
}

describe('SEIHomePage snapshot test', () => {
  test('should render Trial Home page when return success with NO data', async () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: null,
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: '123' }}
        defaultAppStoreValues={{ currentUserInfo: currentUser }}
      >
        <SEIHomePage />
      </TestWrapper>
    )
    expect(getByText('/account/123/sei/home/trial')).toBeInTheDocument()
  })

  test('should return error page if call fails', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: null,
        error: {
          message: 'call failed'
        },
        refetch: jest.fn()
      }
    })
    const { getByText } = render(
      <TestWrapper>
        <SEIHomePage />
      </TestWrapper>
    )
    expect(getByText('call failed')).toBeDefined()
  })

  test('should show a loading spinner', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {},
        loading: true,
        error: null,
        refetch: jest.fn()
      }
    })
    const { getByText } = render(
      <TestWrapper queryParams={{ experience: 'TRIAL' }}>
        <SEIHomePage />
      </TestWrapper>
    )
    expect(getByText('Loading, please wait...')).toBeInTheDocument()
  })
  test('Ensure project success handler calls history push', async () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: {},
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })
    const { container, getByText } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <SEIHomePage />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('[class~="projectCreate"]')!)
    expect(getByText('/account/undefined/sei/orgs//projects/undefined/dashboard')).toBeInTheDocument()
  })
})
