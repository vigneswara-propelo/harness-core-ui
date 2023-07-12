/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// tells jest we intent to mock CVConnectorHOC and use mock in __mocks__
jest.mock('../../CommonCVConnector/CVConnectorHOC')

import React, { useEffect } from 'react'
import { noop } from 'lodash-es'
import { useFormikContext } from 'formik'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Container } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { onNextMock } from '../../CommonCVConnector/__mocks__/CommonCVConnectorMocks'

jest.mock('@secrets/utils/SecretField', () => ({
  setSecretField: async () => ({
    identifier: 'secretIdentifier',
    name: 'secretName',
    referenceString: 'testReferenceString'
  })
}))

// file that imports mocked component must be placed after jest.mock
import CreateSplunkConnector from '../CreateSplunkConnector'

const SplunkURL = 'https://splunk.com/api/v1/'

jest.mock('../../CommonCVConnector/components/ConnectorSecretField/ConnectorSecretField', () => ({
  ...(jest.requireActual('../../CommonCVConnector/components/ConnectorSecretField/ConnectorSecretField') as any),
  ConnectorSecretField: function MockComponent(b: any) {
    const { setFieldValue: formikSetValue } = useFormikContext()
    useEffect(() => {
      formikSetValue(b.secretInputProps.name, {
        identifier: 'abc',
        name: 'abc',
        referenceString: 'account.abc',
        accountIdentifier: 'acc123'
      })
    }, [])
    return <Container data-testid="passwordRefField" className="secret-mock"></Container>
  }
}))

jest.mock('@secrets/components/SecretInput/SecretInput', () => ({
  ...(jest.requireActual('@secrets/components/SecretInput/SecretInput') as any),
  default: function MockComponent() {
    const { setFieldValue: formikSetValue } = useFormikContext()
    useEffect(() => {
      formikSetValue('tokenRef', {
        identifier: 'abc',
        name: 'abc',
        referenceString: 'account.secretToken',
        accountIdentifier: 'acc123'
      })
    }, [])

    return <Container data-testid="SecretInput" className="secret-mock"></Container>
  }
}))

