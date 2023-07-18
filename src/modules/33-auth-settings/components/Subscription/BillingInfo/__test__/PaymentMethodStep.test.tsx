/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { TestWrapper } from '@common/utils/testUtils'
import { Editions, TimeType } from '@common/constants/SubscriptionTypes'
import { useGetDefaultCard, useUpdateBilling, useSaveCard } from 'services/cd-ng'
import PaymentMethodStep from '../../PaymentMethod/PaymentMethodStep'

const clientSecret = 'dummy secret'
const stripePromise = loadStripe('dummy promise')

jest.mock('services/cd-ng')

const useGetDefaultCardMock = useGetDefaultCard as jest.MockedFunction<any>
useGetDefaultCardMock.mockImplementation(() => {
  return {
    data: {
      correlationId: 'dummy',
      data: {
        last4: '2345',
        brand: 'visa',
        expireMonth: '12',
        expireYear: '2023'
      },
      metaData: null,
      status: 'SUCCESS'
    }
  }
})
const useUpdateBillingMock = useUpdateBilling as jest.MockedFunction<any>
useUpdateBillingMock.mockImplementation(() => {
  return {
    mutate: jest.fn()({})
  }
})
const useSaveCardMock = useSaveCard as jest.MockedFunction<any>
useSaveCardMock.mockImplementation(() => {
  return {
    mutate: jest.fn()({})
  }
})
describe('BillingInfo', () => {
  const setView = jest.fn()
  test('paymen method step intiial rendering test cases', async () => {
    const { container } = render(
      <TestWrapper>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentMethodStep
            subscriptionProps={{
              edition: Editions.ENTERPRISE,
              premiumSupport: true,
              paymentFreq: TimeType.YEARLY,
              subscriptionId: 'abcd',
              billingContactInfo: {
                name: 'acd',
                email: 'dafa',
                billingAddress: 'dfadfas',
                city: 'asd',
                state: 'sd',
                country: 'dss',
                zipCode: 'dasa',
                companyName: 'sdsad'
              },
              paymentMethodInfo: {
                paymentMethodId: 'sdsaa',
                cardType: 'visa',
                expireDate: '09/12',
                last4digits: '1232',
                nameOnCard: 'abcd'
              },
              productPrices: { monthly: [], yearly: [] },
              isValid: true
            }}
            setView={setView}
            setInvoiceData={jest.fn()}
            setSubscriptionProps={jest.fn()}
            className=""
            module={'ci'}
          />
        </Elements>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot('payment step  method  getting rendered')
  })
})
