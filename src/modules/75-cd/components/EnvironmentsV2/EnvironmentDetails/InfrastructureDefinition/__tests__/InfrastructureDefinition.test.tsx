/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import * as cdNgServices from 'services/cd-ng'

import routes from '@common/RouteDefinitions'
import { environmentPathProps, modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'

import InfrastructureDefinition from '../InfrastructureDefinition'

import mockInfrastructureList from './__mocks__/mockInfrastructureList.json'
import mockRemoteInfrastructureResponse from './__mocks__/mockRemoteInfrastructureResponse.json'

jest.mock('../InfrastructureModal', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-infra-modal" />
}))

jest.mock('@common/pages/entityUsage/EntityUsage', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-entity-setup-usage" />
}))

jest.mock(
  '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/BootstrapDeployInfraDefinitionWrapper',
  () => ({
    ...(jest.requireActual(
      '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/BootstrapDeployInfraDefinitionWrapper'
    ) as any),
    BootstrapDeployInfraDefinitionWrapperWithRef: () => {
      return <div data-testid="mock-bootstrap-deploy-infra-definition" />
    }
  })
)

const showSuccessMock = jest.fn()
const showErrorMock = jest.fn()

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: () => ({
    showSuccess: showSuccessMock,
    showError: showErrorMock
  })
}))
jest.spyOn(cdNgServices, 'useGetSettingValue').mockImplementation(() => {
  return { data: { data: { value: 'false' } } } as any
})