describe('Unit tests for createAppdConnector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Ensure validation works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateSplunkConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={undefined}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())
    // click submit and verify validation string is visible for user name auth type
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => expect(getByText('common.validation.urlIsRequired')).not.toBeNull())
    expect(getByText('validation.username')).not.toBeNull()
    expect(screen.getByTestId(/passwordRefField/)).not.toBeNull()

    expect(onNextMock).not.toHaveBeenCalled()
  })

  test('Ensure create flow works for username password', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateSplunkConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={undefined}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())

    // fill out fields and compare payload
    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'url',
      value: 'https://sdfs.com'
    })
    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'username',
      value: 'splunkUsername'
    })

    // click submit and verify submitted data
    await userEvent.click(container.querySelector('button[type="submit"]')!)

    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        authType: 'UsernamePassword',
        orgIdentifier: 'dummyOrgId',
        passwordRef: {
          accountIdentifier: 'acc123',
          identifier: 'abc',
          name: 'abc',
          referenceString: 'account.abc'
        },
        projectIdentifier: 'dummyProjectId',
        tokenRef: undefined,
        url: 'https://sdfs.com',
        username: 'splunkUsername'
      })
    )
  })

  test('Ensure if there is existing data, fields are populated', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateSplunkConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={
            {
              name: 'splunkConnector',
              identifier: 'accountSplunkConnector',
              description: '',
              accountId: 'dummyAccountId',
              orgIdentifier: 'dummyOrgId',
              passwordRef: {
                accountIdentifier: 'acc123',
                identifier: 'abc',
                name: 'abc',
                referenceString: 'account.abc'
              },
              projectIdentifier: 'dummyProjectId',
              url: SplunkURL,
              username: 'splunkUsername',
              tags: {},
              type: 'Splunk',
              delegateSelectors: []
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())

    // expect recieved value to be there
    expect(document.body.querySelector(`input[value="${SplunkURL}"]`)).not.toBeNull()
    expect(document.body.querySelector(`input[value="splunkUsername"]`)).not.toBeNull()

    // update it with new value
    await setFieldValue({ container, fieldId: 'url', value: 'http://sfsfsf.com', type: InputTypes.TEXTFIELD })
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'username',
      value: 'updated_userename'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        authType: 'UsernamePassword',
        delegateSelectors: [],
        description: '',
        identifier: 'accountSplunkConnector',
        name: 'splunkConnector',
        orgIdentifier: 'dummyOrgId',
        passwordRef: {
          accountIdentifier: 'acc123',
          identifier: 'abc',
          name: 'abc',
          referenceString: 'account.abc'
        },
        projectIdentifier: 'dummyProjectId',
        tags: {},
        tokenRef: undefined,
        type: 'Splunk',
        url: 'http://sfsfsf.com',
        username: 'updated_userename'
      })
    )
  })

  test('Ensure edit flow works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateSplunkConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={
            {
              name: 'dasdadasdasda',
              identifier: 'dasdadasdasda',
              description: '',
              orgIdentifier: 'default',
              projectIdentifier: 'Test_101',
              tags: {},
              type: 'Splunk',
              spec: {
                passwordRef: {
                  identifier: 'abc',
                  name: 'abc',
                  referenceString: 'account.abc',
                  accountIdentifier: 'acc123'
                },
                splunkUrl: 'https://sdfs.com',
                username: 'splunkUsername',
                delegateSelectors: []
              }
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())

    // expect recieved value to be there
    expect(container.querySelector(`input[value="https://sdfs.com"]`)).not.toBeNull()
    // update it with new value
    await setFieldValue({ container, fieldId: 'url', value: 'http://dgdgtrty.com', type: InputTypes.TEXTFIELD })
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'username',
      value: 'new_and_updateduser'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        authType: 'UsernamePassword',
        description: '',
        identifier: 'dasdadasdasda',
        name: 'dasdadasdasda',
        orgIdentifier: 'dummyOrgId',
        passwordRef: {
          accountIdentifier: 'acc123',
          identifier: 'abc',
          name: 'abc',
          referenceString: 'account.abc'
        },
        projectIdentifier: 'dummyProjectId',
        spec: {
          delegateSelectors: [],
          passwordRef: {
            accountIdentifier: 'acc123',
            identifier: 'abc',
            name: 'abc',
            referenceString: 'account.abc'
          },
          splunkUrl: 'https://sdfs.com',
          username: 'splunkUsername'
        },
        tags: {},
        tokenRef: undefined,
        type: 'Splunk',
        url: 'http://dgdgtrty.com',
        username: 'new_and_updateduser'
      })
    )
  })

  test('Shoud test if No Auth option is selected, then no auth fields are rendered', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateSplunkConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={
            {
              name: 'dasdadasdasda',
              identifier: 'dasdadasdasda',
              description: '',
              orgIdentifier: 'default',
              projectIdentifier: 'Test_101',
              tags: {},
              type: 'Splunk',
              spec: {
                type: 'Anonymous',
                splunkUrl: 'https://sdfs.com',
                delegateSelectors: []
              }
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())

    // expect recieved value to be there
    expect(container.querySelector(`input[value="https://sdfs.com"]`)).not.toBeNull()
    expect(container.querySelector(`input[value="connectors.elk.noAuthentication"]`)).not.toBeNull()

    expect(document.body.querySelector(`input[name="username"]`)).toBeNull()

    fireEvent.click(container.querySelector('button[type="submit"]')!)

    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        authType: 'Anonymous',
        description: '',
        identifier: 'dasdadasdasda',
        name: 'dasdadasdasda',
        orgIdentifier: 'dummyOrgId',
        passwordRef: undefined,
        projectIdentifier: 'dummyProjectId',
        spec: { delegateSelectors: [], splunkUrl: 'https://sdfs.com', type: 'Anonymous' },
        tags: {},
        tokenRef: undefined,
        type: 'Splunk',
        url: 'https://sdfs.com',
        username: undefined
      })
    )
  })
})
