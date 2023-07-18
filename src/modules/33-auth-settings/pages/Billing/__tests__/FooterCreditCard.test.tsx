/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useSaveCard } from 'services/cd-ng'
import { FooterCreditCard } from '../FooterCreditCard'

jest.mock('services/cd-ng')

const useSaveCardMock = useSaveCard as jest.MockedFunction<any>

useSaveCardMock.mockImplementation(() => {
  return {
    mutate: jest.fn()
  }
})
const mockPaymentRequest = jest.fn()

const mockStripe = {
  paymentRequest: mockPaymentRequest
}
const mockElements = {
  getElement: jest.fn()
}
jest.mock('@stripe/react-stripe-js', () => ({
  useStripe: jest.fn(() => mockStripe),
  useElements: jest.fn(() => mockElements)
}))

describe('billing page payment method', () => {
  test('render payment method card', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <FooterCreditCard subscriptionId="" isValid={true} onClose={jest.fn()} clientSecret="" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot('payment method card snapshot')

    // calling the cancel function

    const cancelButton = getByText('cancel')
    expect(cancelButton).toBeTruthy()
    fireEvent.click(cancelButton)

    // calling the save button

    const saveButton = getByText('authSettings.setAsDefaultCard')
    expect(saveButton).toBeTruthy()
    fireEvent.click(saveButton)
  })
})