describe('Infrastructure Definition tests', () => {
  test('renders loading spinner', async () => {
    jest.spyOn(cdNgServices, 'useGetInfrastructureList').mockImplementation(() => {
      return {
        loading: true,
        error: undefined,
        data: undefined,
        refetch: jest.fn()
      } as any
    })

    render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          ...projectPathProps,
          ...modulePathProps,
          ...environmentPathProps
        })}
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'Env_1'
        }}
        queryParams={{ sectionId: 'INFRASTRUCTURE' }}
      >
        <InfrastructureDefinition isEnvPage />
      </TestWrapper>
    )

    await waitFor(() => expect(screen.queryByText('Loading, please wait...')).toBeInTheDocument())
  })

  test('displays error message', async () => {
    jest.spyOn(cdNgServices, 'useGetInfrastructureList').mockImplementation(() => {
      return {
        loading: false,
        error: {
          message: 'Failed to fetch'
        },
        data: undefined,
        refetch: jest.fn()
      } as any
    })

    const { container } = render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          ...projectPathProps,
          ...modulePathProps,
          ...environmentPathProps
        })}
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'Env_1'
        }}
        queryParams={{ sectionId: 'INFRASTRUCTURE' }}
      >
        <InfrastructureDefinition isEnvPage />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('displays no list, but shows 2 create buttons and opens modal on click ', async () => {
    jest.spyOn(cdNgServices, 'useGetInfrastructureList').mockImplementation(() => {
      return {
        loading: false,
        error: undefined,
        data: {
          data: {
            content: []
          }
        },
        refetch: jest.fn()
      } as any
    })

    const { container } = render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          ...projectPathProps,
          ...modulePathProps,
          ...environmentPathProps
        })}
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'Env_1'
        }}
        queryParams={{ sectionId: 'INFRASTRUCTURE' }}
      >
        <InfrastructureDefinition isEnvPage />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const createNewButtons = screen.queryAllByText('pipelineSteps.deploy.infrastructure.infraDefinition')
    expect(createNewButtons).toHaveLength(2)

    fireEvent.click(createNewButtons![0])
    await waitFor(() => expect(screen.getByTestId('mock-infra-modal')).toBeInTheDocument())
  })

  test('opens a modal on click of edit', async () => {
    jest.spyOn(cdNgServices, 'useGetInfrastructureList').mockImplementation(() => {
      return {
        loading: false,
        error: undefined,
        data: mockInfrastructureList,
        refetch: jest.fn()
      } as any
    })

    const { container } = render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          ...projectPathProps,
          ...modulePathProps,
          ...environmentPathProps
        })}
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'Env_1'
        }}
        queryParams={{ sectionId: 'INFRASTRUCTURE' }}
      >
        <InfrastructureDefinition isEnvPage />
      </TestWrapper>
    )

    const moreButton = container.querySelector('[data-icon="more"]')
    fireEvent.click(moreButton!)

    const menu = findPopoverContainer()
    expect(menu).toBeTruthy()

    const editButton = document.querySelector('[data-icon="edit"]')
    fireEvent.click(editButton!)
    await waitFor(() => expect(screen.getByTestId('mock-bootstrap-deploy-infra-definition')).toBeInTheDocument())
  })

  test('opens delete confirmation dialog and shows success toast on delete', async () => {
    jest.spyOn(cdNgServices, 'useGetInfrastructureList').mockImplementation(() => {
      return {
        loading: false,
        error: undefined,
        data: mockInfrastructureList,
        refetch: jest.fn()
      } as any
    })

    jest.spyOn(cdNgServices, 'useDeleteInfrastructure').mockImplementation(() => {
      return {
        mutate: jest.fn(() =>
          Promise.resolve({
            status: 'SUCCESS'
          })
        ),
        cancel: jest.fn(),
        loading: false,
        error: null
      } as any
    })

    const { container } = render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          ...projectPathProps,
          ...modulePathProps,
          ...environmentPathProps
        })}
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'Env_1'
        }}
        queryParams={{ sectionId: 'INFRASTRUCTURE' }}
      >
        <InfrastructureDefinition isEnvPage />
      </TestWrapper>
    )

    const moreButton = container.querySelector('[data-icon="more"]')
    fireEvent.click(moreButton!)

    const menu = findPopoverContainer()
    await waitFor(() => expect(menu).toBeTruthy())

    const deleteButton = document.querySelector('[data-icon="trash"]')
    fireEvent.click(deleteButton!)

    const dialog = findDialogContainer()
    await waitFor(() => expect(dialog).toBeTruthy())

    const confirmButton = dialog?.querySelector('.bp3-button-text')
    fireEvent.click(confirmButton!)

    await waitFor(() => expect(showSuccessMock).toHaveBeenCalled())
  })

  test('opens delete confirmation dialog and shows error toast on delete', async () => {
    jest.spyOn(cdNgServices, 'useGetInfrastructureList').mockImplementation(() => {
      return {
        loading: false,
        error: undefined,
        data: mockInfrastructureList,
        refetch: jest.fn()
      } as any
    })

    jest.spyOn(cdNgServices, 'useDeleteInfrastructure').mockImplementation(() => {
      return {
        mutate: jest.fn().mockRejectedValue(null),
        cancel: jest.fn(),
        loading: false,
        error: {
          message: 'Failed to delete'
        }
      } as any
    })

    const { container } = render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          ...projectPathProps,
          ...modulePathProps,
          ...environmentPathProps
        })}
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'Env_1'
        }}
        queryParams={{ sectionId: 'INFRASTRUCTURE' }}
      >
        <InfrastructureDefinition isEnvPage />
      </TestWrapper>
    )

    const moreButton = container.querySelector('[data-icon="more"]')
    fireEvent.click(moreButton!)

    const menu = findPopoverContainer()
    await waitFor(() => expect(menu).toBeTruthy())

    const deleteButton = document.querySelector('[data-icon="trash"]')
    fireEvent.click(deleteButton!)

    const dialog = findDialogContainer()
    await waitFor(() => expect(dialog).toBeTruthy())

    const confirmButton = dialog?.querySelector('.bp3-button-text')
    fireEvent.click(confirmButton!)

    await waitFor(() => expect(showErrorMock).toHaveBeenCalled())
  })

  test('test code source details present in listing page if CDS_INFRA_GITX flag is on', async () => {
    jest.spyOn(cdNgServices, 'useGetInfrastructureList').mockImplementation(() => {
      return {
        loading: false,
        error: undefined,
        data: mockInfrastructureList,
        refetch: jest.fn()
      } as any
    })

    const { container, getByText } = render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          ...projectPathProps,
          ...modulePathProps,
          ...environmentPathProps
        })}
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'Env_1'
        }}
        queryParams={{ sectionId: 'INFRASTRUCTURE' }}
        defaultFeatureFlagValues={{ CDS_INFRA_GITX: true }}
      >
        <InfrastructureDefinition isEnvPage />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="repository"]') as HTMLButtonElement).toBeInTheDocument() //Inline

    userEvent.hover(container.querySelector('[data-icon="remote-setup"]') as HTMLButtonElement) //Remote
    await waitFor(() => {
      expect(getByText('testRepo')).toBeInTheDocument()
    })
  })

  test('opens a modal on click of edit of remote infrastructure', async () => {
    jest.spyOn(cdNgServices, 'useGetInfrastructureList').mockImplementation(() => {
      return {
        loading: false,
        error: undefined,
        data: mockInfrastructureList,
        refetch: jest.fn()
      } as any
    })
    jest.spyOn(cdNgServices, 'useGetInfrastructure').mockImplementation(() => {
      return { data: mockRemoteInfrastructureResponse, error: null, loading: false } as any
    })

    const { container, getByTestId } = render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          ...projectPathProps,
          ...modulePathProps,
          ...environmentPathProps
        })}
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'Env_1'
        }}
        defaultFeatureFlagValues={{ CDS_INFRA_GITX: true }}
        queryParams={{
          sectionId: 'INFRASTRUCTURE',
          infraStoreType: 'REMOTE',
          infraConnectorRef: 'c1',
          infraRepoName: 'testRepo'
        }}
      >
        <InfrastructureDefinition isEnvPage />
      </TestWrapper>
    )

    const rows = container.querySelectorAll('div[role="row"]')
    expect(rows.length).toBe(6)

    const moreButton = getByTestId(`${mockRemoteInfrastructureResponse?.data?.infrastructure?.identifier}-more-button`)
    await waitFor(() => expect(moreButton).toBeInTheDocument())
    fireEvent.click(moreButton)
    const moreOptionPopover = findPopoverContainer()
    await waitFor(() => expect(moreOptionPopover).toBeInTheDocument())
    const editButton = getByTestId(`${mockRemoteInfrastructureResponse?.data?.infrastructure?.identifier}-edit-button`)
    fireEvent.click(editButton!)
    await waitFor(() => {
      expect(screen.getByTestId('mock-bootstrap-deploy-infra-definition')).toBeInTheDocument()
    })

    fireEvent.click(document.querySelector('[data-icon="cross"]') as HTMLElement)
    expect(rows.length).toBe(6)
  })
})
