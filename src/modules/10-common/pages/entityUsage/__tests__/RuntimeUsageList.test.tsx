/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, secretPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import * as cdNGSVC from 'services/cd-ng'
import secretRuntimeUsageData from './mocks/entitySecretRuntimeUsage.json'
import entityPaginationDataRuntimeUsage from './mocks/entityPaginationDataRuntimeUsage.json'
import referredByEntities from './mocks/referredByEntities.json'
import RuntimeUsageList from '../views/RuntimeUsageView/RuntimeUsageList'
import { filterData } from '../utils'

const projectEntityUrl =
  'http://localhost/ng/account/dummy/settings/organizations/orgId/setup/resources/connectors/PreCertified_Instance'
window.open = jest.fn()
const listActivitiesPromise = jest.fn(() =>
  Promise.resolve({ data: secretRuntimeUsageData, refetch: () => Promise.resolve(secretRuntimeUsageData) })
)
const listEntitiesPromise = jest.fn(() =>
  Promise.resolve({
    data: referredByEntities
  })
)
jest.mock('services/cd-ng', () => ({
  useListActivities: jest.fn().mockImplementation(() => {
    return listActivitiesPromise
  }),
  useGetUniqueReferredByEntities: jest.fn().mockImplementation(() => {
    return listEntitiesPromise
  })
}))

