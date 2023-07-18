/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, waitFor } from '@testing-library/react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetDefaultCard, useCreateClientSecret, useSaveCard } from 'services/cd-ng'
import { Editions, TimeType } from '@common/constants/SubscriptionTypes'
import CreditCardVerification from '../CreditCardVerification'
jest.mock('services/cd-ng')

const useGetPrimaryCarddMock = useGetDefaultCard as jest.MockedFunction<any>
const useCreateClientSecretMock = useCreateClientSecret as jest.MockedFunction<any>
const useSaveCardMock = useSaveCard as jest.MockedFunction<any>
useCreateClientSecretMock.mockImplementation(() => {
  return {
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementationOnce(() => {
      return {
        status: 'SUCCESS',
        data: 'sdaads'
      }
    })
  }
})

useSaveCardMock.mockImplementation(() => {
  return {
    mutate: jest.fn()
  }
})
useGetPrimaryCarddMock.mockImplementation(() => {
  return {
    data: '',
    refetch: jest.fn()
  }
})
const clientSecret = 'dummy secret'
const stripePromise = loadStripe('dummy promise')

describe('billing page payment method', () => {
  const setSubscriptionProps = jest.fn()
  let renderObj: RenderResult
  beforeEach(() => {
    renderObj = render(
      <TestWrapper>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CreditCardVerification
            subscriptionProps={{
              edition: Editions.ENTERPRISE,
              premiumSupport: true,
              paymentFreq: TimeType.MONTHLY,
              subscriptionId: 'sasdasd',
              billingContactInfo: {
                name: 'sdas',
                email: 'dasaas',
                billingAddress: 'ddasdasd',
                city: 'dadsa',
                state: 'dadas',
                country: 'asds',
                zipCode: 'dsada',
                companyName: 'sdadas'
              },
              paymentMethodInfo: {
                paymentMethodId: 'dsdas',
                cardType: 'sdadas',
                expireDate: 'dsdasd',
                last4digits: 'dsdadad',
                nameOnCard: ''
              },
              productPrices: { monthly: [], yearly: [] },
              isValid: true
            }}
            onClose={jest.fn()}
            clientSecret={'asdas'}
            setView={jest.fn()}
            setInvoiceData={jest.fn()}
            setSubscriptionProps={setSubscriptionProps}
          />
        </Elements>
      </TestWrapper>
    )
  })
  afterEach(() => {
    renderObj.unmount()
  })
  test('render payment method card', async () => {
    const { container, getByTestId } = renderObj
    expect(container).toMatchSnapshot('credit card verification')

    const a = await waitFor(() => getByTestId('nameOnCard'))
    expect(a).toBeDefined()
    await waitFor(() => expect(getByTestId('nameOnCard')).toHaveValue(''))
    await userEvent.type(a, 'J')
    await waitFor(() => {
      expect(setSubscriptionProps).toHaveBeenCalledWith({
        billingContactInfo: {
          billingAddress: 'ddasdasd',
          city: 'dadsa',
          companyName: 'sdadas',
          country: 'asds',
          email: 'dasaas',
          name: 'sdas',
          state: 'dadas',
          zipCode: 'dsada'
        },
        edition: 'ENTERPRISE',
        isValid: true,
        paymentFreq: 'Monthly',
        paymentMethodInfo: {
          cardType: 'sdadas',
          expireDate: 'dsdasd',
          last4digits: 'dsdadad',
          nameOnCard: 'J',
          paymentMethodId: 'dsdas'
        },
        premiumSupport: true,
        productPrices: { monthly: [], yearly: [] },
        subscriptionId: 'sasdasd'
      })
    })
  })
})
describe('billing page payment method', () => {
  const setSubscriptionProps = jest.fn()
  let renderObj: RenderResult
  beforeEach(() => {
    renderObj = render(
      <TestWrapper>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CreditCardVerification
            subscriptionProps={{
              edition: Editions.ENTERPRISE,
              premiumSupport: true,
              paymentFreq: TimeType.MONTHLY,
              subscriptionId: 'sasdasd',
              billingContactInfo: {
                name: 'sdas',
                email: 'dasaas',
                billingAddress: 'ddasdasd',
                city: 'dadsa',
                state: 'dadas',
                country: 'asds',
                zipCode: 'dsada',
                companyName: 'sdadas'
              },
              paymentMethodInfo: {
                paymentMethodId: 'dsdas',
                cardType: 'sdadas',
                expireDate: 'dsdasd',
                last4digits: 'dsdadad',
                nameOnCard: ''
              },
              productPrices: { monthly: [], yearly: [] },
              isValid: true
            }}
            onClose={jest.fn()}
            clientSecret={'asdas'}
            setView={jest.fn()}
            setInvoiceData={jest.fn()}
            setSubscriptionProps={setSubscriptionProps}
          />
        </Elements>
      </TestWrapper>
    )
  })
  afterEach(() => {
    renderObj.unmount()
  })

  test('render payment method card with undefined paymentmethod info', async () => {
    const { container, getByTestId } = renderObj
    expect(container).toMatchSnapshot('credit card verification')

    const a = await waitFor(() => getByTestId('nameOnCard'))
    expect(a).toBeDefined()
    await waitFor(() => expect(getByTestId('nameOnCard')).toHaveValue(''))
    await userEvent.type(a, 'J')
    await waitFor(() => {
      expect(setSubscriptionProps).toHaveBeenCalledWith({
        billingContactInfo: {
          billingAddress: 'ddasdasd',
          city: 'dadsa',
          companyName: 'sdadas',
          country: 'asds',
          email: 'dasaas',
          name: 'sdas',
          state: 'dadas',
          zipCode: 'dsada'
        },
        edition: 'ENTERPRISE',
        isValid: true,
        paymentFreq: 'Monthly',
        paymentMethodInfo: {
          cardType: 'sdadas',
          expireDate: 'dsdasd',
          last4digits: 'dsdadad',
          nameOnCard: 'J',
          paymentMethodId: 'dsdas'
        },
        premiumSupport: true,
        productPrices: { monthly: [], yearly: [] },
        subscriptionId: 'sasdasd'
      })
    })
  })
})
