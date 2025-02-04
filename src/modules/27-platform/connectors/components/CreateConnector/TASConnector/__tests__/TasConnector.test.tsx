/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { fireEvent, render, within, waitFor } from '@testing-library/react'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import { ConnectivityModeType } from '@common/components/ConnectivityMode/ConnectivityMode'
import TASConnector from '../TASConnector'
import { commonProps, connectorInfoMock, mockResponse, mockSecret, mockSecretList } from './mocks'

const updateConnector = jest.fn()
const createConnector = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateTags: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegateFromId: jest.fn().mockImplementation(() => jest.fn()),
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegatesUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

jest.mock('services/cd-ng', () => ({
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecretList)),
  validateTheIdentifierIsUniquePromise: jest.fn().mockImplementation(() => Promise.resolve(mockResponse)),
  useCreateConnector: jest.fn().mockImplementation(() => ({ mutate: createConnector })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateConnector })),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret)),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => jest.fn()),
  useGetFileContent: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useGetFileByBranch: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useCreatePR: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useCreatePRV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

describe('<TASConnector />', () => {
  afterEach(() => {
    createConnector.mockReset()
  })

  jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
    CDS_CF_TOKEN_AUTH: true
  })

  test('TAS Connector Wizard Steps Flow', async () => {
    const { getByText, container, getAllByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <TASConnector {...commonProps} isEditMode={false} connectorInfo={connectorInfoMock} mock={mockResponse} />
      </TestWrapper>
    )

    fireEvent.change(container.querySelector('input[name="name"]')!, {
      target: { value: 'Test TAS Connector' }
    })

    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })

    expect(getByText('small-tick')).toBeInTheDocument()
    // Validate next active step to be highlighted
    expect(container.querySelector('.StepWizard--activeStep p')?.textContent).toBe('credentials')
    const stepWizardDetailsSection = container.querySelector('.StepWizard--stepDetails')! as HTMLElement
    expect(within(stepWizardDetailsSection).queryByText('credentials')).toBeInTheDocument()

    // move to identifier step
    fireEvent.click(getByText('back')!)
    expect(container.querySelector('input[name="name"]')).toBeInTheDocument()
    // move to authentication step
    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })

    // Change Endpoint URL
    fireEvent.change(container.querySelector('input[name="endpointUrl"]')!, {
      target: { value: 'http://sample_url_tas.com/' }
    })

    // Change username
    fireEvent.change(container.querySelector('input[name="usernametextField"]')!, {
      target: { value: 'AdminUser' }
    })

    // Change token
    fireEvent.click(getAllByText('createOrSelectSecret')[0])

    await waitFor(() => getByText('common.entityReferenceTitle'))

    fireEvent.click(getByText('TasToken')!)

    fireEvent.click(getByText('entityReference.apply')!)
    expect(getByText('platform.secrets.secret.configureSecret')).toBeInTheDocument()
    expect(getByText('<TasToken>')).toBeInTheDocument()

    // Change refresh token
    fireEvent.click(getAllByText('createOrSelectSecret')[0])

    await waitFor(() => getByText('common.entityReferenceTitle'))

    fireEvent.click(getByText('TasTokenRefresh')!)

    fireEvent.click(getByText('entityReference.apply')!)
    expect(getAllByText('platform.secrets.secret.configureSecret')[1]).toBeInTheDocument()
    expect(getByText('<TasTokenRefresh>')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })

    fireEvent.click(getByText('common.connectThroughPlatformInfo')!)

    await act(async () => {
      fireEvent.click(getByText('saveAndContinue')!)
    })

    expect(createConnector).toBeCalledWith(
      {
        connector: {
          name: 'Test TAS Connector',
          identifier: 'Test_TAS_Connector',
          description: '',
          orgIdentifier: 'default',
          projectIdentifier: 'defaultproject',
          type: 'Tas',
          tags: {},
          spec: {
            credential: {
              type: 'ManualConfig',
              spec: {
                endpointUrl: 'http://sample_url_tas.com/',
                passwordRef: 'account.TasToken',
                username: 'AdminUser',
                refreshTokenRef: 'account.TasTokenRefresh'
              }
            },
            executeOnDelegate: false
          }
        }
      },
      {
        queryParams: {}
      }
    )
  })

  test('TAS Connector in edit mode and delegate selection flow ', async () => {
    const { getAllByText, getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <TASConnector
          {...commonProps}
          isEditMode
          connectorInfo={connectorInfoMock}
          mock={mockResponse}
          connectivityMode={ConnectivityModeType.Delegate}
        />
      </TestWrapper>
    )

    fireEvent.change(container.querySelector('input[name="name"]')!, {
      target: { value: 'Test TAS Connector' }
    })
    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })
    expect(getAllByText('<TasToken>').length).toBe(2)

    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })
    fireEvent.click(getByText('common.connectThroughDelegateInfo')!)

    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })

    expect(getByText('platform.connectors.delegate.configure')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(container.querySelector('input[value="DelegateOptions.DelegateOptionsAny"]')!)
    })

    await act(async () => {
      fireEvent.click(getByText('saveAndContinue')!)
    })

    expect(updateConnector).toBeCalledWith(
      {
        connector: {
          name: 'Test TAS Connector',
          identifier: 'tasConnector',
          description: 'test description',
          orgIdentifier: 'default',
          projectIdentifier: 'defaultproject',
          type: 'Tas',
          tags: { tag1: '', tag2: '', tag3: '' },
          spec: {
            credential: {
              type: 'ManualConfig',
              spec: {
                endpointUrl: 'http://sample_url.com/',
                passwordRef: 'tasToken',
                username: 'admin',
                refreshTokenRef: 'tasTokenRefresh'
              }
            },
            executeOnDelegate: true,
            delegateSelectors: []
          }
        }
      },
      {
        queryParams: {}
      }
    )
  })
})
