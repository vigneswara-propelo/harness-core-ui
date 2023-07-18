/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetDefaultCard, useCreateClientSecret, useSaveCard } from 'services/cd-ng'
import PaymentMethods from '../PaymentMethods'

jest.mock('services/cd-ng')

const useGetPrimaryCarddMock = useGetDefaultCard as jest.MockedFunction<any>
const useCreateClientSecretMock = useCreateClientSecret as jest.MockedFunction<any>
const useSaveCardMock = useSaveCard as jest.MockedFunction<any>
jest.mock('@common/components/ContainerSpinner/ContainerSpinner', () => ({
  ContainerSpinner: () => <span data-testid="container-spinner">Container Spinner</span>
}))

useCreateClientSecretMock.mockImplementation(() => {
  return {
    mutate: jest.fn(),
    loading: true
  }
})

useSaveCardMock.mockImplementation(() => {
  return {
    mutate: jest.fn()
  }
})
describe('billing page payment method', () => {
  useGetPrimaryCarddMock.mockImplementation(() => {
    return {
      data: '',
      refetch: jest.fn()
    }
  })
  test('adding new card', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <PaymentMethods />
      </TestWrapper>
    )
    const addText = getByText('authSettings.addCard')
    expect(addText).toBeTruthy()
    // click on add button

    fireEvent.click(addText)
    const spinner = getByText('Container Spinner')
    expect(spinner).toBeDefined()
    expect(container).toMatchSnapshot('payment method card snapshot')
  })
})