describe('RuntimeUsageList component', () => {
  test('render for No data', async () => {
    jest.spyOn(cdNGSVC, 'useListActivities').mockImplementation((): any => {
      return { data: {}, refetch: () => Promise.resolve({}) }
    })
    render(
      <TestWrapper
        path={routes.toSecretDetailsRuntimeUsage({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <RuntimeUsageList
          entityData={{}}
          gotoPage={jest.fn()}
          setPage={jest.fn()}
          setSearchTerm={jest.fn()}
          apiReturnProps={{
            refetch: () => Promise.resolve({}),
            loading: false,
            error: null
          }}
        />
      </TestWrapper>
    )

    const element = screen.queryByText('common.secret.noSecretRuntimeUsageData')
    expect(element).toBeVisible()
  })
  test('click scope dropwdown & render for data and check list items', async () => {
    jest.spyOn(cdNGSVC, 'useListActivities').mockImplementation((): any => {
      return { data: secretRuntimeUsageData, refetch: () => Promise.resolve(secretRuntimeUsageData) }
    })
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsReferences({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', orgIdentifier: 'default', secretId: 'secretId' }}
      >
        <RuntimeUsageList
          entityData={secretRuntimeUsageData as any}
          gotoPage={jest.fn()}
          setPage={jest.fn()}
          setSearchTerm={jest.fn()}
          apiReturnProps={{
            refetch: () => Promise.resolve({}),
            loading: false,
            error: null
          }}
        />
      </TestWrapper>
    )

    const filterDropdown = screen.getAllByTestId('dropdown-value')

    //Scope Filter Dropdown
    const scopeFilterDropdown = filterDropdown[1]
    expect(scopeFilterDropdown.innerHTML).toBe('common.scopeLabel')
    userEvent.click(scopeFilterDropdown)
    const scopePortalDivs = document.getElementsByClassName('bp3-menu')
    // Containing only Connector entity as of now
    await waitFor(() => {
      expect(scopePortalDivs.length).toBe(1)
      const entityFilterItems = document.querySelectorAll('label')
      expect(entityFilterItems.length).toBe(3)
      expect(entityFilterItems[0].innerHTML).toContain('account')
      expect(entityFilterItems[1].innerHTML).toContain('org')
      expect(entityFilterItems[2].innerHTML).toContain('project')
      userEvent.click(entityFilterItems[0])
    })

    const paginationElement = container.querySelector('div[class*="Pagination--pageSizeDropdown"]') as HTMLInputElement
    expect(paginationElement).toBeInTheDocument()

    // opening link of connector PreCertified_Instance and org
    const secretRuntimeUsageConnectorEntity = screen.getByText('PreCertified_Instance') as HTMLAnchorElement
    const secretRuntimeUsageProjectEntity = screen.getByText('orgId') as HTMLAnchorElement
    await waitFor(() => {
      userEvent.click(secretRuntimeUsageConnectorEntity)
      expect(window.open).toHaveBeenCalled()
      expect(window.open).toHaveBeenCalledWith(projectEntityUrl, '_blank')
    })

    await waitFor(() => {
      userEvent.click(secretRuntimeUsageProjectEntity)
      expect(window.open).toHaveBeenCalled()
      expect(window.open).toHaveBeenCalledWith(projectEntityUrl, '_blank')
    })
  })
  test('click entity dropdown & render data when search term does not match any data', async () => {
    jest.spyOn(cdNGSVC, 'useListActivities').mockImplementation((): any => {
      return { data: secretRuntimeUsageData, refetch: () => Promise.resolve({}) }
    })
    jest.spyOn(cdNGSVC, 'useGetUniqueReferredByEntities').mockImplementation((): any => {
      return {
        data: referredByEntities
      }
    })

    const setSearchTerm = jest.fn()
    const refetch = jest.fn()
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsReferences({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <RuntimeUsageList
          entityData={{}}
          gotoPage={jest.fn()}
          setPage={jest.fn()}
          setSearchTerm={setSearchTerm}
          apiReturnProps={{
            refetch: refetch,
            loading: false,
            error: null
          }}
        />
      </TestWrapper>
    )

    const filterDropdown = screen.getAllByTestId('dropdown-value')

    //Entity Filter Dropdown
    const entityFilterDropdown = filterDropdown[0]
    expect(entityFilterDropdown.innerHTML).toBe('entity')
    userEvent.click(entityFilterDropdown)
    const entityPortalDivs = document.getElementsByClassName('bp3-menu')
    // Containing only Connector entity as of now
    await waitFor(() => {
      expect(entityPortalDivs.length).toBe(1)
      const entityFilterItemOne = document.querySelectorAll('label')
      expect(entityFilterItemOne.length).toBe(1)
      expect(entityFilterItemOne[0].innerHTML).toContain('Connectors')
      userEvent.click(entityFilterItemOne[0])
    })

    const input = container.querySelector('input[type="search"]') as HTMLInputElement
    expect(input).toBeDefined()
    act(() => {
      userEvent.type(input, 'report')
    })
    await waitFor(() => expect(refetch).toHaveBeenCalled())
    const searchTermNoDataString = screen.queryByText('common.secret.noSecretRuntimeUsageOnQuery')
    await waitFor(() => {
      expect(searchTermNoDataString).toBeVisible()
    })
  })

  test('render data when search term matches any data', async () => {
    jest.spyOn(cdNGSVC, 'useListActivities').mockImplementation((): any => {
      return { data: secretRuntimeUsageData, refetch: () => Promise.resolve(secretRuntimeUsageData) }
    })

    const setSearchTerm = jest.fn()
    const refetch = jest.fn()
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsReferences({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <RuntimeUsageList
          entityData={secretRuntimeUsageData as any}
          gotoPage={jest.fn()}
          setPage={jest.fn()}
          setSearchTerm={setSearchTerm}
          apiReturnProps={{
            refetch: refetch,
            loading: false,
            error: null
          }}
        />
      </TestWrapper>
    )

    const input = container.querySelector('input[type="search"]') as HTMLInputElement
    expect(input).toBeDefined()
    act(() => {
      userEvent.type(input, 'Cert')
    })
    // Asserting data after search filter to have 3 items which is expected
    const connectorName = screen.queryAllByText('Certified_Instance')
    await waitFor(() => {
      expect(connectorName).toHaveLength(3)
    })
  })

  test('assert Paginations ', async () => {
    jest.spyOn(cdNGSVC, 'useListActivities').mockImplementation((): any => {
      return {
        data: entityPaginationDataRuntimeUsage,
        refetch: () => Promise.resolve(entityPaginationDataRuntimeUsage)
      }
    })

    const setSearchTerm = jest.fn()
    const refetch = jest.fn()
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsReferences({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <RuntimeUsageList
          entityData={secretRuntimeUsageData as any}
          gotoPage={jest.fn()}
          setPage={jest.fn()}
          setSearchTerm={setSearchTerm}
          apiReturnProps={{
            refetch: refetch,
            loading: false,
            error: null
          }}
        />
      </TestWrapper>
    )

    const paginationDropdownElement = screen.getAllByTestId('dropdown-value')[2]
    await waitFor(() => expect(paginationDropdownElement.innerHTML).toBe('50'))
    act(() => {
      userEvent.click(paginationDropdownElement)
    })
    const portalDivs = document.getElementsByClassName('bp3-menu')
    await waitFor(() => {
      expect(portalDivs.length).toBe(1)
    })
    const pageSizeTenElement = document.querySelectorAll('li.DropDown--menuItem')[0]
    expect(pageSizeTenElement.innerHTML).toBe('10')
    userEvent.click(pageSizeTenElement)
    await waitFor(() => {
      expect(portalDivs.length).toBe(0)
    })
    await waitFor(() => {
      expect(refetch).toHaveBeenCalled()
    })
    const nextButtonElement = container.querySelector('button[aria-label="Next"]') as HTMLInputElement
    expect(nextButtonElement).toBeDefined()
    act(() => {
      userEvent.click(nextButtonElement)
    })
    await waitFor(() => {
      expect(refetch).toHaveBeenCalled()
    })
  })
  test('test filterData function for Entity ', () => {
    const res = filterData('entity', [{ label: 'Connector', value: 'Connector' }])
    expect(res).toStrictEqual({ referredByEntityType: ['Connector'] })
  })
  test('test filterData function for Scope ', () => {
    const res = filterData('scope', [{ label: 'account', value: 'account' }])
    expect(res).toStrictEqual({ scopeFilter: ['account'] })
  })
})
