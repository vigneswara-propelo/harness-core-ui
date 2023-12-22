/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import type { ResponseSecretValidationResultDTO, SSHKeyValidationMetadata } from 'services/cd-ng'
import VerifySecret from '@secrets/modals/CreateSSHCredModal/views/VerifySecret'
import { useValidateSecret } from 'services/cd-ng'
import { useGetDelegatesStatus } from 'services/portal'

const responseSecretValidationError: ResponseSecretValidationResultDTO = {
  status: 'ERROR',
  data: { success: false },
  metaData: {}
}

const responseSecretValidation: ResponseSecretValidationResultDTO = {
  status: 'SUCCESS',
  data: { success: true },
  metaData: {}
}

jest.mock('services/cd-ng')
jest.mock('services/portal')

const useValidateSecretMock = useValidateSecret as jest.MockedFunction<any>

const delegateResponse = {
  metaData: {},
  resource: true,
  responseMessages: []
}

const useGetDelegatesStatusMock = useGetDelegatesStatus as jest.MockedFunction<any>

useGetDelegatesStatusMock.mockImplementation(() => {
  return { data: delegateResponse, refetch: jest.fn(), error: null, loading: false }
})

describe('Create WinRm Cred Wizard Step Verify', () => {
  test('Test for winrm step verify success', async () => {
    useValidateSecretMock.mockImplementation(() => {
      return {
        mutate: jest.fn(() => Promise.resolve(responseSecretValidationError)),
        cancel: jest.fn(),
        loading: false
      }
    })
    const { findByText } = render(
      <TestWrapper>
        <VerifySecret onFinish={jest.fn()} identifier="dummy" validationMetadata={{} as SSHKeyValidationMetadata} />
      </TestWrapper>
    )

    const error = await findByText('error')
    expect(error).toBeInTheDocument()
  })
  test('Test for winrm step verify error', async () => {
    useValidateSecretMock.mockImplementation(() => {
      return {
        mutate: jest.fn(() => Promise.resolve(responseSecretValidation)),
        cancel: jest.fn(),
        loading: false
      }
    })
    const { findByText } = render(
      <TestWrapper>
        <VerifySecret onFinish={jest.fn()} identifier="dummy" validationMetadata={{} as SSHKeyValidationMetadata} />
      </TestWrapper>
    )

    const secondStep = await findByText('platform.secrets.createSSHCredWizard.verifyStepTwo')
    expect(secondStep).toBeInTheDocument()
  })
})
